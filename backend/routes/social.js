
import express from 'express';
import { dbManager } from '../databaseManager.js';
import { decodeToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota para criar um novo relatório (denúncia)
router.post('/reports', async (req, res) => {
    try {
        const { targetId, reporterId, reason } = req.body;
        if (!targetId || !reason) {
            return res.status(400).json({ error: "Dados obrigatórios para denúncia ausentes." });
        }
        await dbManager.reports.create({ targetId, reporterId, reason });
        res.status(201).json({ success: true, message: "Denúncia registrada com sucesso." });
    } catch (e) {
        console.error("Falha ao criar denúncia:", e);
        res.status(500).json({ error: "Erro interno ao processar a denúncia." });
    }
});

// Rota para seguir um usuário
router.post('/relationships/follow', async (req, res) => {
    try {
        // Validação básica dos dados de entrada
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId) {
            return res.status(400).json({ error: "IDs de seguidor e seguido são obrigatórios." });
        }
        await dbManager.relationships.create(req.body);
        res.status(201).json({ success: true, message: "Usuário seguido com sucesso." });
    } catch (e) {
        console.error("Falha ao seguir usuário:", e);
        res.status(500).json({ error: "Erro interno ao seguir o usuário." });
    }
});

// Rota para deixar de seguir um usuário
router.post('/relationships/unfollow', async (req, res) => {
    try {
        const { followerId, followingId } = req.body;
        if (!followerId || !followingId) {
            return res.status(400).json({ error: "IDs de seguidor e seguido são obrigatórios." });
        }
        await dbManager.relationships.delete(followerId, followingId);
        res.status(200).json({ success: true, message: "Usuário deixou de ser seguido com sucesso." });
    } catch (e) {
        console.error("Falha ao deixar de seguir usuário:", e);
        res.status(500).json({ error: "Erro interno ao deixar de seguir o usuário." });
    }
});

// Rota para buscar os relacionamentos do usuário autenticado
router.get('/relationships/me', async (req, res) => {
    try {
        const decoded = decodeToken(req);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ error: "Token de autenticação inválido ou ausente." });
        }
        
        const userId = decoded.userId;
        const rels = await dbManager.relationships.findByFollower(userId);
        res.json({ relationships: rels });

    } catch (e) {
        console.error(`Falha ao buscar relacionamentos para o usuário: ${req.userId || 'ID não extraído'}. Erro:`, e);
        res.status(500).json({ error: "Erro interno ao buscar relacionamentos." }); 
    }
});

// Rota para buscar os criadores de topo (ranking)
router.get('/rankings/top', async (req, res) => {
    try {
        const topCreators = await dbManager.relationships.getTopCreators();
        res.json({ data: topCreators });
    } catch (e) {
        console.error("Falha ao buscar ranking de criadores:", e);
        res.status(500).json({ error: "Erro interno ao buscar o ranking." });
    }
});

export default router;
