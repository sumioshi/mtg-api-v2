import { Router } from 'express';
import cardsController from './controller/cards.controller';
import { authenticateJWT, authorizeAdmin } from './middleware/auth.middleware';
import { login, register } from './controller/auth.controller';
import socketService from './socket/socketService';
import jwt from 'jsonwebtoken';
import User from './schema/user.schema';

const routes = Router();

// Rotas de Cards
routes.get('/cards', cardsController.findAll);
routes.get('/inserir-cards', authenticateJWT, cardsController.buscarCards);
routes.post('/cards-create', authenticateJWT, cardsController.create);

// Rotas de Decks
routes.post('/decks/import', authenticateJWT, cardsController.importDeck);
routes.get('/my-decks', authenticateJWT, cardsController.findUserDecks);
routes.post('/decks', authenticateJWT, cardsController.createDeck);
routes.get('/decks/:id', authenticateJWT, cardsController.getDeck);
routes.put('/decks/:id', authenticateJWT, cardsController.updateDeck);

// Rotas de Autenticação
routes.post('/login', login);
routes.post('/register', register);

// Rota para Login com Token
routes.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
});

// Rota para Teste de Notificação
routes.post('/test-notification', (req, res) => {
    const { userId, message, deckId } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: 'User ID e mensagem são obrigatórios.' });
    }

    const notification = JSON.stringify({
        message: message,
        deckId: deckId || null,
    });

    socketService.notifyUser(userId, notification);
    return res.status(200).json({ success: true, message: `Notificação enviada para o usuário ${userId}.` });
});

export { routes };
