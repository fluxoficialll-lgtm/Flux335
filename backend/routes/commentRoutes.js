
import { Router } from 'express';
import { commentController } from '../controllers/CommentController.js';
import { authMiddleware } from '../middlewares/authMiddleware'; // Middleware para proteger as rotas

const router = Router();

/**
 * @fileoverview Define as rotas da API para o recurso de comentários.
 */

// --- Rotas para um item específico (Reel, Post, etc.) ---

// GET /api/reels/123/comments - Busca todos os comentários para o reel com ID 123.
// GET /api/posts/456/comments - Busca todos os comentários para o post com ID 456.
router.get(
    '/:commentableType/:commentableId/comments',
    commentController.getComments
);

// POST /api/reels/123/comments - Adiciona um novo comentário ao reel 123.
router.post(
    '/:commentableType/:commentableId/comments',
    authMiddleware, // Apenas usuários logados podem comentar
    commentController.postComment
);


// --- Rota para uma ação de comentário específico ---

// DELETE /api/comments/789 - Deleta o comentário com ID 789.
router.delete(
    '/comments/:commentId',
    authMiddleware, // Apenas usuários logados podem deletar
    commentController.deleteComment
);


export { router as commentRoutes };
