
import { db } from '@/database';
import { ChatMessage, ChatData } from '../../types';
import { authService } from '../authService';
import { API_BASE } from '../../apiConfig';
import { ChatVisibilityManager } from '../chat/ChatVisibilityManager';

const API_URL = `${API_BASE}/api/messages`;

export const chatService = {
    // ... other methods

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

        // User can only have one reaction per message. Remove any previous reaction.
        Object.keys(message.reactions).forEach(key => {
            message.reactions[key] = message.reactions[key].filter(id => id !== currentUser.id);
            if (message.reactions[key].length === 0) {
                delete message.reactions[key];
            }
        });

        // Add or toggle the new reaction
        if (message.reactions[reaction]?.includes(currentUser.id)) {
            // Already reacted with this emoji, so do nothing (already removed above)
        } else {
            message.reactions[reaction] = [...(message.reactions[reaction] || []), currentUser.id];
        }

        db.chats.set(chat);
    },

    // ADDED MISSING FUNCTION
    getUnreadCount: (): number => {
        const chats = db.chats.getAll();
        // A simple (and likely inaccurate) way to count unread messages.
        // This assumes a message is "unread" if it's not from the current user.
        // A proper implementation would need a real "read" status on messages.
        let unreadCount = 0;
        const currentUser = authService.getCurrentUser();
        if (!currentUser) return 0;

        chats.forEach(chat => {
            chat.messages.forEach(message => {
                if (message.senderId !== currentUser.id && !message.isRead) { 
                    unreadCount++;
                }
            });
        });
        return unreadCount;
    },

    // ... rest of the service
};
