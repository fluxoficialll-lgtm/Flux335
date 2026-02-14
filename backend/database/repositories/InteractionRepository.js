
import { query } from '../pool.js';

// Mapeia o nome do tipo de interação para o nome da tabela correspondente.
const getTableName = (type) => {
    if (type === 'like') return 'likes';
    if (type === 'view') return 'views';
    throw new Error(`Tipo de interação desconhecido: ${type}`);
};

// Mapeia o tipo de interação para a coluna de contagem na tabela 'posts'.
const getCounterColumn = (type) => {
    if (type === 'like') return 'like_count';
    // O schema de 'posts' não possui 'views_count', então retornamos null para 'view'.
    if (type === 'view') return null; 
    return null;
};

export const InteractionRepository = {
    /**
     * Registra uma interação única (like ou view) na tabela apropriada.
     */
    async recordUniqueInteraction(targetId, userId, type) {
        try {
            const tableName = getTableName(type);
            // A coluna é 'target_id' e não 'post_id' para ser genérica.
            const insertResult = await query(`
                INSERT INTO ${tableName} (target_id, user_id, target_type)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, target_id, target_type) DO NOTHING
                RETURNING id
            `, [targetId, userId, 'post']); // Assumindo que o alvo é sempre um 'post' por enquanto.

            // Se a inserção foi bem-sucedida (uma nova linha foi criada).
            if (insertResult.rows.length > 0) {
                const counterColumn = getCounterColumn(type);
                // Se houver uma coluna de contagem correspondente (ex: 'like_count').
                if (counterColumn) {
                    await query(`
                        UPDATE posts 
                        SET ${counterColumn} = ${counterColumn} + 1
                        WHERE id = $1
                    `, [targetId]);
                }
                return true;
            }
            return false; // Interação já existia.
        } catch (error) {
            console.error(`[InteractionRepo] Erro ao registrar ${type}:`, error.message);
            // Lançar o erro permite que a camada de rota o capture e responda adequadamente.
            throw error;
        }
    },

    /**
     * Remove uma interação (apenas likes) da tabela.
     */
    async removeInteraction(targetId, userId, type) {
        // Esta função geralmente se aplica apenas a 'likes'.
        if (type !== 'like') return false;

        try {
            const tableName = getTableName(type);
            const deleteResult = await query(`
                DELETE FROM ${tableName} 
                WHERE target_id = $1 AND user_id = $2 AND target_type = $3
                RETURNING id
            `, [targetId, userId, 'post']);

            // Se a exclusão foi bem-sucedida (uma linha foi removida).
            if (deleteResult.rows.length > 0) {
                const counterColumn = getCounterColumn(type);
                if (counterColumn) {
                    await query(`
                        UPDATE posts 
                        SET ${counterColumn} = GREATEST(0, ${counterColumn} - 1)
                        WHERE id = $1
                    `, [targetId]);
                }
                return true;
            }
            return false; // Nenhuma interação para remover.
        } catch (error) {
            console.error(`[InteractionRepo] Erro ao remover ${type}:`, error.message);
            throw error;
        }
    }
};
