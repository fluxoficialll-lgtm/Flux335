import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';
import { userService } from '../services/userService'; // Importa o userService
import { db } from '@/database';
import { MessagesMenuModal } from '../components/chat/MessagesMenuModal';
import { MainHeader } from '../components/layout/MainHeader';
import { MessageListItem } from '../components/chat/MessageListItem';
import { MessagesEmptyState } from '../components/chat/MessagesEmptyState';
import { MessagesFooter } from '../components/chat/MessagesFooter';
import { useModal } from '../components/ModalSystem';
import { User } from '@/types';

interface Contact {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: number; 
  time: string; 
  status: 'online' | string;
  isOnline: boolean;
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
}

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { showConfirm } = useModal();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const formatLastSeen = (timestamp?: number) => {
      if (!timestamp) return "Offline";
      const diff = Date.now() - timestamp;
      if (diff < 2 * 60 * 1000) return "online"; 
      return `Visto por último`;
  };

  const loadChats = useCallback(() => {
      const currentUser = authService.getCurrentUser();
      if (!currentUser?.email) return;
      
      const rawChats = chatService.getAllChats();
      const users = db.users.getAll();
      
      const formatted: Contact[] = Object.values(rawChats).map((chat): Contact | null => {
          const chatIdStr = chat.id.toString().toLowerCase();
          if (!chatIdStr.includes('@')) return null;

          const lastMsg = chat.messages[chat.messages.length - 1];
          if (!lastMsg) return null;

          const otherEmail = chatIdStr.split('_').find(p => p !== currentUser.email.toLowerCase());
          const user = otherEmail ? Object.values(users).find(u => u.email.toLowerCase() === otherEmail) : undefined;

          return {
              id: chat.id.toString(),
              name: user?.profile?.nickname || user?.profile?.name || chat.contactName,
              handle: user?.profile?.name || '',
              avatar: user?.profile?.photoUrl,
              lastMessage: (lastMsg.senderEmail?.toLowerCase() === currentUser.email.toLowerCase() ? 'Você: ' : '') + (lastMsg.text || 'Mídia'),
              lastMessageTime: lastMsg.id,
              time: lastMsg.timestamp,
              status: formatLastSeen(user?.lastSeen),
              isOnline: (Date.now() - (user?.lastSeen || 0)) < 2 * 60 * 1000,
              unreadCount: chatService.getUnreadCount(chat.id),
              isMuted: chat.isMuted,
              isPinned: chat.isPinned,
          };
      }).filter((c): c is Contact => c !== null)
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return b.lastMessageTime - a.lastMessageTime;
        });

      setContacts(formatted);
  }, []);

  useEffect(() => {
    const syncAndLoad = async () => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser?.id) {
            navigate('/login');
            return;
        }
        
        // Garante que os dados dos usuários estejam no cache
        await userService.syncAllUsers(); 
        
        loadChats();
    };
    
    syncAndLoad();

    const unsubChats = db.subscribe('chats', loadChats);
    const unsubUsers = db.subscribe('users', loadChats);
    return () => { unsubChats(); unsubUsers(); };
  }, [loadChats, navigate]);

  const handleSelectionAction = async (action: 'delete' | 'mute' | 'pin') => {
    if (selectedIds.length === 0) return;
    
    const confirmText = {
        delete: `Você tem certeza que quer apagar ${selectedIds.length} conversa(s)? Esta ação não pode ser desfeita.`,
        mute: `Você quer silenciar ${selectedIds.length} conversa(s)?`,
        pin: `Você quer fixar ${selectedIds.length} conversa(s)?`
    };

    const confirmed = await showConfirm(`Confirmar Ação`, confirmText[action]);
    if (confirmed) {
        selectedIds.forEach(id => {
            if (action === 'delete') chatService.deleteMessages(id, [], 'me');
            if (action === 'mute') chatService.toggleMuteChat(id);
            if (action === 'pin') chatService.togglePinChat(id);
        });
        setSelectedIds([]);
        setIsSelectionMode(false);
        loadChats();
    }
  };

  const handleContactClick = (contactId: string) => {
      if (isSelectionMode) {
          setSelectedIds(prev => prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]);
      } else {
          navigate(`/chat/${contactId}`);
      }
  };

  return (
    <div className="h-[100dvh] bg-gray-900 text-white flex flex-col overflow-hidden">
        <MainHeader 
            leftContent={
                <button onClick={() => isSelectionMode ? (setIsSelectionMode(false), setSelectedIds([])) : setIsMenuModalOpen(true)} className="text-blue-400 text-xl w-8 h-8">
                    <i className={`fa-solid ${isSelectionMode ? 'fa-xmark' : 'fa-sliders'}`}></i>
                </button>
            }
            title={isSelectionMode ? `${selectedIds.length} selecionada(s)` : "Mensagens"}
            rightContent={
              isSelectionMode ? (
                <div className="flex items-center gap-4 text-blue-400 text-xl">
                  <button onClick={() => handleSelectionAction('pin')} disabled={selectedIds.length === 0} className="disabled:opacity-30"><i className="fa-solid fa-thumbtack"></i></button>
                  <button onClick={() => handleSelectionAction('mute')} disabled={selectedIds.length === 0} className="disabled:opacity-30"><i className="fa-solid fa-bell-slash"></i></button>
                  <button onClick={() => handleSelectionAction('delete')} disabled={selectedIds.length === 0} className="text-red-500 disabled:opacity-30"><i className="fa-solid fa-trash"></i></button>
                </div>
              ) : (
                <button onClick={() => navigate('/groups')} className="text-blue-400 text-xl w-8 h-8"><i className="fa-solid fa-users"></i></button>
              )
            }
        />

        <main className="flex-grow pt-[60px] pb-[70px] overflow-y-auto no-scrollbar">
            {contacts.length > 0 ? contacts.map(contact => (
                <MessageListItem 
                  key={contact.id}
                  contact={contact}
                  isSelected={selectedIds.includes(contact.id)}
                  onClick={() => handleContactClick(contact.id)}
                  onAvatarClick={(e) => { e.stopPropagation(); navigate(`/user/${contact.handle}`); }}
                />
            )) : <MessagesEmptyState />}
        </main>

        <MessagesFooter uiVisible={true} unreadMsgs={0} unreadNotifs={0} />

        <MessagesMenuModal 
            isOpen={isMenuModalOpen}
            onClose={() => setIsMenuModalOpen(false)}
            onSelectMode={() => setIsSelectionMode(true)}
            onMarkAllRead={() => chatService.markAllAsRead().then(loadChats)}
            onViewBlocked={() => navigate('/blocked-users')}
        />
    </div>
  );
};
