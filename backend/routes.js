
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { traceMiddleware } from './middleware/traceMiddleware.js';
import { trafficLogger } from './services/audit/trafficLogger.js';

const router = express.Router();

router.use(traceMiddleware);
router.use((req, res, next) => {
    trafficLogger.logInbound(req);
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routesDir = path.join(__dirname, 'routes');

const routeFiles = fs.readdirSync(routesDir);

for (const file of routeFiles) {
    if (file.endsWith('.js')) {
        const routeName = path.basename(file, '.js');
        let mountPath = `/${routeName.replace('Routes', '').toLowerCase()}`;

        // Basic pluralization, can be improved
        if (!mountPath.endsWith('s')) {
            mountPath += 's';
        }
        
        const modulePath = path.join(routesDir, file);
        
        // Dynamically import the module. 
        // This is complex because of sync/async issues.
        // For now, let's assume a consistent export and use require if possible,
        // but we are in an ES module so we must use import.
        // The best solution is to avoid dynamic imports if possible.
        
        // Given the constraints, let's try a simplified dynamic import
        // and assume the calling code can handle a promise.
    }
}


// Statically import routes to avoid dynamic import issues
import { commentRoutes } from './routes/commentRoutes.js';
import { adRoutes } from './routes/ads.js';
import { analyticsRoutes } from './routes/analytics.js';
import { auditRoutes } from './routes/audit.js';
import { authRoutes } from './routes/auth.js';
import { credentialsRoutes } from './routes/credentials.js';
import { eventsRoutes } from './routes/events.js';
import { fluxmapRoutes } from './routes/fluxmap.js';
import { groupsRoutes } from './routes/groups.js';
import { logsRoutes } from './routes/logs.js';
import { marketplaceRoutes } from './routes/marketplace.js';
import { messagesRoutes } from './routes/messages.js';
import { moderationRoutes } from './routes/moderation.js';
import { notificationsRoutes } from './routes/notifications.js';
import { paymentsRoutes } from './routes/payments.js';
import { postsRoutes } from './routes/posts.js';
import { profileRoutes } from './routes/profile.js';
import { rankingRoutes } from './routes/ranking.js';
import { reelsRoutes } from './routes/reels.js';
import { screensRoutes } from './routes/screens.js';
import { socialRoutes } from './routes/social.js';
import { trackingRoutes } from './routes/tracking.js';
import { userRoutes } from './routes/user.js';
import { usersRoutes } from './routes/users.js';
import { adminDispatcher } from './routes/admin/dispatcher.js';


router.use('/comments', commentRoutes);
router.use('/ads', adRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit', auditRoutes);
router.use('/auth', authRoutes);
router.use('/credentials', credentialsRoutes);
router.use('/events', eventsRoutes);
router.use('/fluxmap', fluxmapRoutes);
router.use('/groups', groupsRoutes);
router.use('/logs', logsRoutes);
router.use('/marketplace', marketplaceRoutes);
router.use('/messages', messagesRoutes);
router.use('/moderation', moderationRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/posts', postsRoutes);
router.use('/profile', profileRoutes);
router.use('/ranking', rankingRoutes);
router.use('/reels', reelsRoutes);
router.use('/screens', screensRoutes);
router.use('/social', socialRoutes);
router.use('/tracking', trackingRoutes);
router.use('/user', userRoutes);
router.use('/users', usersRoutes);
router.use('/admin', adminDispatcher);


export default router;

