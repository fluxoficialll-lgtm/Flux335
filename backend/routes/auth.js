
import express from 'express';
import { handleGoogleAuth } from '../services/googleAuthService.js';
import { passwordAuthService } from '../services/passwordAuthService.js';

const router = express.Router();

// Rota para autenticação com Google
router.post('/google', handleGoogleAuth);

// Rotas para autenticação com email e senha
router.post('/login', passwordAuthService.login);
router.post('/register', passwordAuthService.register);

// Rota para expor a configuração do Google Client ID para o frontend
router.get('/config/google-client-id', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

export { router as authRoutes };
