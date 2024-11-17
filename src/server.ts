import cluster from 'cluster';
import os from 'os';
import { server } from './app';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
    console.log(`Processo principal ${process.pid} está em execução`);

    if (numCPUs > 0) {
        for (let i = 0; i < numCPUs; i++) {
            cluster.fork();
        }
    } else {
        console.error('Nenhuma CPU disponível para forkar processos.');
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`O worker ${worker.process.pid} morreu. Código: ${code}, Sinal: ${signal}`);
        cluster.fork();
    });

    cluster.on('error', (err) => {
        console.error('Erro ao criar um worker:', err);
    });
} else {
    try {
        server.listen(3001, '0.0.0.0', () => {
            console.log(`Worker ${process.pid} iniciado e ouvindo na porta 3001`);
        });
    } catch (error) {
        console.error(`Erro ao iniciar o worker ${process.pid}:`, error);
    }
}
