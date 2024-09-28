import express from 'express';
import mongoose from 'mongoose';
import { routes } from './routes';
import cacheManager from 'cache-manager';
import redisStore from 'cache-manager-redis-store';

class App {
    public express: express.Application;
    public cache: any;

    constructor() {
        this.express = express();
        this.middleware();
        this.database();
        this.cacheSetup();
        this.routes();
    }

    public middleware() {
        this.express.use(express.json());
    }

    public async database() {
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017/cardsCommander', {
                serverSelectionTimeoutMS: 5000 // Adicionando timeout para conexão
            });
            console.log('Conexão com o banco de dados estabelecida com sucesso');
        } catch (error) {
            console.error('Erro ao conectar na base de dados:', error.message); // Melhorando a mensagem de erro
        }
    }

    public cacheSetup() {
        try {
            this.cache = cacheManager.caching({
                store: redisStore,
                host: 'localhost',
                port: 6379,
                ttl: 60
            });
            console.log('Cache configurado com sucesso');
        } catch (error) {
            console.error('Erro ao configurar o cache:', error.message); // Melhor tratamento de erro
        }
    }

    public routes() {
        this.express.use((req, res, next) => {
            req.cache = this.cache;
            next();
        });
        this.express.use(routes);
    }
}

export default new App().express; 
