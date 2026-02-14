
import { db } from '@/database';
import { ChatMessage, ChatData } from '../../types';
import { authService } from '../authService';
import { API_BASE } from '../../apiConfig';
import { ChatVisibilityManager } from '../chat/ChatVisibilityManager';

const API_URL = `${API_BASE}/api/messages`;

export const chatService = {
    reportMessage: (chatId: string, messageId: number, reason: string, comments: string) => {
        const chat = db.chats.get(chatId);
        if (chat) {
            const msgIndex = chat.messages.findIndex(m => m.id === messageId);
            if (msgIndex !== -1) {
                chat.messages[msgIndex].isReported = true;
                chat.messages[msgIndex].reportReason = reason;
                chat.messages[msgIndex].reportComments = comments;
                db.chats.set(chat);
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

        db.chats.set(chat);
    },

    getUnreadCount: (): number => {
        const chats = db.chats.getAll();

        if (!Array.isArray(chats)) {
            console.warn('[chatService] Stored chats is not an array. Returning 0.');
            return 0;
        }

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
