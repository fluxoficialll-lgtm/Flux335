
import express from 'express';
import { traceMiddleware } from './middleware/traceMiddleware.js';
import { trafficLogger } from './services/audit/trafficLogger.js';

// Import all routes with correct export types
import { adRoutes } from './routes/ads.js';
import { analyticsRoutes } from './routes/analytics.js';
import { auditRoutes } from './routes/audit.js';
import { authRoutes } from './routes/auth.js';
import { commentRoutes } from './routes/commentRoutes.js';
import { credentialsRoutes } from './routes/credentials.js';
import { eventsRoutes } from './routes/events.js';
import { fluxmapRoutes } from './routes/fluxmap.js';
import { groupsRoutes } from './routes/groups.js';
import logsRoutes from './routes/logs.js';
import marketplaceRoutes from './routes/marketplace.js';
import messagesRoutes from './routes/messages.js';
import moderationRoutes from './routes/moderation.js';
import notificationsRoutes from './routes/notifications.js';
import paymentsRoutes from './routes/payments.js';
import postsRoutes from './routes/posts.js';
import profileRoutes from './routes/profile.js';
import rankingRoutes from './routes/ranking.js';
import reelsRoutes from './routes/reels.js';
import screensRoutes from './routes/screens.js';
import socialRoutes from './routes/social.js';
import trackingRoutes from './routes/tracking.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const router = express.Router();

// Apply middleware
router.use(traceMiddleware);
router.use((req, res, next) => {
    trafficLogger.logInbound(req);
    next();
});

// Use all imported routes
router.use('/ads', adRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit', auditRoutes);
router.use('/auth', authRoutes);
router.use('/comments', commentRoutes);
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
router.use('/users', usersRoutes);
router.use('/admin', adminRoutes);

export default router;
