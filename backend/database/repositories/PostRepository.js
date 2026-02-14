
import { query } from '../pool.js';

// Mapeia a linha do banco de dados para o objeto Post, alinhado com o schema.
const mapRowToPost = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        userId: row.user_id,
        content: row.content,
        mediaUrls: row.media_urls,
        status: row.status,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        publishedAt: row.published_at
    };
};

export const PostRepository = {
    // Cria um novo post, deixando o banco de dados gerar o UUID.
    async create(post) {
        const { userId, content, mediaUrls, status, publishedAt } = post;
        const res = await query(`
            INSERT INTO posts (user_id, content, media_urls, status, published_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, content, mediaUrls, status, publishedAt]);
        // Retorna o post completo com o ID gerado pelo banco de dados.
        return mapRowToPost(res.rows[0]);
    },

    // Lista os posts com paginação.
    async list(limit = 50, cursor = null) {
        const params = [];
        let sql = 'SELECT * FROM posts WHERE status = \'published\' ';
        let placeholderCount = 1;

        if (cursor) {
            // Assumindo paginação baseada em 'published_at'
            sql += `AND published_at < $${placeholderCount++} `;
            params.push(cursor);
        }

        sql += `ORDER BY published_at DESC LIMIT $${placeholderCount++}`;
        params.push(limit);

        const res = await query(sql, params);
        return res.rows.map(mapRowToPost);
    },

    // Deleta um post pelo seu ID (UUID).
    async delete(id) {
        // Validação básica de UUID para evitar erros no banco de dados.
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            // Lança um erro se o ID não for um UUID, que será capturado pela rota.
            throw new Error('ID inválido. O formato esperado é UUID.');
        }
        const res = await query('DELETE FROM posts WHERE id = $1', [id]);
        // Retorna true se uma linha foi afetada.
        return res.rowCount > 0;
    },

    // A lógica para adicionar comentários precisaria ser reavaliada com base no schema atual,
    // que usa uma contagem 'comment_count' em vez de um JSON aninhado.
    // Esta função foi comentada para evitar erros.
    /*
    async addComment(id, comment) {
        await query(`
            UPDATE posts 
            SET data = jsonb_set(data, '{comments}', COALESCE(data->'comments', '[]'::jsonb) || $2::jsonb)
            WHERE id = $1
        `, [id, JSON.stringify(comment)]);
    }
    */
};
