import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileTabNav } from '@/features/profile/components/ProfileTabNav';
import { ProfileReelsGrid } from '@/features/profile/components/ProfileReelsGrid';
import { ProfileProductsGrid } from '@/features/profile/components/ProfileProductsGrid';
import { User } from '@/types';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(authService.getCurrentUser());
    const [activeTab, setActiveTab] = useState('reels');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.id) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const fullProfile = await userService.getUserProfile(user.id);
                setUser(fullProfile);
            } catch (err) {
                console.error("Falha ao buscar o perfil:", err);
                setError("Não foi possível carregar as informações mais recentes do perfil.");
            }
        };

        fetchProfile();
    }, [user?.id, navigate]);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-white">
                <p className="mb-4">Usuário não encontrado. Redirecionando para o login...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {error && <div className="p-3 text-center text-white bg-red-600">{error}</div>}

            <ProfileHeader
                user={user}
                postCount={0} 
                onEditProfile={() => navigate('/profile/edit')}
                onShareProfile={() => { /* Implementar compartilhamento */ }}
                onLogout={handleLogout}
            />

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
