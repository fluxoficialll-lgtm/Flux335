
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ProviderCredentialsModal } from '../components/financial/ProviderCredentialsModal';
import ProviderSettingsModal from '../components/financial/ProviderSettingsModal';
import { paypalService } from '../services/paypalService';
import { stripeService } from '../services/stripeService';
import { syncPayService } from '../services/syncPayService';
import './ProviderConfig.css';
import { providers } from '../constants/providerData';
import { ProviderListItem } from '../components/financial/ProviderListItem';

export const ProviderConfig: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  useEffect(() => {
      const loadConfig = () => {
          const user = authService.getCurrentUser();
          if (user) {
              const connected = new Set<string>();
              
              if (user.paymentConfigs) {
                  Object.values(user.paymentConfigs).forEach(conf => {
                      if (conf.isConnected) connected.add(conf.providerId);
                  });
              }
              
              if (user.paymentConfig && user.paymentConfig.isConnected) {
                  connected.add(user.paymentConfig.providerId);
              }

              setConnectedProviders(connected);
              
              if (!hasInitialized.current) {
                if (connected.size > 0) {
                    setExpanded(Array.from(connected)[0]);
                } else {
                    setExpanded('syncpay');
                }
                hasInitialized.current = true;
              }
          }
      };
      loadConfig();
  }, []);

  const handleStatusChange = (providerId: string, connected: boolean) => {
      setConnectedProviders(prev => {
          const next = new Set(prev);
          if (connected) next.add(providerId);
          else {
              next.delete(providerId);
              if (expanded === providerId) setExpanded(null);
          }
          return next;
      });
  };

    const handleConnect = async (credentials: any) => {
        if (!selectedProvider) return;

        try {
            let success = false;
            switch (selectedProvider) {
                case 'paypal':
                    await paypalService.authenticate(credentials.clientId, credentials.clientSecret);
                    break;
                case 'stripe':
                    await stripeService.authenticate(credentials.secretKey);
                    break;
                case 'syncpay':
                    await syncPayService.authenticate(credentials.clientId, credentials.clientSecret);
                    break;
                default:
                    console.error('Provedor desconhecido para conexão:', selectedProvider);
                    return;
            }
            handleStatusChange(selectedProvider, true);
        } catch (error) {
            console.error(`Erro ao conectar ${selectedProvider}:`, error);
            throw error;
        }
    };

  const toggleProvider = (id: string) => {
      setExpanded(prev => prev === id ? null : id);
  };

  const handleBack = () => {
      if (window.history.state && window.history.state.idx > 0) {
          navigate(-1);
      } else {
          navigate('/financial');
      }
  };
  
  const openSettingsModal = (providerId: string) => {
      setSelectedProvider(providerId);
      setIsSettingsModalOpen(true);
  };

  const handleManageCredentials = () => {
      if (!selectedProvider) return;
      setIsSettingsModalOpen(false);
      setIsCredentialsModalOpen(true);
  };

  const handleDisconnect = async () => {
      if (!selectedProvider) return;

      try {
          let success = false;
          switch (selectedProvider) {
              case 'paypal':
                  success = await paypalService.disconnect();
                  break;
              case 'stripe':
                  success = await stripeService.disconnect();
                  break;
              case 'syncpay':
                  success = await syncPayService.disconnect();
                  break;
              default:
                  console.error('Provedor desconhecido para desconexão:', selectedProvider);
                  return;
          }

          if (success) {
              handleStatusChange(selectedProvider, false);
          }
      } catch (error) {
          console.error(`Erro ao desconectar ${selectedProvider}:`, error);
      } finally {
          setIsSettingsModalOpen(false);
      }
  };

  const selectedProviderData = useMemo(() => {
    if (!selectedProvider) return null;
    return providers.find(p => p.id === selectedProvider);
  }, [selectedProvider]);

  const connectedList = providers.filter(p => connectedProviders.has(p.id));
  const disconnectedList = providers.filter(p => !connectedProviders.has(p.id));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      
      <header>
        <button onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
        <h1>Provedores de Pagamento</h1>
      </header>

      <main className="no-scrollbar">
        {connectedList.length > 0 && (
            <>
                <div className="section-header"><span></span> Conectados <span></span></div>
                {connectedList.map(provider => (
                    <ProviderListItem 
                        key={provider.id}
                        provider={provider}
                        isExpanded={expanded === provider.id}
                        isConnected={connectedProviders.has(provider.id)}
                        onToggle={toggleProvider}
                        onOpenSettings={openSettingsModal}
                    />
                ))}
            </>
        )}

        <div className="section-header"><span></span> Disponíveis <span></span></div>
        {disconnectedList.map(provider => (
            <ProviderListItem 
                key={provider.id}
                provider={provider}
                isExpanded={expanded === provider.id}
                isConnected={connectedProviders.has(provider.id)}
                onToggle={toggleProvider}
                onOpenSettings={openSettingsModal}
            />
        ))}
        
        <div className="mt-12 p-6 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl text-center opacity-30">
            <i className="fa-solid fa-shield-halved text-2xl mb-3"></i>
            <p className="text-[10px] uppercase font-black tracking-[2px] leading-relaxed">
                Suas credenciais são criptografadas e enviadas via túnel seguro. O Flux não armazena chaves privadas em texto aberto.
            </p>
        </div>
      </main>
      <ProviderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        providerName={selectedProviderData?.name || ''}
        isConnected={selectedProvider ? connectedProviders.has(selectedProvider) : false}
        onManageCredentials={handleManageCredentials}
        onDisconnect={handleDisconnect}
      />
      <ProviderCredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
        providerId={selectedProvider}
        providerName={selectedProviderData?.name || ''}
        onConnect={handleConnect}
      />
    </div>
  );
};
