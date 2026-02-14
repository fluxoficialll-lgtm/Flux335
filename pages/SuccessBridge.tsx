
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { authService } from '../services/authService';
import { RedirectResolver } from '../services/sync/RedirectResolver';
import { PurchaseIntention } from '../services/sync/PurchaseIntention';
import { db } from '../database';

export const SuccessBridge: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [status, setStatus] = useState<'validating' | 'ready' | 'error'>('validating');
    const [message, setMessage] = useState('Validando transação...');
    const [group, setGroup] = useState<any>(null);

    const checkAccess = useCallback(async () => {
        if (!id) return;
        
        const userId = authService.getCurrentUserId();
        if (!userId) {
            // Se perdeu a sessão, manda pro login mas mantém a intenção
            PurchaseIntention.set(id);
            navigate('/register');
            return;
        }

        try {
            const foundGroup = group || await groupService.fetchGroupById(id);
            if (!foundGroup) throw new Error("Grupo não encontrado");
            if (!group) setGroup(foundGroup);

            // Verifica se o VIP já foi concedido no banco de dados local (alimentado pelo sync/webhook)
            const isVipActive = db.vipAccess.check(userId, foundGroup);
            
            if (isVipActive) {
                setStatus('ready');
                setMessage('Acesso Liberado!');
                // Limpa a intenção pois o fluxo foi concluído
                PurchaseIntention.clear();
            } else {
                // Polling messages para UX
                const steps = [
                    "Sincronizando banco de dados...",
                    "Preparando sua licença VIP...",
                    "Configurando canais de conteúdo...",
                    "Quase pronto..."
                ];
                setMessage(steps[Math.floor(Math.random() * steps.length)]);
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
            setMessage('Falha ao validar acesso.');
        }
    }, [id, navigate, group]);

    useEffect(() => {
        const interval = setInterval(checkAccess, 2500);
        checkAccess(); // Check imediato
        return () => clearInterval(interval);
    }, [checkAccess]);

    const handleEnter = () => {
        if (group) {
            const path = RedirectResolver.resolveGroupEntryPath(group);
            navigate(path, { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0f14] text-white font-['Inter'] flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            <style>{`
                .success-pulse {
                    width: 100px; height: 100px;
                    background: rgba(0, 194, 255, 0.1);
                    border: 2px solid #00c2ff;
                    border-radius: 30px;
                    display: flex; align-items: center; justify-content: center;
                    color: #00c2ff; font-size: 32px; margin-bottom: 32px;
                    box-shadow: 0 0 30px rgba(0, 194, 255, 0.2);
                    animation: pulse-glow 2s infinite;
                }
                .status-ready { border-color: #00ff82; color: #00ff82; box-shadow: 0 0 30px rgba(0, 255, 130, 0.2); }
                @keyframes pulse-glow {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .loader-bar {
                    width: 200px; height: 4px; background: rgba(255,255,255,0.05);
                    border-radius: 10px; overflow: hidden; margin: 20px 0;
                }
                .loader-fill {
                    height: 100%; background: #00c2ff; width: 30%;
                    animation: loading-flow 2s infinite ease-in-out;
                }
                @keyframes loading-flow {
                    0% { transform: translateX(-100%); width: 30%; }
                    50% { width: 60%; }
                    100% { transform: translateX(200%); width: 30%; }
                }
                .btn-access {
                    width: 100%; max-width: 300px; padding: 18px;
                    background: #00ff82; color: #000;
                    border-radius: 16px; font-weight: 900; font-size: 16px;
                    text-transform: uppercase; letter-spacing: 1px;
                    border: none; cursor: pointer; transition: 0.3s;
                    box-shadow: 0 10px 25px rgba(0, 255, 130, 0.3);
                    animation: slideUp 0.5s ease;
                }
                .btn-access:active { transform: scale(0.98); }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div className={`success-pulse ${status === 'ready' ? 'status-ready' : ''}`}>
                <i className={`fa-solid ${status === 'ready' ? 'fa-check-double' : 'fa-shield-halved'}`}></i>
            </div>

            <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">
                {status === 'ready' ? 'Pagamento Confirmado' : 'Preparando seu Acesso'}
            </h1>
            
            <p className="text-gray-500 text-sm font-medium mb-6">
                {message}
            </p>

            {status === 'validating' && (
                <div className="loader-bar">
                    <div className="loader-fill"></div>
                </div>
            )}

            {status === 'ready' && (
                <button className="btn-access" onClick={handleEnter}>
                    Acessar Agora <i className="fa-solid fa-arrow-right ml-2"></i>
                </button>
            )}

            {status === 'error' && (
                <button onClick={() => window.location.reload()} className="text-[#00c2ff] text-xs font-bold uppercase underline">
                    Tentar Novamente
                </button>
            )}

            <div className="absolute bottom-10 opacity-20 text-[9px] font-black uppercase tracking-[5px]">
                Flux Synchronization Gateway
            </div>
        </div>
    );
};
