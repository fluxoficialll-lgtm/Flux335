
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { SyncPayForm } from '../components/payments/providers/SyncPayForm';
import { StripeForm } from '../components/payments/providers/StripeForm';
import { PayPalForm } from '../components/payments/providers/PayPalForm';
import ProviderSettingsModal from '../components/financial/ProviderSettingsModal';

interface ProviderData {
    id: string;
    name: string;
    icon: string;
    isPrimary?: boolean;
    status: 'active' | 'coming_soon';
    methods: { type: 'pix' | 'card'; label: string }[];
}

export const ProviderConfig: React.FC = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const hasInitialized = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers: ProviderData[] = useMemo(() => [
      {
          id: 'syncpay',
          name: 'SyncPay (Oficial)',
          icon: 'fa-bolt',
          isPrimary: true,
          status: 'active',
          methods: [
              { type: 'pix', label: 'PIX' }
          ]
      },
      {
          id: 'stripe',
          name: 'Stripe',
          icon: 'fa-brands fa-stripe',
          status: 'active',
          methods: [
              { type: 'card', label: 'Cartão' }
          ]
      },
      {
          id: 'paypal',
          name: 'PayPal',
          icon: 'fa-brands fa-paypal',
          status: 'active',
          methods: [
              { type: 'pix', label: 'PIX' },
              { type: 'card', label: 'Cartão' }
          ]
      },
      {
          id: 'picpay',
          name: 'PicPay',
          icon: 'fa-qrcode',
          status: 'coming_soon',
          methods: [
              { type: 'pix', label: 'PIX' },
              { type: 'card', label: 'Cartão' }
          ]
      }
  ], []);

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
      setIsModalOpen(true);
  };

  const connectedList = providers.filter(p => connectedProviders.has(p.id));
  const disconnectedList = providers.filter(p => !connectedProviders.has(p.id));

  const renderProvider = (provider: ProviderData) => {
    const isExpanded = expanded === provider.id;
    const isSoon = provider.status === 'coming_soon';
    const isConnected = connectedProviders.has(provider.id);

    return (
        <div key={provider.id} className={`provider-card ${provider.isPrimary ? 'primary' : ''} ${isConnected ? 'connected' : ''}`} style={{ opacity: isSoon ? 0.6 : 1 }}>
            <div className="provider-header" >
                <div className="provider-info" onClick={() => !isSoon && toggleProvider(provider.id)}>
                    <div className="provider-icon" style={{ filter: isSoon ? 'grayscale(100%)' : 'none' }}>
                        <i className={`fa-solid ${provider.icon}`}></i>
                    </div>
                    <div className="provider-name">
                        <div className="flex items-center gap-2">
                            {provider.name}
                            {isConnected && <i className="fa-solid fa-circle-check text-[#00ff82] text-xs"></i>}
                        </div>
                        <div className="method-indicators">
                            {provider.methods.map((m, i) => (
                                <div className="method-item" key={i}>
                                    <div className={`method-dot ${isConnected ? 'active' : ''}`}></div>
                                    {m.label}
                                </div>
                            ))}
                        </div>
                        {isSoon && <span className="badge-soon">Em Breve</span>}
                    </div>
                </div>
                <div className="flex items-center">
                    {!isSoon && <i className={`fa-solid fa-chevron-down arrow-icon ${isExpanded ? 'expanded' : ''}`} onClick={() => !isSoon && toggleProvider(provider.id)}></i>}
                    <button onClick={() => openSettingsModal(provider.id)} className="ml-4 text-gray-400 hover:text-white">
                        <i className="fa-solid fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            {isExpanded && !isSoon && (
                <div className="provider-body">
                    {provider.id === 'syncpay' && (
                        <SyncPayForm isConnected={isConnected} onStatusChange={handleStatusChange} />
                    )}
                    {provider.id === 'stripe' && (
                        <StripeForm isConnected={isConnected} onStatusChange={handleStatusChange} />
                    )}
                    {provider.id === 'paypal' && (
                        <PayPalForm isConnected={isConnected} onStatusChange={handleStatusChange} />
                    )}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-x-hidden">
      <style>{`
        header {
            display:flex; align-items:center; padding:16px 24px;
            background: #0c0f14; position:fixed; width:100%; top:0; z-index:10;
            border-bottom:1px solid rgba(255,255,255,0.1); height: 65px;
        }
        header button { background:none; border:none; color:#00c2ff; font-size:24px; cursor:pointer; padding-right: 15px; }
        header h1 { font-size:18px; font-weight:700; color:#fff; }
        
        main { padding: 90px 20px 40px 20px; max-width: 600px; margin: 0 auto; width: 100%; }

        .section-header {
            font-size: 10px; font-weight: 900; color: #555; text-transform: uppercase;
            letter-spacing: 2px; margin: 30px 0 15px 5px; display: flex; align-items: center; gap: 10px;
        }
        .section-header span { flex-grow: 1; height: 1px; background: rgba(255,255,255,0.05); }
        
        .provider-card {
            background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
            border-radius: 20px; margin-bottom: 12px; overflow: hidden; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .provider-card.primary { border-color: rgba(0, 194, 255, 0.3); background: rgba(0, 194, 255, 0.02); }
        .provider-card.connected { border-color: rgba(0, 255, 130, 0.2); }
        
        .provider-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px; cursor: pointer; transition: 0.2s;
        }
        .provider-header:hover { background: rgba(255,255,255,0.03); }

        .provider-info { display: flex; align-items: center; gap: 15px; flex-grow: 1; }
        .provider-icon {
            width: 44px; height: 44px; border-radius: 12px;
            background: #1a1e26; color: #00c2ff;
            display: flex; align-items: center; justify-content: center; font-size: 20px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        
        .provider-name { font-size: 15px; font-weight: 800; color: #fff; display: flex; flex-direction: column; }
        .method-indicators { display: flex; gap: 12px; margin-top: 6px; }
        .method-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase; }
        .method-dot { width: 6px; height: 6px; border-radius: 50%; background: #333; }
        .method-dot.active { background: #00ff82; box-shadow: 0 0 8px rgba(0, 255, 130, 0.4); }

        .arrow-icon { color: #555; transition: 0.3s; font-size: 14px; }
        .arrow-icon.expanded { transform: rotate(180deg); color: #00c2ff; }
        
        .provider-body { padding: 5px 20px 25px 20px; border-top: 1px solid rgba(255,255,255,0.03); animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .input-group { margin-bottom: 18px; }
        .input-group label { display: block; font-size: 11px; font-weight: 800; color: #555; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
        .input-group input { 
            width: 100%; background: #0c0f14; border: 1px solid rgba(255,255,255,0.1); 
            padding: 14px; border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: 0.3s;
        }
        .input-group input:focus { border-color: #00c2ff; box-shadow: 0 0 15px rgba(0,194,255,0.1); }

        .save-btn {
            width: 100%; padding: 16px; background: #00c2ff; color: #000; border: none;
            border-radius: 14px; font-weight: 900; font-size: 14px; cursor: pointer;
            transition: 0.3s; text-transform: uppercase; letter-spacing: 1px;
            display: flex; align-items: center; justify-content: center; gap: 10px;
            box-shadow: 0 4px 15px rgba(0,194,255,0.2);
        }
        .save-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,194,255,0.4); }
        .save-btn:active { transform: scale(0.98); }
        .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .disconnect-btn {
            width: 100%; padding: 12px; background: rgba(255, 77, 77, 0.05); color: #ff4d4d;
            border: 1px solid rgba(255, 77, 77, 0.2); border-radius: 12px; font-weight: 800;
            font-size: 12px; cursor: pointer; transition: 0.3s; text-transform: uppercase;
        }
        .disconnect-btn:hover { background: rgba(255, 77, 77, 0.15); border-color: #ff4d4d; }

        .feedback-msg {
            margin-top: 15px; padding: 12px; border-radius: 10px; font-size: 12px;
            display: flex; align-items: center; gap: 8px; font-weight: 700;
        }
        .feedback-msg.success { background: rgba(0, 255, 130, 0.1); color: #00ff82; border: 1px solid rgba(0, 255, 130, 0.2); }
        .feedback-msg.error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); }

        .badge-soon { background: rgba(255,255,255,0.05); color: #444; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: 900; margin-top: 5px; align-self: flex-start; text-transform: uppercase; }
      `}</style>

      <header>
        <button onClick={handleBack}><i className="fa-solid fa-arrow-left"></i></button>
        <h1>Provedores de Pagamento</h1>
      </header>

      <main className="no-scrollbar">
        {connectedList.length > 0 && (
            <>
                <div className="section-header"><span></span> Conectados <span></span></div>
                {connectedList.map(renderProvider)}
            </>
        )}

        <div className="section-header"><span></span> Disponíveis <span></span></div>
        {disconnectedList.map(renderProvider)}
        
        <div className="mt-12 p-6 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl text-center opacity-30">
            <i className="fa-solid fa-shield-halved text-2xl mb-3"></i>
            <p className="text-[10px] uppercase font-black tracking-[2px] leading-relaxed">
                Suas credenciais são criptografadas e enviadas via túnel seguro. O Flux não armazena chaves privadas em texto aberto.
            </p>
        </div>
      </main>
      <ProviderSettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={() => { /* Lógica de atualização */ }}
        onSave={() => { /* Lógica de salvar */ }}
        onDelete={() => { /* Lógica de apagar */ }}
        onDisconnect={() => { 
            if(selectedProvider) {
                handleStatusChange(selectedProvider, false);
                setIsModalOpen(false);
            }
         }}
      />
    </div>
  );
};
