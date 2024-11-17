import messageQueue from './messageQueue';
import socketService from '../socket/socketService';

async function startDeckUpdateWorker() {
    await messageQueue.connect();
    await messageQueue.consumeFromQueue('deck_updates_queue', (msg) => {
        if (msg) {
            const { deckId, userId } = JSON.parse(msg.content.toString());
            socketService.notifyUser(userId, `Seu deck de ID ${deckId} foi atualizado com sucesso.`);
        }
    });
}

startDeckUpdateWorker();
