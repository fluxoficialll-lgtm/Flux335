
export const usersSchema = `
    -- Habilita a extensão PostGIS se ainda não estiver habilitada.
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL, 
        password TEXT, 
        handle TEXT UNIQUE,
        google_id TEXT UNIQUE,
        wallet_balance NUMERIC(15,2) DEFAULT 0.00,
        is_banned BOOLEAN DEFAULT FALSE,
        is_profile_completed BOOLEAN DEFAULT FALSE,
        trust_score INTEGER DEFAULT 500,
        strikes INTEGER DEFAULT 0,
        data JSONB,
        referred_by_id UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW()
    );
    
    -- Adiciona colunas de geolocalização se não existirem
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='latitude') THEN
            ALTER TABLE users ADD COLUMN latitude DOUBLE PRECISION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='longitude') THEN
            ALTER TABLE users ADD COLUMN longitude DOUBLE PRECISION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='location') THEN
            ALTER TABLE users ADD COLUMN location GEOGRAPHY(Point, 4326);
        END IF;
    END;
    $$;

    -- Índices existentes
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
    CREATE INDEX IF NOT EXISTS idx_users_handle_lower ON users (LOWER(handle));
    CREATE INDEX IF NOT EXISTS idx_users_google ON users(google_id);

    -- Índice Espacial (GIST - Generalized Search Tree)
    CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(location);
`;
