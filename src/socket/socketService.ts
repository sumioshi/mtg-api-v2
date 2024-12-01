import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketService {
    public io: Server | null = null;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    initialize(httpServer: HttpServer) {
        if (this.io) {
            console.log('Socket.IO já inicializado');
            return;
        }

        this.io = new Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000,
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000,
            }
        });

        this.setupEventHandlers();
        console.log('Socket.IO inicializado');
    }

    private setupEventHandlers() {
        if (!this.io) return;

        this.io.on('connection', (socket: Socket) => {
            console.log(`Usuário conectado: ${socket.id}`);

            // Reconectar usuário se houver ID anterior
            const previousUserId = socket.handshake.auth.userId;
            if (previousUserId) {
                this.connectedUsers.set(previousUserId, socket.id);
                socket.join(previousUserId);
                console.log(`Usuário ${previousUserId} reconectado no socket ${socket.id}`);
            }

            socket.on('join', (data: { userId: string }) => {
                if (!data?.userId) {
                    console.warn(`Socket ${socket.id} tentou se conectar sem fornecer userId`);
                    return;
                }

                // Armazenar userId no socket para reconexão
                socket.data.userId = data.userId;
                
                // Limpar conexões antigas do mesmo usuário
                this.connectedUsers.forEach((oldSocketId, userId) => {
                    if (userId === data.userId && oldSocketId !== socket.id) {
                        console.log(`Removendo socket antigo ${oldSocketId} para usuário ${userId}`);
                        this.connectedUsers.delete(userId);
                    }
                });

                this.connectedUsers.set(data.userId, socket.id);
                socket.join(data.userId);
                console.log(`Usuário ${data.userId} conectado no socket ${socket.id}`);
                console.log('Usuários conectados:', Array.from(this.connectedUsers.entries()));
            });

            socket.on('disconnect', () => {
                const userId = socket.data.userId;
                if (userId && this.connectedUsers.get(userId) === socket.id) {
                    this.connectedUsers.delete(userId);
                    console.log(`Usuário ${userId} desconectado do socket ${socket.id}`);
                    console.log('Usuários restantes:', Array.from(this.connectedUsers.entries()));
                }
            });

            socket.on('error', (error) => {
                console.error(`Erro no socket ${socket.id}:`, error);
            });
        });
    }

    notifyUser(userId: string, message: any) {
        if (!this.io) {
            console.error('Socket.IO não inicializado. Notificação abortada.');
            return;
        }
    
        try {
            console.log('Tentando notificar usuário:', userId);
            console.log('Usuários conectados:', Array.from(this.connectedUsers.entries()));
            
            const socketId = this.connectedUsers.get(userId);
            if (socketId) {
                console.log(`Emitindo notificação para socketId ${socketId} do usuário ${userId}`);
                this.io.to(socketId).emit('notification', message);
                console.log('Conteúdo da notificação:', message);
            } else {
                console.warn(`Usuário ${userId} não conectado. Notificação perdida.`);
                // Tentar enviar para todas as conexões do usuário
                this.io.to(userId).emit('notification', message);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }    

    // Método para debug
    getConnectedUsers() {
        return Array.from(this.connectedUsers.entries());
    }
}

export default new SocketService();
