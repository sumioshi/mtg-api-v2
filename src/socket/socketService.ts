import { Server } from 'socket.io';

class SocketService {
    private io: Server | null = null;

    initialize(server: any) {
        if (this.io) {
            console.log('Socket.IO já inicializado');
            return;
        }

        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        this.io.on('connection', (socket) => {
            console.log(`Usuário conectado: ${socket.id}`);

            socket.on('join', (data) => {
                try {
                    console.log('Evento join recebido:', data);

                    if (!data || !data.userId) {
                        console.error('Dados inválidos recebidos no evento join:', data);
                        socket.emit('error', { message: 'Dados inválidos para o evento join' });
                        return;
                    }

                    console.log(`Usuário ${data.userId} entrou no canal.`);
                    socket.join(data.userId); // Adiciona o usuário à sala
                    socket.emit('join_success', { message: `Bem-vindo, usuário ${data.userId}` }); // Envia confirmação
                } catch (error) {
                    console.error('Erro no evento join:', error);
                    socket.emit('error', { message: 'Erro interno no servidor' });
                }
            });

            socket.on('disconnect', (reason) => {
                console.log(`Usuário desconectado: ${socket.id}. Motivo: ${reason}`);
            });
        });

        console.log('Socket.IO inicializado');
    }

    notifyUser(userId: string, message: string) {
        if (this.io) {
            console.log(`Enviando notificação para ${userId}: ${message}`);
            this.io.to(userId).emit('notification', message);
        } else {
            console.error('Socket.IO não inicializado');
        }
    }
}

export default new SocketService();
