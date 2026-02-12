import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { syncPayService } from '../services/syncPayService';
import { BalanceCard, CurrencyCode } from '../components/financial/BalanceCard';
import { GatewayCard } from '../components/financial/GatewayCard';
import CashFlowChart from '../components/financial/CashFlowChart';
import TransactionHistoryCard from '../components/financial/TransactionHistoryCard';

export const FinancialPanel: React.FC = () => {
  const navigate = useNavigate();
  
  const [selectedFilter, setSelectedFilter] = useState('Disponível');
  const [activeProviderName, setActiveProviderName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [preferredProvider, setPreferredProvider] = useState<string>('syncpay');
  
  const [currencyStats, setCurrencyStats] = useState<Record<CurrencyCode, { total: number; own: number; }>>({
      BRL: { total: 0, own: 0 },
      USD: { total: 0, own: 0 },
      EUR: { total: 0, own: 0 }
  });

  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [walletBalances, setWalletBalances] = useState({ BRL: 0, USD: 0, EUR: 0 });

  const filters = ['Disponível', 'Hoje', 'Ontem', '7d', '30d', '180d'];

  const calculateRevenue = useCallback(() => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      const getFilterTimestamp = (filter: string) => {
          switch(filter) {
              case 'Hoje': return startOfDay;
              case 'Ontem': return startOfDay - oneDay;
              case '7d': return now.getTime() - (7 * oneDay);
              case '30d': return now.getTime() - (30 * oneDay);
              case '180d': return now.getTime() - (180 * oneDay);
              default: return 0;
          }
      };

      const tsFilter = getFilterTimestamp(selectedFilter);
      const isAvailableMode = selectedFilter === 'Disponível';

      const newStats: Record<CurrencyCode, { total: number; own: number; }> = {
          BRL: { total: 0, own: 0 },
          USD: { total: 0, own: 0 },
          EUR: { total: 0, own: 0 }
      };

      if (isAvailableMode) {
          newStats.BRL.total = walletBalances.BRL || 0;
          newStats.USD.total = walletBalances.USD || 0;
          newStats.EUR.total = walletBalances.EUR || 0;
          newStats.BRL.own = walletBalances.BRL || 0;

      } else {
          if (Array.isArray(allTransactions)) {
              allTransactions.forEach(tx => {
                  const status = (tx.status || '').toLowerCase();
                  if (!['paid', 'completed', 'approved', 'settled'].includes(status)) return;
                  const txDate = new Date(tx.created_at || tx.createdAt || tx.date_created || 0).getTime();
                  const isMatch = selectedFilter === 'Ontem' ? (txDate >= tsFilter && txDate < startOfDay) : (txDate >= tsFilter);
                  if (isMatch) {
                      const currency = (tx.currency || 'BRL').toUpperCase() as CurrencyCode;
                      if (newStats[currency]) {
                          newStats[currency].own += parseFloat(tx.amount || 0);
                          newStats[currency].total += parseFloat(tx.amount || 0);
                      }
                  }
              });
          }
      }
      setCurrencyStats(newStats);
  }, [selectedFilter, allTransactions, walletBalances]);

  const loadData = async () => {
      setLoading(true);
      const user = authService.getCurrentUser();
      const pref = localStorage.getItem('flux_preferred_provider') || 'syncpay';
      setPreferredProvider(pref);

      if (user) {
          const isSyncConnected = user.paymentConfigs?.syncpay?.isConnected || user.paymentConfig?.providerId === 'syncpay';
          const isStripeConnected = user.paymentConfigs?.stripe?.isConnected;
          const isPaypalConnected = user.paymentConfigs?.paypal?.isConnected;

          let resolvedName = '';
          if (pref === 'syncpay' && isSyncConnected) resolvedName = 'SyncPay';
          else if (pref === 'stripe' && isStripeConnected) resolvedName = 'Stripe';
          else if (pref === 'paypal' && isPaypalConnected) resolvedName = 'PayPal';
          else {
              if (isSyncConnected) resolvedName = 'SyncPay';
              else if (isStripeConnected) resolvedName = 'Stripe';
              else if (isPaypalConnected) resolvedName = 'PayPal';
          }

          setActiveProviderName(resolvedName);

          const hasAnyConnected = isSyncConnected || isStripeConnected || isPaypalConnected;

          if (hasAnyConnected) {
              try {
                  const balance = await syncPayService.getBalance(user.email);
                  if (pref === 'syncpay') setWalletBalances({ BRL: balance, USD: 0, EUR: 0 });
                  else setWalletBalances({ BRL: balance, USD: balance / 5.0, EUR: balance / 5.4 });
                  const transactions = await syncPayService.getTransactions(user.email);
                  setAllTransactions(Array.isArray(transactions) ? transactions : []);
              } catch (e) { console.error("Erro dados financeiros", e); }
          }
      }
      setLoading(false);
  };

  useEffect(() => { 
      loadData();
      const handleStorageChange = () => loadData();
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => { calculateRevenue(); }, [calculateRevenue]);

  const handleBack = () => navigate('/settings');

  return (
    <div className="h-screen bg-[radial-gradient(circle_at_top_left,_#0c0f14,_#0a0c10)] text-white font-['Inter'] flex flex-col overflow-y-auto overflow-x-hidden">
      <header className="flex items-center justify-between p-4 bg-[#0c0f14] fixed w-full z-10 border-b border-white/10 top-0 h-[65px]">
        <button onClick={handleBack} aria-label="Voltar"><i className="fa-solid fa-arrow-left"></i></button>
        <h1 className="text-[20px] font-semibold">Painel Financeiro</h1>
        <div style={{width: '24px'}}></div>
      </header>
      <main className="pt-[80px] pb-[40px] w-full max-w-[600px] mx-auto px-5">
        <BalanceCard 
            stats={currencyStats}
            selectedFilter={selectedFilter}
            filters={filters}
            onFilterChange={setSelectedFilter}
            onRefresh={loadData}
            loading={loading}
            showCurrencySwitch={preferredProvider !== 'syncpay'}
        />
        
        <CashFlowChart />

        <TransactionHistoryCard />

        <GatewayCard 
            activeProvider={activeProviderName}
            onManage={() => navigate('/financial/providers')}
        />
      </main>
    </div>
  );
};
