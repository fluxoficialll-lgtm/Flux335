
const express = require('express');
const router = express.Router();
const { handleGoogleAuth } = require('../services/googleAuthService');
const passwordAuthService = require('../services/passwordAuthService');

// A verificação de traceId e o log de tráfego agora são feitos
// pelo middleware global em `backend/routes.js`.

// Rota para autenticação com Google
router.post('/google', handleGoogleAuth);

// Rotas para autenticação com email e senha
router.post('/login', passwordAuthService.login);
router.post('/register', passwordAuthService.register);

module.exports = router;
