
import { apiClient } from './apiClient';
import { User } from '@/types';

// Memória cache local para relacionamentos (padrão Observer)
let following: User[] = [];
let followers: User[] = [];
const subscribers: Function[] = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

const relationshipService = {
  // Sincroniza os relacionamentos do usuário autenticado com o backend.
  async syncRelationships() {
    try {
      // CORREÇÃO: Aponta para a rota correta que busca os relacionamentos do usuário logado.
      const response = await apiClient.get('/relationships/me'); 
      if (response && response.data && Array.isArray(response.data.relationships)) {
        following = response.data.relationships.map((r: any) => r.following);
        notifySubscribers();
      } else {
        following = [];
        notifySubscribers();
      }
    } catch (error) {
      console.error('Falha ao sincronizar relacionamentos:', error);
      // Em caso de erro, limpa a lista para evitar dados inconsistentes.
      following = [];
      notifySubscribers();
      throw error; // Propaga o erro para que a UI possa reagir.
    }
  },

  // Segue um usuário.
  async follow(userId: string) {
    // Implementação otimista: atualiza a UI primeiro.
    const tempFollowing = [...following, { id: userId }]; // Simulação
    following = tempFollowing;
    notifySubscribers();

    try {
      await apiClient.post('/relationships/follow', { followingId: userId });
      // A sincronização total não é mais necessária a cada ação.
    } catch (error) {
      console.error('Falha ao seguir usuário:', error);
      // Reverte em caso de erro.
      following = following.filter(u => u.id !== userId);
      notifySubscribers();
    }
  },

  // Deixa de seguir um usuário.
  async unfollow(userId: string) {
    const previousFollowing = [...following];
    following = following.filter(u => u.id !== userId);
    notifySubscribers();

    try {
      await apiClient.post('/relationships/unfollow', { followingId: userId });
    } catch (error) {
      console.error('Falha ao deixar de seguir usuário:', error);
      following = previousFollowing; // Restaura em caso de erro.
      notifySubscribers();
    }
  },

  // Retorna a lista de usuários que o usuário logado segue.
  getFollowing(userId: string): User[] {
    // Otimizado: Retorna a lista local já sincronizada.
    return following;
  },

  // Retorna a lista de seguidores de um usuário (mock, pois o backend não provê isso diretamente ainda).
  getFollowers(userId: string): User[] {
    // Esta função ainda depende de uma implementação de backend mais robusta.
    // Por enquanto, retornamos um mock ou uma lista vazia.
    return followers;
  },

  // Verifica se o usuário logado segue um determinado usuário.
  isFollowing(userId: string): boolean {
    return following.some(user => user.id === userId);
  },

  // Permite que componentes se inscrevam para receber atualizações.
  subscribe(callback: Function) {
    subscribers.push(callback);
    return () => {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }
};

export { relationshipService };
