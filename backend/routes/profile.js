
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Rota para obter dados do perfil para edição
router.get('/edit', async (req, res) => {
    try {
        const userId = req.userId; // Supondo que o ID do usuário está disponível na requisição
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const user = await dbManager.users.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        // Retornar os dados do perfil que podem ser editados
        res.json({
            name: user.name,
            username: user.username,
            bio: user.bio,
            // etc.
        });
    } catch (error) {
        console.error('Erro ao obter dados do perfil:', error);
        res.status(500).json({ error: 'Falha ao obter os dados do perfil.' });
    }
});

// Rota para obter o perfil público de um usuário pelo ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await dbManager.users.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        res.json(user);

    } catch (error) {
        console.error(`Erro ao buscar perfil para o ID: ${req.params.id}`, error);
        res.status(500).json({ error: 'Falha ao buscar o perfil do usuário.' });
    }
});

export default router;
