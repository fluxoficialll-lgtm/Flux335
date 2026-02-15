
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { postService } from '@/services/postService'; // 1. Importar o postService
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileTabNav } from '@/features/profile/components/ProfileTabNav';
import { ProfileReelsGrid } from '@/features/profile/components/ProfileReelsGrid';
import { ProfileProductsGrid } from '@/features/profile/components/ProfileProductsGrid';
import { User } from '@/types';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('reels');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Adiciona estado de loading explícito

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) {
            navigate('/login');
            return;
        }

        const fetchProfileData = async () => {
            try {
                // 2. Executa a sincronização de posts e a busca do perfil em paralelo
                await Promise.all([
                    userService.getUserProfile(currentUser.id),
                    postService.syncUserPosts(currentUser.id)
                ]).then(([fullProfile]) => {
                    setUser(fullProfile);
                });

            } catch (err) {
                console.error("Falha ao buscar dados do perfil:", err);
                setError("Não foi possível carregar as informações mais recentes do perfil.");
            } finally {
                setIsLoading(false); // Garante que o loading termine mesmo em caso de erro
            }
        };

        fetchProfileData();
    }, [navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Melhora a experiência de carregamento
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
                <p className="mb-4">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {error && <div className="p-3 text-center text-white bg-red-600">{error}</div>}

            {user && (
                <ProfileHeader
                    user={user}
                    postCount={0} // Este valor pode ser atualizado se necessário
                    onEditProfile={() => navigate('/profile/edit')}
                    onShareProfile={() => { /* Implementar compartilhamento */ }}
                    onLogout={handleLogout}
                />
            )}

            <main className="p-4">
                <ProfileTabNav activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="mt-4">
                    {activeTab === 'reels' && <ProfileReelsGrid />}
                    {activeTab === 'store' && <ProfileProductsGrid />}
                </div>
            </main>
        </div>
    );
};
