import { Router } from 'express';
import cardsController from './controller/cards.controller';
import { authenticateJWT, authorizeAdmin } from './middleware/auth.middleware';
import { login, register } from './controller/auth.controller';

const routes = Router();

routes.get('/inserir-cards', cardsController.buscarCards);
routes.get('/cards', cardsController.findAll);
routes.put('/cards-update/:id', cardsController.update);
routes.delete('/cards-delete/:id', cardsController.delete);
routes.post('/cards-create', cardsController.create);

routes.post('/decks', authenticateJWT, cardsController.createDeck);
routes.get('/decks/:id', cardsController.getDeck);
routes.put('/decks/:id', authenticateJWT, cardsController.updateDeck);
routes.get('/my-decks', authenticateJWT, cardsController.findUserDecks);
routes.post('/decks/import', authenticateJWT, cardsController.importDeck);
routes.get('/decks/all', authenticateJWT, authorizeAdmin, cardsController.findAllDecks);

routes.get('/cards/stream', authenticateJWT, cardsController.streamAllCards);
routes.get('/cards/stream-magic', cardsController.streamMagicCards);

routes.post('/cards-auth-create', authenticateJWT, cardsController.create);
routes.put('/cards-auth-put/:id', authenticateJWT, cardsController.update);

routes.post('/login', login);
routes.post('/register', register);

export { routes };
