import messageQueue from './messageQueue';
import socketService from '../socket/socketService';
import cardsService from '../service/cards.service';
import { recordImportDuration, incrementImportCount } from '../metrics/metrics';

async function processDeckImport(msg: any) {
    const { deckData, userId } = JSON.parse(msg.content.toString());
    const start = Date.now();

    try {
        const deck = await cardsService.createDeck(deckData.commander, deckData.cards, userId);
        await messageQueue.sendToQueue('deck_updates_queue', { deckId: deck._id, userId });
        socketService.notifyUser(userId, 'Deck importado com sucesso!');
        incrementImportCount('success');
        recordImportDuration(true, (Date.now() - start) / 1000);
    } catch (error) {
        console.error('Erro no processamento do deck:', error);
        incrementImportCount('failure');
        recordImportDuration(false, (Date.now() - start) / 1000);
    } finally {
        messageQueue.acknowledgeMessage(msg);
    }
}

async function startDeckImportWorker() {
    await messageQueue.connect();
    await messageQueue.consumeFromQueue('deck_import_queue', (msg) => {
        if (msg) processDeckImport(msg);
    });
}

startDeckImportWorker();
