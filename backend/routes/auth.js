
import express from 'express';
import jwt from 'jsonwebtoken';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Unificado o JWT_SECRET para garantir consistência entre emissão e validação.
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Rota de callback para autenticação com Google
router.post('/google/callback', async (req, res) => {
    const { profile } = req.body; // Recebe o perfil do Google do frontend

    if (!profile) {
        return res.status(400).json({ message: "Perfil do Google não fornecido." });
    }

    try {
        let user = await dbManager.users.findByEmail(profile.email);

        if (!user) {
            // Cria um novo usuário se ele não existir
            user = await dbManager.users.create({
                email: profile.email,
                name: profile.name,
                profile: {
                    photoUrl: profile.picture,
                    name: profile.name,
                    nickname: profile.given_name,
                }
            });
        }

        // Gera o token JWT com o ID do usuário
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Retorna o token e os dados do usuário para o cliente
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
        console.error("Erro durante o callback do Google:", error);
        res.status(500).json({ message: "Erro interno no servidor ao processar login do Google." });
    }
});

export default router;
