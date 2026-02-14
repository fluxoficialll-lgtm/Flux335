
export const usersSchema = `
    -- 📝 Tabela principal para armazenar os dados dos usuários.
    CREATE TABLE IF NOT EXISTS users (
        -- 📝 ID único do usuário, também usado para autenticação no Supabase.
        id UUID PRIMARY KEY,
        -- 📝 Nome de usuário único, usado para login e identificação pública.
        username TEXT UNIQUE NOT NULL,
        -- 📝 Endereço de e-mail único do usuário. Essencial para comunicação e recuperação.
        email TEXT UNIQUE,
        -- 📝 ID do Google, para login social.
        google_id TEXT UNIQUE,
        -- 📝 Nome completo do usuário.
        full_name TEXT,
        -- 📝 URL da foto de perfil do usuário.
        avatar_url TEXT,
        -- 📝 URL da imagem de capa do perfil do usuário.
        cover_photo_url TEXT,
        -- 📝 Biografia ou descrição curta do usuário.
        bio TEXT,
        -- 📝 Website ou link externo do usuário.
        website TEXT,
        -- 📝 Localização do usuário.
        location TEXT,
        -- 📝 Data de nascimento do usuário.
        date_of_birth DATE,
        -- 📝 Data e hora em que a conta do usuário foi criada.
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 📝 Tabela para configurações específicas do usuário.
    CREATE TABLE IF NOT EXISTS user_settings (
        -- 📝 ID único da configuração, vinculado ao ID do usuário.
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        -- 📝 Configuração de privacidade do perfil (ex: public, private).
        profile_privacy TEXT DEFAULT 'public',
        -- 📝 Preferências de notificação em formato JSON.
        notification_preferences JSONB,
        -- 📝 Preferência de idioma do usuário (ex: 'pt-BR', 'en-US').
        language VARCHAR(10) DEFAULT 'pt-BR',
        -- 📝 Preferência de tema da interface (ex: 'light', 'dark').
        theme TEXT DEFAULT 'light',
        -- 📝 Data e hora da última atualização das configurações.
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
`;
