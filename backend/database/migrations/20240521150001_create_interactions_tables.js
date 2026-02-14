
import { query } from '../pool.js';

const up = async () => {
  // A função uuid_generate_v4() precisa da extensão 'uuid-ossp' habilitada.
  // Garantimos que a extensão esteja disponível antes de criar as tabelas.
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  await query(`
    -- Tabela para armazenar "likes" ou reações a diferentes tipos de conteúdo.
    CREATE TABLE IF NOT EXISTS likes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        target_id UUID NOT NULL,
        target_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, target_id, target_type)
    );

    -- Tabela para armazenar visualizações de conteúdo.
    CREATE TABLE IF NOT EXISTS views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        target_id UUID NOT NULL,
        target_type TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Índices para otimizar buscas.
    CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
    CREATE INDEX IF NOT EXISTS idx_views_target ON views(target_type, target_id);
  `);
};

const down = async () => {
  await query(`
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS views CASCADE;
  `);
};

// Exporta as funções para serem usadas pelo sistema de migração.
export {
    up,
    down
}
