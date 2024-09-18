import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../schema/user.schema'; 

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

 
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro no servidor' });
    }
};

export const register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;

    try {
        const userExist = await User.findOne({ username });

        if (userExist) {
            return res.status(400).json({ message: 'Usuário já existe' });
        }
        
        const newUser = new User({ username, password, role: role || 'user' });
        await newUser.save();

        return res.status(201).json({ message: 'Usuário criado com sucesso', newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao criar usuário' });
    }
};
