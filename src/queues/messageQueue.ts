import amqp from 'amqplib';

class MessageQueue {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    async connect() {
        this.connection = await amqp.connect('amqp://localhost');
        this.channel = await this.connection.createChannel();
    }

    async sendToQueue(queue: string, message: any, options?: { priority?: number }) {
        if (!this.channel) throw new Error("RabbitMQ channel not initialized");
        await this.channel.assertQueue(queue, { 
            durable: true,
            maxPriority: 10 
        });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), options);
    }

    async consumeFromQueue(queue: string, callback: (msg: amqp.ConsumeMessage | null) => void) {
        if (!this.channel) throw new Error("RabbitMQ channel not initialized");
        await this.channel.assertQueue(queue, { 
            durable: true,
            maxPriority: 10 
        });
        this.channel.consume(queue, callback, { noAck: false });
    }

    acknowledgeMessage(msg: amqp.ConsumeMessage) {
        if (this.channel) {
            this.channel.ack(msg); 
        }
    }

    closeConnection() {
        if (this.connection) {
            this.connection.close();
        }
    }
}

export default new MessageQueue();
