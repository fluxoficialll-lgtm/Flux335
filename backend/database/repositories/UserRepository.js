
import { query } from '../pool.js';

const toUuid = (val) => (val === "" || val === "undefined" || val === "null") ? null : val;

// Esta função agora extrai os metadados da coluna 'data' JSONB.
const mapRowToUser = (row) => {
    if (!row) return null;
    const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
    
    return {
        id: row.id,
        email: row.email,
        handle: row.handle,
        googleId: row.google_id,
        isProfileCompleted: row.is_profile_completed,
        createdAt: row.created_at,
        ...data // Combina os campos de dentro do JSONB no objeto de usuário.
    };
};

export const UserRepository = {
    async findByEmail(email) {
        if (!email) return null;
        const res = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        return mapRowToUser(res.rows[0]);
    },

    async findByHandle(handle) {
        if (!handle) return null;
        const res = await query('SELECT * FROM users WHERE handle = $1', [handle.toLowerCase().trim()]);
        return mapRowToUser(res.rows[0]);
    },

    async findById(id) {
        const uuid = toUuid(id);
        if (!uuid) return null;
        const res = await query('SELECT * FROM users WHERE id = $1', [uuid]);
        return mapRowToUser(res.rows[0]);
    },

    async findByGoogleId(googleId) {
        if (!googleId) return null;
        const res = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        return mapRowToUser(res.rows[0]);
    },

    async searchByTerm(term) {
        if (!term || term.trim() === '') {
            return [];
        }
        const searchTerm = `%${term.toLowerCase().trim()}%`;
        const res = await query(
            'SELECT id, email, handle, data, is_profile_completed FROM users WHERE handle ILIKE $1 OR email ILIKE $1 ORDER BY handle ASC LIMIT 25',
            [searchTerm]
        );
        return res.rows.map(mapRowToUser);
    },

    async create(userData) {
        const { email, password_hash, google_id, handle, is_profile_completed, ...data } = userData;

        const columns = ['email'];
        const values = [email.toLowerCase().trim()];

        if (password_hash) {
            columns.push('password_hash');
            values.push(password_hash);
        }
        if (google_id) {
            columns.push('google_id');
            values.push(google_id);
        }
        if (handle) {
            columns.push('handle');
            values.push(handle.toLowerCase().trim());
        }
        if (is_profile_completed !== undefined) {
            columns.push('is_profile_completed');
            values.push(is_profile_completed);
        }
        
        // Os dados restantes são agrupados no JSONB.
        columns.push('data');
        values.push(JSON.stringify(data));

        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');

        const res = await query(
            `INSERT INTO users (${columnNames}) VALUES (${placeholders}) RETURNING id`,
            values
        );
        return res.rows[0].id;
    },

    // A função de atualização agora usa a coluna 'data' corretamente.
    async update(user) {
        const { id, handle, is_profile_completed, ...data } = user;
        const uuid = toUuid(id);
        
        const sql = `
            UPDATE users SET 
                handle = COALESCE($1, handle),
                is_profile_completed = COALESCE($2, is_profile_completed),
                data = data || $3::jsonb
            WHERE id = $4
        `;

        await query(sql, [
            handle || null,
            is_profile_completed !== undefined ? is_profile_completed : null,
            JSON.stringify(data),
            uuid
        ]);
        return true;
    },

    async getAll() {
        const res = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1000');
        return res.rows.map(mapRowToUser);
    }
};
