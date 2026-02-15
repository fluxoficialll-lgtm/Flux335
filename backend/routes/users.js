
import express from 'express';
import { dbManager } from '../databaseManager.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Sincroniza todos os usuários com o cliente.
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const users = await dbManager.users.getAll();
        res.json({ users: users });
    } catch (error) {
        console.error('[API] Erro ao sincronizar usuários:', error);
        res.status(500).json({ error: 'Falha ao sincronizar usuários.' });
    }
});

/**
 * @route   GET /api/users/update
 * @desc    Endpoint de verificação para a rota de atualização.
 * @access  Private
 */
router.get('/update', async (req, res) => {
    res.json({ success: true, message: 'Endpoint GET /api/users/update atingido com sucesso.' });
});

/**
 * @route   GET /api/users/:id
 * @desc    Busca um usuário específico pelo ID.
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await dbManager.users.findById(id);

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('[API] Erro ao buscar usuário por ID:', error);
        res.status(500).json({ error: 'Falha ao buscar usuário.' });
    }
});

/**
 * @route   POST /api/users/update-location
 * @desc    Atualiza a localização geográfica do usuário logado.
 * @access  Private
 */
router.post('/update-location', async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        const { latitude, longitude } = req.body;
        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
        }

        await req.hub.users.updateLocation(userId, latitude, longitude);

        res.json({ success: true, message: 'Localização atualizada com sucesso.' });

    } catch (error) {
        console.error('[API] Erro ao atualizar localização:', error);
        res.status(500).json({ error: 'Falha ao atualizar a localização.' });
    }
});

/**
 * @route   GET /api/users/nearby
 * @desc    Encontra usuários próximos a um determinado ponto geográfico.
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, lon, radius } = req.query;

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        const radiusInMeters = radius ? parseInt(radius) : 50000; // Raio de 50km por padrão

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ error: 'Parâmetros de latitude e longitude inválidos.' });
        }

        const users = await req.hub.users.findNearby(latitude, longitude, radiusInMeters);

        res.json(users);

    } catch (error) {
        console.error('[API] Erro ao buscar usuários próximos:', error);
        res.status(500).json({ error: 'Falha ao buscar usuários próximos.' });
    }
});

/**
 * @route   GET /api/users/search
 * @desc    Busca por usuários por nome de usuário (handle) ou email.
 * @access  Public
 */
router.get('/search', async (req, res) => {
    try {
        const { term } = req.query;
        if (!term) {
            return res.status(400).json({ error: 'O termo de busca é obrigatório.' });
        }

        const users = await req.hub.users.searchByTerm(term);

        const publicUsers = users.map(user => ({
            id: user.id,
            handle: user.handle,
            profile: { 
                name: user.profile?.name,
                avatar: user.profile?.avatar
            }
        }));

        res.json(publicUsers);

    } catch (error) {
        console.error('[API] Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Falha ao buscar usuários.' });
    }
});

/**
 * @route   PUT /api/users/update
 * @desc    Atualiza as informações do perfil do usuário.
 * @access  Private
 */
router.put('/update', async (req, res) => {
    try {
        const { email, updates } = req.body;
        if (!email || !updates) {
            return res.status(400).json({ error: 'Email e atualizações são obrigatórios.' });
        }
        const user = await dbManager.users.findByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        const updatedUser = { ...user };
        if (updates.isProfileCompleted !== undefined) {
            updatedUser.isProfileCompleted = updates.isProfileCompleted;
        }
        if (updates.profile) {
            updatedUser.profile = { ...user.profile, ...updates.profile };
        }
        await dbManager.users.update(updatedUser);
        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('[API] Erro ao atualizar perfil do usuário:', error);
        res.status(500).json({ error: 'Falha ao atualizar o perfil do usuário.' });
    }
});

export default router;
