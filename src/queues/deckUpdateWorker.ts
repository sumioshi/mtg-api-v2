import messageQueue from './messageQueue';
import socketService from '../socket/socketService';

async function startDeckUpdateWorker() {
    try {
        console.log('Iniciando worker de atualizações de deck...');
        await messageQueue.connect();
        console.log('Conectado à fila de atualizações de deck.');

        await messageQueue.consumeFromQueue('deck_updates_queue', (msg) => {
            if (msg) {
                try {
                    const { deckId, userId } = JSON.parse(msg.content.toString());
                    console.log(`Mensagem recebida da fila de atualizações: deckId=${deckId}, userId=${userId}`);

                    // Notifica o usuário sobre a atualização do deck
                    socketService.notifyUser(userId, `Seu deck de ID ${deckId} foi atualizado com sucesso.`);
                    console.log(`Usuário notificado com sucesso: userId=${userId}`);
                } catch (error) {
                    console.error('Erro ao processar a mensagem da fila de atualizações:', error);
                } finally {
                    // Confirma a mensagem processada
                    messageQueue.acknowledgeMessage(msg);
                    console.log(`Mensagem reconhecida: ${msg.content.toString()}`);
                }
            } else {
                console.warn('Mensagem nula recebida da fila de atualizações.');
            }
        });
        console.log('Worker de atualizações de deck iniciado.');
    } catch (error) {
        console.error('Erro ao iniciar o worker de atualizações de deck:', error);
    }
}

startDeckUpdateWorker();
