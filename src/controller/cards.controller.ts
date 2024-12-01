import mongoose from 'mongoose';
import { Request, Response } from 'express';
import axios from 'axios';
import cardsService from '../service/cards.service';
import Card from '../schema/cards.schema';
import { IUser } from '../schema/user.schema';
import messageQueue from "../queues/messageQueue";

interface ICardData {
    name: string;
    type: string;
}

class CardsController {
    async buscarCards(req: Request, res: Response) {
        try {
            const baseUrl = 'https://api.magicthegathering.io/v1/cards?colors=w&pageSize=34';
            let cardsCriados = 0;
            let cardsArray: ICardData[] = [];
            let currentPage = 1;
            let hasNextPage = true;

            const axiosInstance = axios.create({
                timeout: 120000,
            });

            const promises = [];

            while (hasNextPage) {
                const apiCardsUrl = `${baseUrl}&page=${currentPage}`;
                promises.push(axiosInstance.get(apiCardsUrl));

                currentPage++;
                hasNextPage = currentPage <= 4;
            }

            const responses = await Promise.all(promises);

            for (const response of responses) {
                const data = response.data.cards;

                for (const dataCard of data) {
                    const cardExist = await Card.findOne({ name: dataCard.name });

                    if (!cardExist) {
                        const modelCard: ICardData = {
                            name: dataCard.name,
                            type: dataCard.type,
                        };

                        await cardsService.create(modelCard);
                        cardsCriados++;
                        cardsArray.push(modelCard);
                    }
                }
            }

            if (cardsCriados > 0) {
                return res.status(200).json({ message: `${cardsCriados} Cards Criados com sucesso` });
            } else {
                return res.status(200).json({ message: 'Nenhum card novo foi criado, todos já existiam' });
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Erro de requisição Axios:', error.message);
                return res.status(500).json({ message: 'Erro ao criar cards', error: error.message });
            } else if (error instanceof Error) {
                console.error('Erro geral:', error.message);
                return res.status(500).json({ message: 'Erro ao criar cards', error: error.message });
            } else {
                console.error('Erro desconhecido:', error);
                return res.status(500).json({ message: 'Erro desconhecido ao criar cards' });
            }
        }
    }

    async create(req: Request, res: Response) {
        try {
            const cardData: ICardData = req.body;
            const cardExist = await Card.findOne({ name: cardData.name });

            if (cardExist) {
                return res.status(400).json({ message: 'Card já existe' });
            }

            const userId = req.user?._id?.toString();
            const card = await cardsService.create(cardData, userId);
            return res.status(201).json(card);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao criar card' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const cards = await cardsService.findAll();
            return res.status(200).json(cards);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar cards' });
        }
    }

    async createDeck(req: Request, res: Response) {
        try {
            const { commanderId, cardIds } = req.body;

            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não autenticado' });
            }

            const userId = (req.user as IUser)._id.toString();
            const deck = await cardsService.createDeck(commanderId, cardIds, userId);
            res.status(201).json(deck);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar deck' });
        }
    }

    async updateDeck(req: Request, res: Response) {
        try {
            const deckId = req.params.id;
    
            // Valida o ObjectId antes de buscar no banco
            if (!mongoose.Types.ObjectId.isValid(deckId)) {
                return res.status(400).json({ message: 'ID de deck inválido.' });
            }
    
            const { commanderId, cardIds } = req.body;
    
            const deck = await cardsService.getDeck(deckId);
            if (!deck) {
                return res.status(404).json({ message: 'Deck não encontrado' });
            }
    
            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não autenticado' });
            }
    
            if (!deck.userId || !req.user._id) {
                return res.status(400).json({ message: 'Usuário ou deck inválido' });
            }
    
            if (deck.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Você não tem permissão para editar este deck' });
            }
    
            const updatedDeck = await cardsService.updateDeck(deckId, commanderId, cardIds, req.user._id.toString());
            return res.status(200).json(updatedDeck);
        } catch (error) {
            console.error('Erro ao atualizar deck:', error);
            return res.status(500).json({ message: 'Erro ao atualizar deck' });
        }
    }

    async getDeck(req: Request, res: Response) {
        try {
            const deckId = req.params.id;
            const deck = await cardsService.getDeck(deckId);

            if (!deck) {
                return res.status(404).json({ message: 'Deck não encontrado' });
            }

            return res.status(200).json(deck);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao obter deck' });
        }
    }

    async findUserDecks(req: Request, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não autenticado' });
            }

            const userId = (req.user as IUser)._id;
            const decks = await cardsService.findDecksByUserId(userId);
            return res.status(200).json(decks);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao listar os baralhos do usuário' });
        }
    }
      
    async importDeck(req: Request, res: Response) {
        try {
            const deckData = req.body;
    
            if (!deckData.commanderId || !deckData.cardIds || deckData.cardIds.length !== 99) {
                return res.status(400).json({ message: 'O deck deve ter um comandante e exatamente 99 cartas.' });
            }
    
            const commander = await Card.findById(deckData.commanderId);
            console.log('Commander encontrado:', {
                id: commander?._id,
                name: commander?.name,
                type: commander?.type
            });
    
            if (!commander || commander.type !== 'Legendary Creature — Human Rebel') {
                return res.status(400).json({
                    message: 'O comandante deve ser uma criatura lendária.',
                    details: {
                        commanderId: deckData.commanderId,
                        foundType: commander?.type,
                        expectedType: 'Legendary Creature — Human Rebel'
                    }
                });
            }
    
            const userId = req.user!._id.toString();
            const deck = await cardsService.importDeck(deckData, userId);
    
            // Garante que a conexão com RabbitMQ foi inicializada
            await messageQueue.connect();
    
            const isAdmin = req.user?.role === 'admin';
            const priority = isAdmin ? 10 : 1;
    
            await messageQueue.sendToQueue('deck_import_queue', { 
                deckData, 
                userId: userId
            }, { priority });
    
            await messageQueue.sendToQueue('deck_updates_queue', { 
                message: 'Deck enviado para importação!', 
                deckId: deck._id, 
                userId: userId
            });
    
            return res.status(202).json({ message: 'Deck enviado para importação', deck });
        } catch (error) {
            console.error('Erro ao importar deck:', error);
            return res.status(500).json({ message: 'Erro ao importar deck' });
        }
    }
}    

const cardsController = new CardsController();
export default cardsController;