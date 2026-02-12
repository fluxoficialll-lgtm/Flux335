import React from 'react';

interface ProviderSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onDisconnect: () => Promise<void>;
    providerName: string;
}

const ProviderSettingsModal: React.FC<ProviderSettingsModalProps> = ({ isOpen, onClose, onUpdate, onDisconnect, providerName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 font-['Inter']" onClick={onClose}>
            <div 
                className="bg-[#101318] border border-white/10 rounded-2xl shadow-lg w-full max-w-[calc(100%-40px)] sm:max-w-sm mx-auto p-6" 
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-white mb-2">Gerenciar {providerName}</h2>
                <p className="text-xs text-white/40 mb-6">O que você gostaria de fazer?</p>
                
                <div className="flex flex-col space-y-2">
                    <button 
                        onClick={onUpdate} 
                        className="text-left w-full px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Atualizar Credenciais
                    </button>
                    <button 
                        onClick={onDisconnect} 
                        className="text-left w-full px-4 py-3 text-sm font-semibold text-[#ff4d4d] hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        Desconectar
                    </button>
                </div>
                
                <button 
                    onClick={onClose} 
                    className="mt-6 w-full bg-white/5 text-white/70 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                    Fechar
                </button>
            </div>
        </div>
    );
};

export default ProviderSettingsModal;
