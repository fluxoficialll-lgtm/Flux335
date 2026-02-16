
const express = require('express');
const fs = require('fs');
const path = require('path');
const { traceMiddleware } = require('../middleware/traceMiddleware');
const { trafficLogger } = require('../services/audit/trafficLogger');

const router = express.Router();

// Aplica middlewares globais para todas as rotas
router.use(traceMiddleware);
router.use((req, res, next) => {
    trafficLogger.logRequest(req);
    next();
});

const routesDir = __dirname;

// Carrega dinamicamente os arquivos de rota do diretório atual
fs.readdirSync(routesDir).forEach(file => {
    // Considera apenas arquivos .js que não sejam este (index.js) e não sejam diretórios
    if (file.endsWith('.js') && file !== 'index.js') {
        const fullPath = path.join(routesDir, file);
        const routeModule = require(fullPath);
        
        // Deriva o "mount path" do nome do arquivo
        const routeName = path.basename(file, '.js');
        let mountPath;

        // Converte nomes como 'commentRoutes' para '/comments'
        if (routeName.endsWith('Routes')) {
            mountPath = `/${routeName.slice(0, -6)}s`;
        } else {
            mountPath = `/${routeName}`;
        }

        // Registra o módulo da rota no caminho derivado
        router.use(mountPath, routeModule);
    }
});

module.exports = router;
