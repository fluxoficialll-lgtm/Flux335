
import React, { useState } from 'react';

export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

interface CurrencyStats {
    total: number;
    own: number;
}

interface BalanceCardProps {
    stats: Record<CurrencyCode, CurrencyStats>;
    selectedFilter: string;
    filters: string[];
    onFilterChange: (filter: string) => void;
    onRefresh: () => void;
    loading: boolean;
    showCurrencySwitch: boolean;
}

const CURRENCY_CONFIG = {
    BRL: { symbol: 'R$', color: '#00ff82', label: 'Real' },
    USD: { symbol: '$', color: '#00c2ff', label: 'Dólar' },
    EUR: { symbol: '€', color: '#ffd700', label: 'Euro' }
};

export const BalanceCard: React.FC<BalanceCardProps> = ({
    stats,
    selectedFilter,
    filters,
    onFilterChange,
    onRefresh,
    loading,
    showCurrencySwitch
}) => {
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('BRL');
    
    const currentStats = stats[selectedCurrency];
    const config = CURRENCY_CONFIG[selectedCurrency];

    const formatValue = (val: number) => {
        const locale = selectedCurrency === 'BRL' ? 'pt-BR' : (selectedCurrency === 'USD' ? 'en-US' : 'de-DE');
        return val.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="flux-card bg-white/5 border border-white/10 rounded-[20px] p-6 mb-5 shadow-2xl relative animate-fade-in overflow-hidden">
            <style>{`
                .currency-pill {
                    padding: 6px 12px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s;
                    border: 1px solid rgba(255,255,255,0.05);
                    background: rgba(255,255,255,0.02);
                    color: #555;
                }
                .currency-pill.active {
                    color: #fff;
                    background: rgba(255,255,255,0.1);
                }
            `}</style>

            <div className="flex justify-between items-start mb-6">
                {showCurrencySwitch ? (
                    <div className="flex gap-2 p-1 bg-black/20 rounded-xl border border-white/5">
                        {(['BRL', 'USD', 'EUR'] as CurrencyCode[]).map(curr => (
                            <button 
                                key={curr}
                                className={`currency-pill ${selectedCurrency === curr ? 'active' : ''}`}
                                onClick={() => setSelectedCurrency(curr)}
                                style={{ borderColor: selectedCurrency === curr ? CURRENCY_CONFIG[curr].color : undefined }}
                            >
                                {CURRENCY_CONFIG[curr].symbol} {curr}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Saldo em Conta</div>
                )}

                <button 
                    className="bg-[#00c2ff]/10 text-[#00c2ff] border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all hover:bg-[#00c2ff]/20" 
                    onClick={onRefresh} 
                    disabled={loading}
                >
                    <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i>
                </button>
            </div>

            <div className="balance-label text-[13px] text-white/40 mb-1 uppercase tracking-widest">
                <i className="fa-solid fa-chart-line mr-2"></i> 
                {selectedFilter === 'Disponível' ? 'Saldo Total' : `Faturamento (${selectedFilter})`}
            </div>
            
            <div className="balance-amount text-[42px] font-extrabold mb-2.5 flex items-baseline gap-2 transition-all duration-500" style={{ color: config.color, textShadow: `0 0 20px ${config.color}33` }}>
                <span className="text-[20px] font-semibold text-white/50">{config.symbol}</span> 
                {formatValue(currentStats.total)}
            </div>
            
            <div className="breakdown bg-black/30 rounded-2xl p-4 mb-5 flex flex-col gap-3 border border-white/5">
                <div className="breakdown-item flex justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }}></div> 
                        Vendas Próprias
                    </span>
                    <span className="font-bold text-white">{config.symbol} {formatValue(currentStats.own)}</span>
                </div>
            </div>

            <div className="filter-container flex gap-2 overflow-x-auto pb-3 no-scrollbar mb-4 border-b border-white/5">
                {filters.map(f => (
                    <button 
                        key={f} 
                        className={`filter-chip px-4 py-2 rounded-full border text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${selectedFilter === f ? 'bg-[#00c2ff]/15 border-[#00c2ff] text-[#00c2ff]' : 'bg-white/5 border-white/10 text-white/40'}`} 
                        onClick={() => onFilterChange(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>
    );
};
