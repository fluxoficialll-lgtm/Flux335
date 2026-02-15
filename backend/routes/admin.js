
import express from 'express';
import { validateAdmin } from '../middleware.js';
import { setupAdminRoutes } from './admin/dispatcher.js';

const router = express.Router();

// Aplica o middleware de validação APENAS às rotas de admin.
router.use(validateAdmin);

// Configura as sub-rotas de admin a partir do dispatcher.
setupAdminRoutes(router);

export default router;
