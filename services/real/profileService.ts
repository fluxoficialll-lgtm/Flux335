import { UserProfile, User } from '../../types';
import { db } from '@/database';
import { sqlite } from '@/database/engine';
import { API_BASE } from '../../apiConfig';
import { userSearchService } from './userSearchService';
import { apiClient } from '../apiClient';

// A constante API_USERS já aponta para o caminho correto /api/users
const API_USERS = `${API_BASE}/api/users`;

export const profileService = {
  
  syncAllUsers: async (): Promise<void> => {
    try {
      // CORRIGIDO: Usando a constante API_USERS que contém o caminho correto.
      const response = await apiClient.get<{users: User[]}>(API_USERS);
      if (response && response.users && response.users.length > 0) {
        sqlite.upsertItems('users', response.users);
      }
    } catch (error) {
      console.error("Falha ao sincronizar todos os usuários:", error);
    }
  },

  getUserProfile: async (userId: string): Promise<User | null> => {
    // Primeiro, tenta buscar no banco de dados local para uma resposta mais rápida.
    const localUser = db.users.findById(userId);
    if (localUser) {
      return localUser;
    }

    // Se não encontrar localmente, busca na API.
    try {
      // CORRIGIDO: O endpoint correto para buscar um usuário é /api/users/:id.
      const user = await apiClient.get<User>(`${API_USERS}/${userId}`);
      if (user) {
        sqlite.upsertItems('users', [user]);
        return user;
      }
      return null;
    } catch (error) {
      console.error(`Falha ao buscar o perfil do usuário ${userId}:`, error);
      return null;
    }
  },

  completeProfile: async (email: string, data: UserProfile): Promise<User> => {
      // Nota: Este endpoint /update pode precisar de revisão no futuro, mas não é a causa do bug atual.
      const response = await fetch(`${API_USERS}/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim(), updates: { profile: data, isProfileCompleted: true } })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao atualizar perfil.");
      
      sqlite.upsertItems('users', [result.user]);
      localStorage.setItem('cached_user_profile', JSON.stringify(result.user));
      return result.user;
  },

  checkUsernameAvailability: async (name: string): Promise<boolean> => {
      const results = await userSearchService.searchUsers(name);
      return !results.some(u => u.profile?.name === name.toLowerCase());
  }
};
