
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { db } from '@/database'; // Importa a instância do banco de dados
import { User } from '@/types';

export const useUserProfile = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndCacheProfile = async () => {
            const userId = authService.getUserId();

            if (!userId) {
                navigate('/login');
                return;
            }

            try {
                // 1. Tenta carregar do cache local primeiro.
                const cachedUser = await db.users.get(userId);
                if (cachedUser) {
                    setUser(cachedUser);
                } else {
                    // Fallback para os dados básicos se não houver nada no cache.
                    const basicUser = authService.getCurrentUser();
                    if (basicUser) setUser(basicUser as User);
                }
                setLoading(true); // Mantém o loading para a busca de dados frescos.

                // 2. Busca os dados mais recentes da API.
                const fullProfile = await userService.getUserProfile(userId);
                
                // 3. Atualiza o estado da UI com os dados frescos.
                setUser(fullProfile);
                
                // 4. Salva os dados frescos no cache para futuras visitas.
                await db.users.set(fullProfile);
                
                setError(null);
            } catch (err) {
                console.error("Falha ao buscar e cachear o perfil:", err);
                setError("Não foi possível atualizar o perfil. Exibindo dados em cache.");
            } finally {
                setLoading(false);
            }
        };

        fetchAndCacheProfile();

    }, [navigate]);

    return { user, loading, error };
};
