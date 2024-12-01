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
        });

        this.setupEventHandlers();
        console.log('Socket.IO inicializado');
    }

    private setupEventHandlers() {
        if (!this.io) return;

        this.io.on('connection', (socket: Socket) => {
            console.log(`Usuário conectado: ${socket.id}`);

            socket.on('join', (data: { userId: string }) => {
                if (!data?.userId) {
                    console.warn(`Socket ${socket.id} tentou se conectar sem fornecer userId`);
                    return;
                }

                this.connectedUsers.set(data.userId, socket.id);
                socket.join(data.userId);
                console.log(`Usuário ${data.userId} conectado no socket ${socket.id}`);
            });

            socket.on('disconnect', () => {
                this.connectedUsers.forEach((socketId, userId) => {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        console.log(`Usuário ${userId} desconectado do socket ${socket.id}`);
                    }
                });
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
            const socketId = this.connectedUsers.get(userId);
            if (socketId) {
                console.log(`Emitindo notificação para socketId ${socketId} do usuário ${userId}`);
                this.io.to(socketId).emit('notification', message);
                console.log('Conteúdo da notificação:', message);
            } else {
                console.warn(`Usuário ${userId} não conectado. Notificação perdida.`);
            }
        } catch (error) {
            console.error('Erro ao enviar notificação:', error);
        }
    }    
}

export default new SocketService();