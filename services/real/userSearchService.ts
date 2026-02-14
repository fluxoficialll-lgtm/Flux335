
import { User } from '../../types';
import { db } from '@/database';
import { API_BASE } from '../../apiConfig';

const API_USERS = `${API_BASE}/api/users`;

export const userSearchService = {
  syncRemoteUsers: async (currentUserId: string | null) => {
      try {
          const response = await fetch(`${API_USERS}/sync`);
          const data = await response.json();
          if (data && Array.isArray(data.users)) {
              data.users.forEach((user: User) => {
                  if (currentUserId && user.id === currentUserId) return;
                  db.users.set(user);
              });
          }
      } catch (e) { console.warn("⚠️ [Sync] Falha ao sincronizar usuários."); }
  },

  searchUsers: async (query: string): Promise<User[]> => {
      // ETAPA 1: Validar a entrada da busca.
      // Impede que uma chamada à API seja feita se o termo de busca for nulo, indefinido, ou apenas espaços em branco.
      // Isso corrige o erro 400 (Bad Request) que estava acontecendo.
      if (!query || !query.trim()) {
          return []; // Retorna um array vazio imediatamente, sem fazer a chamada à API.
      }

      try {
          // ETAPA 2: Fazer a chamada à API com o parâmetro correto.
          // O nome do parâmetro foi corrigido de 'q' para 'term', que é o que o backend espera.
          // O termo de busca é codificado para garantir que caracteres especiais sejam enviados corretamente.
          const res = await fetch(`${API_USERS}/search?term=${encodeURIComponent(query)}`);

          // ETAPA 3: Verificar se a requisição foi bem-sucedida.
          // Se a resposta não for 'ok' (ou seja, status não for 2xx), um erro é registrado no console.
          // Isso ajuda a depurar problemas futuros.
          if (!res.ok) {
              console.error(`A busca de usuários falhou com o status: ${res.status}`);
              return []; // Retorna um array vazio em caso de falha.
          }
          
          // ETAPA 4: Retornar os dados da resposta.
          // O corpo da resposta é convertido para JSON. Se a resposta for vazia, retorna um array vazio.
          return await res.json() || [];

      } catch (e) { 
          // ETAPA 5: Capturar erros de rede ou outros problemas.
          // Se a chamada 'fetch' falhar por motivos de rede ou outros erros, eles são capturados aqui.
          console.error("Ocorreu um erro durante a busca de usuários:", e);
          return []; // Retorna um array vazio para garantir que o app não quebre.
      }
  },

  fetchUserByHandle: async (handle: string, fallbackEmail?: string): Promise<User | undefined> => {
      if (!handle) return undefined;
      const clean = handle.replace('@', '').toLowerCase().trim();
      const users = await userSearchService.searchUsers(clean);
      const found = users.find((u: any) => u.profile?.name === clean);
      if (found) db.users.set(found); 
      return found;
  },

  getUserByHandle: (handle: string): User | undefined => {
      const clean = handle.replace('@', '').toLowerCase().trim();
      return Object.values(db.users.getAll()).find(u => u.profile?.name === clean);
  },

  getAllUsers: (): User[] => Object.values(db.users.getAll())
};
