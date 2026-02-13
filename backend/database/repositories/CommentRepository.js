
import { query as db } from '../pool.js'; // Importa a configuração do banco de dados
import { NotFoundError, AppError } from '../../utils/errors.js';

/**
 * @fileoverview Repositório para gerenciar a entidade de Comentários no banco de dados.
 * Lida com todas as operações CRUD para comentários e utiliza associações polimórficas
 * para vincular comentários a diferentes tipos de conteúdo (posts, reels, etc.).
 */

class CommentRepository {

    /**
     * Encontra todos os comentários para um item "comentável" específico (ex: um Post ou Reel).
     * @param {number} commentableId - O ID do item (e.g., postId, reelId).
     * @param {'post' | 'reel' | 'product'} commentableType - O tipo do item.
     * @returns {Promise<Array<object>>} Uma lista de comentários.
     */
    async findByCommentable(commentableId, commentableType) {
        try {
            const comments = await db.any(
                `SELECT c.*, u.username, u.avatar_url 
                 FROM comments c
                 JOIN users u ON c.author_id = u.id
                 WHERE c.commentable_id = $1 AND c.commentable_type = $2
                 ORDER BY c.created_at ASC`,
                [commentableId, commentableType]
            );
            return comments;
        } catch (error) {
            throw new AppError('Erro ao buscar comentários no banco de dados.', 500, error);
        }
    }

    /**
     * Cria um novo comentário para um item.
     * @param {string} content - O texto do comentário.
     * @param {string} authorId - O ID do usuário que está comentando.
     * @param {number} commentableId - O ID do item sendo comentado.
     * @param {'post' | 'reel' | 'product'} commentableType - O tipo do item.
     * @returns {Promise<object>} O comentário recém-criado.
     */
    async create({ content, authorId, commentableId, commentableType }) {
        try {
            const newComment = await db.one(
                `INSERT INTO comments (content, author_id, commentable_id, commentable_type)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [content, authorId, commentableId, commentableType]
            );
            return newComment;
        } catch (error) {
            throw new AppError('Erro ao criar comentário no banco de dados.', 500, error);
        }
    }

    /**
     * Deleta um comentário pelo seu ID.
     * @param {number} commentId - O ID do comentário a ser deletado.
     * @param {string} authorId - O ID do autor, para garantir que apenas o dono possa deletar.
     * @returns {Promise<object>} O comentário que foi deletado.
     */
    async delete(commentId, authorId) {
        try {
            const deletedComment = await db.oneOrNone(
                'DELETE FROM comments WHERE id = $1 AND author_id = $2 RETURNING *'
                , [commentId, authorId]
            );

            if (!deletedComment) {
                // Ou o comentário não existe, ou o usuário não é o autor.
                throw new NotFoundError('Comentário não encontrado ou você não tem permissão para deletá-lo.');
            }
            
            return deletedComment;
        } catch (error) {
            if (error instanceof NotFoundError) throw error;
            throw new AppError('Erro ao deletar comentário no banco de dados.', 500, error);
        }
    }
}

export const commentRepository = new CommentRepository();
