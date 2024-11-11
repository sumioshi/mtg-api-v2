import { Request, Response } from 'express';
import axios from 'axios';
import cardsService from '../service/cards.service';
import Card from '../schema/cards.schema';
import fs from 'fs';
import { IUser } from '../schema/user.schema';
import Deck from '../schema/deck.schema';
import { Transform } from 'stream';

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

            fs.writeFileSync('cards.json', JSON.stringify(cardsArray, null, 2), 'utf-8');

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

            const card = await cardsService.create(cardData);
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

    async update(req: Request, res: Response) {
        try {
            const cards = await cardsService.update(req.params.id, req.body);
            return res.status(200).json(cards);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao atualizar card' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const cards = await cardsService.delete(req.params.id);
            return res.status(200).json({ message: 'Card removido com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao deletar card' });
        }
    }

    async createDeck(req: Request, res: Response) {
        try {
            const { commanderId, cardIds } = req.body;

            if (!req.user) {
                return res.status(401).json({ message: 'Usuário não autenticado' });
            }

            const userId = (req.user as IUser)._id;
            const deck = await cardsService.createDeck(commanderId, cardIds, userId.toString());
            res.status(201).json(deck);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Erro ao criar deck' });
        }
    }

    async updateDeck(req: Request, res: Response) {
        try {
            const deckId = req.params.id;
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

            const updatedDeck = await cardsService.updateDeck(deckId, commanderId, cardIds);
            return res.status(200).json(updatedDeck);
        } catch (error) {
            console.error(error);
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
            const cacheKey = `user-decks-${userId}`;

            if (req.cache) {
                const cachedDecks = await req.cache.get(cacheKey);
                if (cachedDecks) {
                    console.log('Cache hit');
                    return res.status(200).json(cachedDecks); 
                }

                const decks = await cardsService.findDecksByUserId(userId);
                await req.cache.set(cacheKey, decks, { ttl: 60 });

                console.log('Cache miss');
                return res.status(200).json(decks);
            } else {
                console.error('Cache não está disponível');
                return res.status(500).json({ message: 'Cache não disponível' });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao listar os baralhos do usuário' });
        }
    }

    async importDeck(req: Request, res: Response) {
        try {
            const deckData = req.body;

            if (!deckData.commander || !deckData.cards || deckData.cards.length !== 99) {
                return res.status(400).json({ message: 'O deck deve ter um comandante e exatamente 99 cartas.' });
            }

            const commander = await Card.findById(deckData.commander);
            if (!commander || commander.type !== 'Legendary Creature — Human Rebel') {
                return res.status(400).json({ message: 'O comandante deve ser uma criatura lendária.' });
            }

            const deck = await cardsService.createDeck(deckData.commander, deckData.cards, req.user!._id);

            const deckContent = {
                commander: deckData.commander,
                cards: deckData.cards
            };

            fs.writeFileSync('cards.json', JSON.stringify(deckContent, null, 2), 'utf-8');
            
            return res.status(201).json(deck);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao importar deck' });
        }
    }


    async streamMagicCards(req: Request, res: Response) {
        try {
            const apiUrl = 'https://api.magicthegathering.io/v1/cards';

            const axiosResponse = await axios({
                url: apiUrl,
                method: 'GET',
                responseType: 'stream'  
            });

            res.setHeader('Content-Type', 'application/json');

            const transformStream = new Transform({
                objectMode: true,
                transform(chunk, encoding, callback) {
                    const transformedData = JSON.stringify(chunk);  
                    callback(null, transformedData);
                }
            });

            axiosResponse.data.pipe(transformStream).pipe(res);

        } catch (error) {
            console.error('Erro ao consumir API de Magic via stream:', error);
            res.status(500).json({ message: 'Erro ao consumir API de Magic via stream' });
        }
    }

    async streamAllCards(req: Request, res: Response) {
        try {
            const cardsStream = await cardsService.findAllStream(); 
            res.setHeader('Content-Type', 'application/json');
            let isFirstChunk = true;
            res.write('[');  
    
            cardsStream.on('data', (chunk) => {
                const jsonChunk = JSON.stringify(chunk); 
                
                if (!isFirstChunk) {
                    res.write(',');
                }
                res.write(jsonChunk);
                isFirstChunk = false;
            })
            cardsStream.on('end', () => {
                res.write(']');
                res.end();
            });
    
            cardsStream.on('error', (err) => {
                console.error('Erro no stream de dados:', err);
                res.status(500).json({ message: 'Erro no stream de dados' });
            });
        } catch (error) {
            console.error('Erro ao transmitir os dados:', error);
            return res.status(500).json({ message: 'Erro ao buscar cards via stream' });
        }
    }

    async findAllDecks(req: Request, res: Response) {
        try {
            const decks = await Deck.find().populate('commanderId cardIds');  
            return res.status(200).json(decks);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erro ao buscar todos os baralhos' });
        }
    }

}

export default new CardsController();
