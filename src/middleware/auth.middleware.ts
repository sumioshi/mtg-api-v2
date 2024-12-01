import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../schema/user.schema';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        console.error('Token não fornecido.');
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        console.log('Token recebido:', token);
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');        console.log('Token decodificado:', decoded);

        const user = await User.findById(decoded.id);
        if (!user) {
            console.error('Usuário não encontrado para o ID:', decoded.id);
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err: any) {
        console.error('Erro ao verificar token:', err.message);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        return res.status(400).json({ message: 'Invalid Token' });
    }
};

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem acessar essa rota.' });
    }

    next();
};
