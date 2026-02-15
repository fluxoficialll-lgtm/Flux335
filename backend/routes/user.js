
import express from 'express';
import { dbManager } from '../databaseManager.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

// CORREÇÃO FINAL: Unifica o segredo do JWT com o resto da aplicação.
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Rota para registrar um novo usuário com e-mail e senha
router.post('/register', async (req, res) => {
    const { email, password, name, nickname } = req.body;

    if (!email || !password || !name || !nickname) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios: email, senha, nome e apelido.' });
    }

    try {
        const existingUser = await dbManager.users.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'O e-mail fornecido já está em uso.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await dbManager.users.create({
            email,
            password: hashedPassword,
            name,
            profile: { name, nickname }
        });

        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

    } catch (error) {
        console.error("Erro no registro de usuário:", error);
        res.status(500).json({ error: 'Erro interno do servidor ao registrar o usuário.' });
    }
});

// Rota de login para usuários com e-mail e senha
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
        const user = await dbManager.users.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // Gera o token usando o segredo correto e o payload correto ({ id: ... })
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

export default router;
