
export const interactionsSchema = `
    -- 📝 Tabela para armazenar "likes" ou reações a diferentes tipos de conteúdo.
    CREATE TABLE IF NOT EXISTS likes (
        -- 📝 ID único para o like.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que deu o like.
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 ID do conteúdo que recebeu o like.
        target_id UUID NOT NULL,
        -- 📝 Tipo do conteúdo que recebeu o like (ex: 'post', 'comment', 'reel').
        target_type TEXT NOT NULL,
        -- 📝 Data e hora em que o like foi dado.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Garante que um usuário só possa dar um like por conteúdo.
        UNIQUE(user_id, target_id, target_type)
    );

    -- 📝 Tabela para armazenar visualizações de conteúdo.
    CREATE TABLE IF NOT EXISTS views (
        -- 📝 ID único para o registro de visualização.
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        -- 📝 ID do usuário que visualizou (pode ser nulo para visualizações anônimas).
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        -- 📝 ID do conteúdo que foi visualizado.
        target_id UUID NOT NULL,
        -- 📝 Tipo do conteúdo que foi visualizado (ex: 'post', 'reel', 'profile').
        target_type TEXT NOT NULL,
        -- 📝 Data e hora da visualização.
        created_at TIMESTAMPTZ DEFAULT NOW(),
        -- 📝 Garante que uma visualização seja registrada apenas uma vez por usuário/conteúdo.
        UNIQUE(user_id, target_id, target_type)
    );

    -- 📝 Cria um índice combinado para buscar likes em um conteúdo específico.
    CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
    -- 📝 Cria um índice combinado para buscar visualizações em um conteúdo específico.
    CREATE INDEX IF NOT EXISTS idx_views_target ON views(target_type, target_id);
`;
