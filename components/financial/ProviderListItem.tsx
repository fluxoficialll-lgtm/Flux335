
import React from 'react';

// A interface ProviderData será importada do novo arquivo de constantes
import { ProviderData } from '../../constants/providerData';

interface ProviderListItemProps {
    provider: ProviderData;
    isExpanded: boolean;
    isConnected: boolean;
    onToggle: (id: string) => void;
    onOpenSettings: (id: string) => void;
}

export const ProviderListItem: React.FC<ProviderListItemProps> = ({
    provider,
    isExpanded,
    isConnected,
    onToggle,
    onOpenSettings,
}) => {
    const isSoon = provider.status === 'coming_soon';

    return (
        <div className={`provider-card ${provider.isPrimary ? 'primary' : ''} ${isConnected ? 'connected' : ''}`} style={{ opacity: isSoon ? 0.6 : 1 }}>
            <div className="provider-header">
                <div className="provider-info" onClick={() => !isSoon && onToggle(provider.id)}>
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
                    {!isSoon && <i className={`fa-solid fa-chevron-down arrow-icon ${isExpanded ? 'expanded' : ''}`} onClick={() => !isSoon && onToggle(provider.id)}></i>}
                    <button onClick={() => onOpenSettings(provider.id)} className="ml-4 text-gray-400 hover:text-white">
                        <i className="fa-solid fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
