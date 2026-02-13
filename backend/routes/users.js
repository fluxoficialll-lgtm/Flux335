import express from 'express';

const router = express.Router();

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
 * @access  Public (ou Private, dependendo da regra de negócio)
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
 * @route   GET /api/users/update
 * @desc    Endpoint de verificação para a rota de atualização.
 * @access  Private
 */
router.get('/update', async (req, res) => {
    res.json({ success: true, message: 'Endpoint GET /api/users/update atingido com sucesso.' });
});


/**
 * @route   PUT /api/users/update
 * @desc    Atualiza as informações do perfil do usuário.
 * @access  Private
 */
router.put('/update', async (req, res) => {
    // A lógica de atualização real será implementada aqui.
    console.log('Corpo da requisição de atualização de perfil:', req.body);
    res.json({ success: true, message: 'Endpoint PUT /api/users/update acessado com sucesso.' });
});

export default router;
