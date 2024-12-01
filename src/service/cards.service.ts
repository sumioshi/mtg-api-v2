import Card from '../schema/cards.schema';
import cardsSchema from '../schema/cards.schema';
import Deck, { IDeck } from '../schema/deck.schema';
import { Readable } from 'stream';
import socketService from '../socket/socketService';

class CardsService {
    async create(cardData: { name: string; type: string }, userId?: string) {
        try {
            const card = new cardsSchema(cardData);
            const savedCard = await card.save();
            
            // Se houver um userId, notifica o usuário que criou o card
            if (userId) {
                const message = JSON.stringify({
                    message: `Card "${cardData.name}" foi criado com sucesso!`,
                    type: 'card_created',
                    data: { cardId: savedCard._id, cardName: savedCard.name }
                });
                socketService.notifyUser(userId, message);
            }
            
            return savedCard;
        } catch (error) {
            console.error('Erro ao criar card:', error);
            throw new Error('Erro ao criar card');
        }
    }

    async findAll() {
        try {
            const cards = await cardsSchema.find();
            return cards;
        } catch (error) {
            console.error('Erro ao buscar cards:', error);
            throw new Error('Erro ao buscar cards');
        }
    }

    async update(id: string, cardData: { name: string; type: string }) {
        try {
            const updatedCard = await cardsSchema.findByIdAndUpdate(
                id,
                {
                    name: cardData.name,
                    type: cardData.type,
                },
                { new: true }
            );
            return updatedCard;
        } catch (error) {
            console.error('Erro ao atualizar card:', error);
            throw new Error('Erro ao atualizar card');
        }
    }

    async delete(id: string) {
        try {
            const deletedCard = await cardsSchema.findByIdAndDelete(id);
            if (deletedCard) {
                return "Card removido com sucesso";
            } else {
                return "Card não encontrado";
            }
        } catch (error) {
            console.error('Erro ao deletar card:', error);
            throw new Error('Erro ao deletar card');
        }
    }

    async createDeck(commanderId: string, cardIds: string[], userId: string): Promise<IDeck> {
        try {
            const commander = await Card.findById(commanderId);
            if (!commander) {
                throw new Error('Comandante não encontrado');
            }

            const cards = await Card.find({ _id: { $in: cardIds } });
            console.log(`Cartas encontradas: ${cards.length}`);
            
            if (cards.length !== 99) {
                throw new Error('Número incorreto de cartas. Um deck deve conter exatamente 99 cartas.');
            }
            
            const deck = new Deck({
                commanderId,
                cardIds,
                userId
            });

            const createdDeck = await Deck.create(deck);
            
            // Notifica o usuário que o deck foi criado
            const message = JSON.stringify({
                message: `Novo deck criado com sucesso! Commander: ${commander.name}`,
                type: 'deck_created',
                data: { 
                    deckId: createdDeck._id,
                    commanderName: commander.name,
                    totalCards: cards.length + 1 
                }
            });
            socketService.notifyUser(userId, message);

            return createdDeck;
        } catch (error) {
            console.error('Erro ao criar deck:', error);
            throw error;
        }
    }
    
    async getDeck(id: string): Promise<IDeck | null> {
        try {
            return await Deck.findById(id).populate('commanderId cardIds');
        } catch (error) {
            console.error('Erro ao buscar deck:', error);
            throw new Error('Erro ao buscar deck');
        }
    }

    async updateDeck(deckId: string, commanderId: string, cardIds: string[], userId: string): Promise<IDeck | null> {
        try {
            const updatedDeck = await Deck.findByIdAndUpdate(
                deckId,
                {
                    commanderId,
                    cardIds
                },
                { new: true }
            ).populate('commanderId');

            if (updatedDeck) {
                const message = JSON.stringify({
                    message: 'Seu deck foi atualizado com sucesso!',
                    type: 'deck_updated',
                    data: { 
                        deckId: updatedDeck._id,
                        commanderName: (updatedDeck.commanderId as any).name
                    }
                });
                socketService.notifyUser(userId, message);
            }

            return updatedDeck;
        } catch (error) {
            console.error('Erro ao atualizar deck:', error);
            throw new Error('Erro ao atualizar deck');
        }
    }

    async findAllDecks() {
        try {
            return await Deck.find().populate('commanderId cardIds');
        } catch (error) {
            console.error('Erro ao buscar todos os decks:', error);
            throw new Error('Erro ao buscar todos os decks');
        }
    }

    async findDecksByUserId(userId: string) {
        try {
            return await Deck.find({ userId }).populate('commanderId cardIds');
        } catch (error) {
            console.error('Erro ao buscar decks do usuário:', error);
            throw new Error('Erro ao buscar decks do usuário');
        }
    }

    async importDeck(deckData: any, userId: string): Promise<IDeck> {
        try {
            // Notifica início da importação
            socketService.notifyUser(userId, JSON.stringify({
                message: 'Iniciando importação do seu deck. Você será notificado quando estiver pronto!',
                type: 'deck_imported',
                data: { status: 'started' }
            }));

            const deck = await this.createDeck(deckData.commanderId, deckData.cardIds, userId);
            
            // Notifica conclusão da importação
            socketService.notifyUser(userId, JSON.stringify({
                message: 'Seu deck foi importado com sucesso!',
                type: 'deck_imported',
                data: { 
                    status: 'completed',
                    deckId: deck._id
                }
            }));
            
            return deck;
        } catch (error) {
            // Notifica erro na importação
            socketService.notifyUser(userId, JSON.stringify({
                message: 'Houve um erro ao importar seu deck. Por favor, tente novamente.',
                type: 'deck_imported',
                data: { 
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                }
            }));
            
            console.error('Erro ao importar deck:', error);
            throw error;
        }
    }

    async findAllStream() {
        try {
            const cards = await cardsSchema.find();
            return this.streamCards(cards);
        } catch (error) {
            console.error('Erro ao buscar cards para stream:', error);
            throw new Error('Erro ao buscar cards para stream');
        }
    }

    streamCards(cards: any[]) {
        const readable = new Readable({
            objectMode: true,
            read() {
                cards.forEach(card => this.push(card));
                this.push(null);
            }
        });

        return readable;
    }
}

export default new CardsService();