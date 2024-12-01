import os from 'os';
import cluster from 'cluster';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import app, { server } from './app';
import socketService from './socket/socketService';  // Adicione esta linha


const numCPUs = os.cpus().length;

async function startServer() {
    if (cluster.isPrimary) {
        console.log(`Processo principal ${process.pid} está em execução`);

        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} morreu. Código: ${code}, Sinal: ${signal}`);
            cluster.fork();
        });

        cluster.on('error', (err) => {
            console.error('Erro ao criar um worker:', err);
        });
    } else {
        try {
            // Configuração do Redis para Socket.IO
            const pubClient = createClient({ url: 'redis://localhost:6379' });
            const subClient = pubClient.duplicate();

            Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
                socketService.io?.adapter(createAdapter(pubClient, subClient));
                console.log('Socket.IO Redis adapter configurado');
            });

            const PORT = parseInt(process.env.PORT || '3001');
            server.listen(PORT, () => {
                console.log(`Worker ${process.pid} iniciado e ouvindo na porta ${PORT}`);
            });

        } catch (error) {
            console.error(`Erro ao iniciar o worker ${process.pid}:`, error);
            process.exit(1);
        }
    }
}

startServer().catch((error) => {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
});