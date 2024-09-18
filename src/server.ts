import cluster from 'cluster';
import os from 'os';
import app from './app';

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); 
    });
} else {
    app.listen(3001, '0.0.0.0', () => {
        console.log(`Worker ${process.pid} started`);
    });
}
