import express from 'express';
import mongoose from 'mongoose';
import { routes } from './routes';
import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-redis-store';
import { register } from './metrics/metrics';
import messageQueue from './queues/messageQueue';
import socketService from './socket/socketService';
import http from 'http';

class App {
    public express: express.Application;
    public cache: any;
    public server: http.Server;

    constructor() {
        this.express = express();
        this.server = http.createServer(this.express);
        this.middleware();
        this.database();
        this.cacheSetup();
        this.routes();
        this.setupMetricsEndpoint();
        this.inicializeQueue();
        this.socketSetup();
    }

    public middleware() {
        this.express.use(express.json());
    }

    public async database() {
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/mtg-api', {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4, // Use IPv4, skip trying IPv6
            });
            
            // Configurar listeners para a conexão
            mongoose.connection.on('connected', () => {
                console.log('Mongoose conectado ao MongoDB');
            });

            mongoose.connection.on('error', (err) => {
                console.error('Erro na conexão Mongoose:', err);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Mongoose desconectado do MongoDB');
                // Tentar reconectar após 5 segundos
                setTimeout(this.database.bind(this), 5000);
            });

            console.log('Conexão com o banco de dados estabelecida com sucesso');
            console.log('Banco atual:', mongoose.connection.db.databaseName);
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Erro ao conectar na base de dados:', error.message);
                // Tentar reconectar após 5 segundos
                setTimeout(this.database.bind(this), 5000);
            } else {
                console.error('Erro desconhecido ao conectar na base de dados');
            }
        }
    }

    public cacheSetup() {
        try {
            this.cache = cacheManager.caching({
                store: redisStore,
                host: 'localhost',
                port: 6379,
                ttl: 60,
                retry_strategy: function(options: any) {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        // Endpoint está indisponível - tentar reconectar após 1 segundo
                        return 1000;
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        // Terminar após 1 hora de tentativas
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        // Terminar após 10 tentativas
                        return undefined;
                    }
                    // Reconectar após
                    return Math.min(options.attempt * 100, 3000);
                }
            });
            console.log('Cache configurado com sucesso');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Erro ao configurar o cache:', error.message);
            } else {
                console.error('Erro desconhecido ao configurar o cache');
            }
        }
    }

    public routes() {
        this.express.use((req, res, next) => {
            req.cache = this.cache;
            next();
        });
        this.express.use(routes);
    }

    private setupMetricsEndpoint() {
        this.express.get('/metrics', async (req, res) => {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        });
    }

    private async inicializeQueue() {
        try {
            await messageQueue.connect();
            console.log('Fila conectada...');
        } catch (e) {
            console.error('Erro ao conectar à fila:', e);
            // Tentar reconectar após 5 segundos
            setTimeout(this.inicializeQueue.bind(this), 5000);
        }
    }

    public socketSetup() {
        socketService.initialize(this.server);
    }
}

const app = new App();
export const server = app.server;
export default app.express;