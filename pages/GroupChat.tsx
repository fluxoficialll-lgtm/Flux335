
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { chatService } from '../services/chatService'; 
import { authService } from '../services/authService';
import { privacyService } from '../services/privacyService'; 
import { postService } from '../services/postService';
import { db } from '@/database';
import { Group, ChatMessage } from '../types';
import { useModal } from '../components/ModalSystem';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { ChatHeader } from '../components/chat/ChatHeader';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageItem } from '../components/chat/MessageItem';
import { MediaPreviewOverlay } from '../components/chat/MediaPreviewOverlay';
import { GroupMenuModal } from '../components/groups/menu/GroupMenuModal';
import { useAccessValidationFlow } from '../flows/groups/AccessValidationFlow.tsx';

export const GroupChat: React.FC = () => {
  const navigate = useNavigate();
  const { id, channelId } = useParams<{ id: string, channelId?: string }>();
  const { showConfirm, showOptions } = useModal(); 
  const { validateGroupAccess } = useAccessValidationFlow();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 1. Adicionado estado de loading
  const [activeChannelId, setActiveChannelId] = useState<string>(channelId || 'general');
  
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMsgIds, setSelectedMsgIds] = useState<number[]>([]);

  const [playingAudioId, setPlayingAudioId] = useState<number | null>(null);
  const audioTimeoutRef = useRef<any>(null);

  const [zoomedMedia, setZoomedMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ file: File, url: string, type: 'image' | 'video' | 'file' } | null>(null);
  const [mediaCaption, setMediaCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const currentUserEmail = authService.getCurrentUserEmail()?.toLowerCase();
  const currentUserId = authService.getCurrentUserId();

  const currentChatId = useMemo(() => `${id}_${activeChannelId}`, [id, activeChannelId]);

  const loadMessages = useCallback(() => { 
    if (currentChatId) {
        const chatData = chatService.getChat(currentChatId);
        const rawMessages = chatData.messages || [];
        const uniqueMap = new Map();
        rawMessages.forEach(m => {
            const deletedBy = m.deletedBy || [];
            if (!deletedBy.includes(currentUserEmail || '')) {
                uniqueMap.set(m.id, m);
            }
        });
        const deduplicated = Array.from(uniqueMap.values()).sort((a, b) => a.id - b.id);
        setMessages(deduplicated); 
    }
  }, [currentChatId, currentUserEmail]);

  useEffect(() => {
    if (id) {
        const hasAccess = validateGroupAccess(id);
        if (!hasAccess) {
            // O redirecionamento já acontece no flow, apenas paramos a execução aqui.
            return;
        }

        const loadedGroup = groupService.getGroupById(id);
        if (loadedGroup) {
            setGroup(loadedGroup);
            const isOwner = loadedGroup.creatorId === currentUserId;
            const isAdm = isOwner || (currentUserId && loadedGroup.adminIds?.includes(currentUserId));
            setIsCreator(isOwner);
            setIsAdmin(!!isAdm);
            loadMessages();
            chatService.markChatAsRead(currentChatId);
            setIsLoading(false); // 2. Desativa o loading APÓS carregar os dados
        } else {
            // Se o grupo não for encontrado, redireciona para a home de grupos
            navigate('/groups');
        }
    }
  }, [id, activeChannelId, currentChatId, loadMessages, navigate, validateGroupAccess, currentUserId]);


  useEffect(() => {
      const unsub = db.subscribe('chats', loadMessages);
      return () => unsub();
  }, [loadMessages]);

  const handleSendMessage = (text: string) => {
      const userInfo = authService.getCurrentUser();
      const newMessage: ChatMessage = {
          id: Date.now(),
          senderName: userInfo?.profile?.nickname || userInfo?.profile?.name || 'Você',
          senderAvatar: userInfo?.profile?.photoUrl,
          senderEmail: userInfo?.email,
          text, type: 'sent', contentType: 'text',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'sent',
          deletedBy: []
      };
      chatService.sendMessage(currentChatId, newMessage);
  };

  const handleToggleSelection = (msgId: number) => {
      setSelectedMsgIds(prev => {
          const next = prev.includes(msgId) ? prev.filter(id => id !== msgId) : [...prev, msgId];
          if (next.length === 0) setIsSelectionMode(false);
          return next;
      });
  };

  const handleStartSelection = (msgId: number) => {
      setIsSelectionMode(true);
      setSelectedMsgIds([msgId]);
      if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleDeleteSelected = async () => {
    if (selectedMsgIds.length === 0) return;
    
    const target = await showOptions("Excluir Mensagem", [
        { label: 'Excluir para mim', value: 'me', icon: 'fa-solid fa-user' },
        { label: 'Excluir para todos', value: 'all', icon: 'fa-solid fa-users', isDestructive: true }
    ]);

    if (target) {
        await chatService.deleteMessages(currentChatId, selectedMsgIds, target);
        setIsSelectionMode(false);
        setSelectedMsgIds([]);
        loadMessages();
    }
  };

  const activeChannelName = useMemo(() => {
      if (activeChannelId === 'general') return 'Geral';
      return group?.channels?.find(c => c.id === activeChannelId)?.name || 'Tópico';
  }, [group, activeChannelId]);

  // 3. Adicionado Renderização Nula ou de Carregamento
  if (isLoading) {
      return null; // Ou <LoadingSpinner /> para um feedback visual melhor
  }

  return (
    <div className={`h-[100dvh] flex flex-col overflow-hidden ${group?.isVip ? 'secure-content' : ''}`} style={{ background: 'radial-gradient(circle at top left, #0c0f14, #0a0c10)', color: '#fff' }}>
      <ChatHeader
        title={group?.name || 'Carregando...'}
        subtitle={`#${activeChannelName}`}
        avatar={group?.coverImage}
        onBack={() => navigate('/groups')}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedMsgIds.length}
        onCancelSelection={() => { setIsSelectionMode(false); setSelectedMsgIds([]); }}
        onDeleteSelection={handleDeleteSelected}
        onMenuClick={() => setIsMenuModalOpen(true)}
      />

      <main style={{ flexGrow: 1, width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '60px' }}>
          <Virtuoso
              ref={virtuosoRef}
              style={{ height: '100%', paddingBottom: '80px' }}
              data={messages}
              initialTopMostItemIndex={messages.length - 1}
              followOutput="smooth"
              itemContent={(index, msg) => (
                  <MessageItem
                    key={msg.id}
                    msg={msg}
                    isMe={msg.senderEmail?.toLowerCase() === currentUserEmail}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedMsgIds.includes(msg.id)}
                    onSelect={handleToggleSelection}
                    onStartSelection={handleStartSelection}
                    onMediaClick={(url, type) => setZoomedMedia({ url, type })}
                    playingAudioId={playingAudioId}
                    onPlayAudio={() => {}}
                  />
              )}
          />
      </main>

      {!isSelectionMode && (
          <ChatInput
            onSendMessage={handleSendMessage}
            onSendAudio={() => {}}
            onFileSelect={() => {}}
            canPost={true}
            placeholder={`Conversar em #${activeChannelName}...`}
          />
      )}

      <GroupMenuModal 
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        isCreator={isCreator}
        isAdmin={isAdmin}
        onSearch={() => {}}
        onClear={() => setIsSelectionMode(true)}
        onSettings={() => navigate(`/group-settings/${id}`)}
        onDelete={() => {}}
        onLeave={() => {}}
      />
    </div>
  );
};
