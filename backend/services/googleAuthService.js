
const { OAuth2Client } = require('google-auth-library');
const UserRepository = require('../../database/repositories/UserRepository');
const { issueToken } = require('../utils/tokenHandler'); 
const { v4: uuidv4 } = require('uuid');

// Usar uma única instância do cliente para ser mais eficiente
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Realiza a autenticação de um usuário com o Google, validando o token.
 * Retorna o usuário e um token de sessão.
 */
exports.handleGoogleAuth = async (req, res) => {
    const { credential } = req.body;
    const traceId = req.headers['x-flux-trace-id'] || uuidv4();

    if (!credential) {
        return res.status(400).json({ error: 'O token de credencial do Google não foi fornecido.', trace_id: traceId });
    }

    try {
        // Verifica o token de ID do Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();

        if (!payload || !payload.email || !payload.sub) {
            return res.status(401).json({ error: 'O token do Google é inválido ou não contém as informações necessárias.', trace_id: traceId });
        }

        const { email, name, picture, sub: googleId } = payload;
        
        let user = await UserRepository.findByEmail(email);
        let isNew = false;

        if (!user) {
            // Se o usuário não existe, cria um novo
            const newUser = {
                email,
                google_id: googleId,
                profile: { 
                    name: name || 'Usuário',
                    picture: picture || null 
                },
                is_profile_completed: false, // Perfil não completo
            };
            user = await UserRepository.create(newUser);
            isNew = true;
        } else {
            // Se o usuário já existe, mas não tem o google_id, atualiza
            if (!user.google_id) {
                await UserRepository.update(user.id, { google_id: googleId });
            }
        }
        
        // Gera um token de sessão para o usuário
        const token = issueToken({ userId: user.id, email: user.email });

        res.status(200).json({ 
            token, 
            user,
            isNew 
        });

    } catch (error) {
        console.error(`[${traceId}] Erro na autenticação com Google:`, error);
        res.status(500).json({ 
            error: 'Ocorreu um erro interno durante a autenticação com o Google.', 
            trace_id: traceId 
        });
    }
};
