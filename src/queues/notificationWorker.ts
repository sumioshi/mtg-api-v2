import messageQueue from '../queues/messageQueue';
import socketService from '../socket/socketService';

async function processNotification(msg: any) {
    try {
        const { userId, message } = JSON.parse(msg.content.toString());

        socketService.notifyUser(userId, message);

        messageQueue.acknowledgeMessage(msg);
    } catch (error) {
        console.error('Erro ao processar notificação:', error);
    }
}

async function startNotificationWorker() {
    try {
        await messageQueue.connect();
        await messageQueue.consumeFromQueue('deck_updates_queue', (msg) => {
            if (msg) processNotification(msg);
        });
    } catch (error) {
        console.error('Erro ao iniciar worker de notificações:', error);
    }
}

startNotificationWorker();
