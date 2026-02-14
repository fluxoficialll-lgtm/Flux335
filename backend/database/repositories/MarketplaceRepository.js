
import { query } from '../pool.js';

const mapRowToItem = (row) => {
    if (!row) return null;

    let metadata = {};
    try {
        // Tenta analisar os metadados. Se falhar, registra um erro, mas não quebra a aplicação.
        // Isso impede que um único item com JSON inválido derrube toda a listagem.
        metadata = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    } catch (error) {
        console.error(`Falha ao analisar JSON para o item do marketplace com id: ${row.id}`, error);
        // Retorna null para que o item problemático possa ser filtrado posteriormente.
        return null;
    }

    return {
        ...metadata,
        id: row.id,
        sellerId: row.seller_id,
        createdAt: row.created_at
    };
};

export const MarketplaceRepository = {
    async create(item) {
        const { id, sellerId, ...data } = item;
        await query(`
            INSERT INTO marketplace (id, seller_id, data)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE SET data = $3
        `, [id, sellerId, JSON.stringify(data)]);
        return true;
    },

    async list() {
        const res = await query('SELECT * FROM marketplace ORDER BY created_at DESC');
        // Mapeia as linhas e filtra quaisquer itens nulos que resultaram de erros de análise.
        // Isso garante que a aplicação continue funcionando mesmo com dados corrompidos.
        return res.rows.map(mapRowToItem).filter(item => item !== null);
    },

    async findById(id) {
        const res = await query('SELECT * FROM marketplace WHERE id = $1', [id]);
        return mapRowToItem(res.rows[0]);
    },

    async delete(id) {
        await query('DELETE FROM marketplace WHERE id = $1', [id]);
        return true;
    }
};
