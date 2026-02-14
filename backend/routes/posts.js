
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Listar Posts (Feed) com Paginação
router.get('/', async (req, res) => {
    try {
        const { limit, cursor } = req.query;
        // A lógica de paginação no repositório foi atualizada para usar 'published_at' como cursor.
        const posts = await dbManager.posts.list(Number(limit) || 50, cursor);
        
        let nextCursor = null;
        if (posts.length > 0) {
            // O cursor para a próxima página será a data de publicação do último post.
            nextCursor = posts[posts.length - 1].publishedAt;
        }

        res.json({ data: posts, nextCursor });
    } catch (e) {
        console.error('Falha ao listar posts:', e);
        res.status(500).json({ error: e.message });
    }
});

// Criar Post
router.post('/create', async (req, res) => {
    try {
        const postData = req.body;
        // O ID é gerado pelo banco de dados, então não é mais necessário na requisição.
        // O repositório agora espera 'userId' em vez de 'authorId'.
        if (!postData.userId) {
            return res.status(400).json({ error: "O campo 'userId' é obrigatório." });
        }
        const newPost = await dbManager.posts.create(postData);
        res.status(201).json({ success: true, post: newPost });
    } catch (e) {
        console.error('Falha ao criar post:', e);
        res.status(500).json({ error: e.message });
    }
});

// Interagir (Like / View) com Verificação de Unicidade
router.post('/:id/interact', async (req, res) => {
    try {
        const { id } = req.params;
        const { type, userId, action } = req.body;
        
        if (!userId || !type) return res.status(400).json({ error: "userId e type são obrigatórios" });
        
        let success = false;
        if (action === 'remove' && type === 'like') {
            success = await dbManager.interactions.removeInteraction(id, userId, type);
        } else {
            success = await dbManager.interactions.recordUniqueInteraction(id, userId, type);
        }
        
        res.json({ success, message: success ? "Interação processada" : "Interação ignorada (duplicada ou inexistente)" });
    } catch (e) {
        // O erro sobre a tabela 'interactions' será lançado aqui.
        console.error('Falha ao processar interação:', e);
        res.status(500).json({ error: e.message });
    }
});

// Deletar Post
router.delete('/:id', async (req, res) => {
    try {
        const success = await dbManager.posts.delete(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Post não encontrado ou ID inválido.' });
        }
        res.json({ success: true });
    } catch (e) {
        console.error('Falha ao deletar post:', e);
        // O erro de UUID inválido do repositório será capturado aqui.
        res.status(500).json({ error: e.message });
    }
});

export default router;
