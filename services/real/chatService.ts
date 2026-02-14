import { db } from '@/database';
import { sqlite } from '@/database/engine';
import { ChatMessage, ChatData, User } from '../../types';
import { authService } from '../authService';
import { API_BASE } from '../../apiConfig';
import { apiClient } from '../apiClient';

const API_URL = `${API_BASE}/api/messages`;

export const chatService = {

    // --- Novas Funções de Sincronização e Acesso a Dados ---

    async syncChats(): Promise<void> {
        try {
            const chats = await apiClient.get<ChatData[]>(`/chats`);
            if (chats && chats.length > 0) {
                sqlite.upsertItems('chats', chats);
            }
        } catch (error) {
            console.error("Falha ao sincronizar chats:", error);
        }
    },

    getAllChats: (): ChatData[] => {
        return db.chats.getAll();
    },

    getChatById: (chatId: string): ChatData | undefined => {
        return db.chats.get(chatId);
    },
    
    // --- Funções Auxiliares e de Interação (Mantidas) ---

    reportMessage: (chatId: string, messageId: number, reason: string, comments: string) => {
        const chat = db.chats.get(chatId);
        if (chat) {
            const msgIndex = chat.messages.findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                chat.messages[msgIndex].isReported = true;
                chat.messages[msgIndex].reportReason = reason;
                chat.messages[msgIndex].reportComments = comments;
                sqlite.upsertItems('chats', [chat]);
                 console.log(`Reporting message ${messageId} in chat ${chatId} for: ${reason} with comments: ${comments}`);
            }
        }
    },

    reactToMessage: (chatId: string, messageId: number, reaction: string) => {
        const chat = db.chats.get(chatId);
        const currentUser = authService.getCurrentUser();
        if (!chat || !currentUser) return;

        const msgIndex = chat.messages.findIndex(m => m.id === messageId);
        if (msgIndex === -1) return;

        const message = chat.messages[msgIndex];
        message.reactions = message.reactions || {};

        Object.keys(message.reactions).forEach(key => {
            message.reactions[key] = message.reactions[key].filter(id => id !== currentUser.id);
            if (message.reactions[key].length === 0) {
                delete message.reactions[key];
            }
        });

        if (message.reactions[reaction]?.includes(currentUser.id)) {
            // Already reacted
        } else {
            message.reactions[reaction] = [...(message.reactions[reaction] || []), currentUser.id];
        }

        sqlite.upsertItems('chats', [chat]);
    },

    getGroupUnreadCount: (groupId: string): number => {
        const chat = db.chats.get(groupId);
        if (!chat || !Array.isArray(chat.messages)) {
            return 0;
        }

        const currentUser = authService.getCurrentUser();
        if (!currentUser) return 0;

        let unreadCount = 0;
        chat.messages.forEach(message => {
            if (message.senderId !== currentUser.id && !message.isRead) {
                unreadCount++;
            }
        });
        return unreadCount;
    },

    getUnreadCount: (): number => {
        const chats = db.chats.getAll();
        if (!Array.isArray(chats)) return 0;

        let unreadCount = 0;
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return 0;

        chats.forEach(chat => {
            if (chat && Array.isArray(chat.messages)) {
                chat.messages.forEach(message => {
                    if (message.senderId !== currentUser.id && !message.isRead) {
                        unreadCount++;
                    }
                });
            }
        });
        return unreadCount;
    },
};
