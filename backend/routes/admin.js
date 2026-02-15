
import express from 'express';
import { validateAdmin } from '../middleware.js';
// CORREÇÃO: Usa a sintaxe de importação nomeada para corresponder à exportação em dispatcher.js.
import { adminDispatcher } from './admin/dispatcher.js';

const router = express.Router();

// Aplica o middleware de validação a todas as rotas de admin.
router.use(validateAdmin);

// A rota única que captura todos os comandos e os envia ao dispatcher.
router.all('/execute/:method/:category/:action', adminDispatcher);

export default router;
