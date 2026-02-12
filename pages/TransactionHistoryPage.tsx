import React from 'react';
import CashFlowChart from '../../components/financial/CashFlowChart';
import TransactionHistory from '../../components/financial/TransactionHistory';

const TransactionHistoryPage: React.FC = () => {
    return (
        <div className="h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-y-auto overflow-x-hidden">
            <header className="flex items-center justify-between p-4 bg-[#0c0f14] fixed w-full z-10 border-b border-white/10 top-0 h-[65px]">
                <button onClick={() => window.history.back()} aria-label="Voltar"><i className="fa-solid fa-arrow-left"></i></button>
                <h1 className="text-[20px] font-semibold">Histórico de Transações</h1>
                <div style={{width: '24px'}}></div>
            </header>
            <main className="pt-[80px] pb-[40px] w-full max-w-[600px] mx-auto px-5">
                <CashFlowChart />
                <TransactionHistory />
            </main>
        </div>
    );
};

export default TransactionHistoryPage;
