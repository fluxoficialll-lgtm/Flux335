
import express from 'express';
import { AdAnalyticsRepository } from '../database/repositories/index.js';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

// Criar nova campanha
router.post('/create', async (req, res) => {
    try {
        const campaign = req.body;
        if (!campaign.id || !campaign.ownerId) {
            return res.status(400).json({ error: "ID e ownerId são obrigatórios." });
        }
        await dbManager.ads.create(campaign);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Atualizar campanha (status ou criativos)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        await dbManager.ads.update(id, updates);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Adicionar orçamento (top-up)
router.post('/:id/top-up', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ error: "Valor inválido." });
        await dbManager.ads.addBudget(id, amount);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Deletar campanha
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await dbManager.ads.delete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Endpoint de Performance Real
router.get('/:id/performance', async (req, res) => {
    try {
        const metrics = await AdAnalyticsRepository.getAdPerformance(req.params.id);
        res.json({ success: true, metrics });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Registrar evento (View/Click) via backend
router.post('/track', async (req, res) => {
    try {
        const { adId, userId, type, metadata } = req.body;
        await AdAnalyticsRepository.recordEvent(adId, userId, type, 0, metadata);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
