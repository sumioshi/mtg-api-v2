import messageQueue from './messageQueue';
import socketService from '../socket/socketService';
import cardsService from '../service/cards.service';
import { recordImportDuration, incrementImportCount } from '../metrics/metrics';

async function processDeckImport(msg: any) {
    const start = Date.now(); // Inicializa no começo da função
    
    try {
        const content = msg.content.toString();
        console.log('Conteúdo recebido:', content);
        
        const { deckData, userId } = JSON.parse(content);

        console.log('Dados parseados:', { deckData, userId });
        console.log(`Iniciando o processamento do deck para o usuário: ${userId}`);

        // Cria o deck no serviço
        const deck = await cardsService.createDeck(deckData.commanderId, deckData.cardIds, userId);
        if (!deck || !deck._id) {
            throw new Error('Deck criado sem um ID válido');
        }

        const deckId = deck._id.toString();
        console.log(`Deck criado com sucesso: ${deckId}`);

        // Envia o deck para a fila de atualizações
        await messageQueue.sendToQueue(
            'deck_updates_queue',
            {
                message: 'Deck enviado para importação!',
                deckId,
                userId,
            }
        );
        console.log(`Deck enviado para a fila de atualizações: deckId=${deckId}, userId=${userId}`);

        // Notifica o usuário via socket
        socketService.notifyUser(userId, {
            message: 'Deck importado com sucesso!',
            deckId: deckId,
        });
        console.log(`Notificação enviada para ${userId}`);

        // Registra métricas
        incrementImportCount('success');
        recordImportDuration(true, (Date.now() - start) / 1000);
    } catch (error) {
        console.error('Erro no processamento do deck:', error);
        
        // Registra métricas de falha
        incrementImportCount('failure');
        recordImportDuration(false, (Date.now() - start) / 1000);
    } finally {
        // Reconhece a mensagem processada
        messageQueue.acknowledgeMessage(msg);
        console.log(`Mensagem reconhecida: ${msg.content.toString()}`);
    }
}

async function startDeckImportWorker() {
    try {
        console.log('Conectando ao serviço de fila para importação de decks...');
        await messageQueue.connect();
        console.log('Conexão com a fila estabelecida.');

        console.log('Iniciando consumo da fila de importação...');
        await messageQueue.consumeFromQueue('deck_import_queue', (msg) => {
            if (msg) {
                console.log(`Mensagem recebida da fila de importação: ${msg.content.toString()}`);
                processDeckImport(msg);
            } else {
                console.warn('Mensagem nula recebida da fila de importação.');
            }
        });
        console.log('Worker de importação de decks iniciado.');
    } catch (error) {
        console.error('Erro ao iniciar o worker de importação de decks:', error);
    }
}

startDeckImportWorker();