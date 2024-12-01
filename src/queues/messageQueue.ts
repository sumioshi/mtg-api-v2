import amqp, { Channel, Connection, Options } from 'amqplib';

class MessageQueue {
    private connection: Connection | null = null;
    private channel: Channel | null = null;

    async connect() {
        if (!this.connection) {
            try {
                this.connection = await amqp.connect('amqp://localhost');
                this.channel = await this.connection.createChannel();
                console.log('Conexão com RabbitMQ estabelecida com sucesso.');
            } catch (error) {
                console.error('Erro ao conectar ao RabbitMQ:', error);
                throw new Error('Erro ao conectar ao RabbitMQ');
            }
        }
    }

    async sendToQueue(queueName: string, message: string | object, options: Options.Publish = {}) {
        if (!this.channel) {
            console.error('RabbitMQ channel não inicializado');
            throw new Error('RabbitMQ channel não inicializado');
        }

        try {
            await this.channel.assertQueue(queueName, {
                durable: true,
                arguments: queueName === 'deck_import_queue' ? { 'x-max-priority': 10 } : undefined,
            });

            const messageBuffer =
                typeof message === 'string' ? Buffer.from(message) : Buffer.from(JSON.stringify(message));

            this.channel.sendToQueue(queueName, messageBuffer, options);
            console.log(`Mensagem enviada para a fila "${queueName}":`, message);
        } catch (error) {
            console.error(`Erro ao enviar mensagem para a fila ${queueName}:`, error);
            throw error;
        }
    }

    async consumeFromQueue(queueName: string, callback: (msg: amqp.ConsumeMessage | null) => void) {
        if (!this.channel) {
            console.error('RabbitMQ channel não inicializado');
            throw new Error('RabbitMQ channel não inicializado');
        }

        try {
            await this.channel.assertQueue(queueName, {
                durable: true,
                arguments: queueName === 'deck_import_queue' ? { 'x-max-priority': 10 } : undefined,
            });
            
            this.channel.consume(queueName, (msg) => {
                if (msg) {
                    callback(msg);
                } else {
                    console.warn('Mensagem nula recebida da fila.');
                }
            }, { noAck: false });
            
            console.log(`Consumindo mensagens da fila "${queueName}".`);
        } catch (error) {
            console.error(`Erro ao consumir mensagens da fila ${queueName}:`, error);
            throw error;
        }
    }

    acknowledgeMessage(msg: amqp.ConsumeMessage) {
        if (!this.channel) {
            console.error('RabbitMQ channel não inicializado');
            throw new Error('RabbitMQ channel não inicializado');
        }

        try {
            this.channel.ack(msg);
            console.log(`Mensagem reconhecida: ${msg.content.toString()}`);
        } catch (error) {
            console.error('Erro ao reconhecer mensagem:', error);
        }
    }
}

export default new MessageQueue();