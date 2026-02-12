import React from 'react';
import { Route } from 'react-router-dom';
import { FinancialPanel } from '../../pages/FinancialPanel';
import ProviderConfig from '../../pages/ProviderConfig';
import TransactionHistoryPage from '../../pages/TransactionHistoryPage'; // Importa a nova página

export const SettingsRoutes = (
  <>
    <Route path="/financial" element={<FinancialPanel />} />
    <Route path="/financial/providers" element={<ProviderConfig />} />
    {/* Adiciona a nova rota para o histórico de transações */}
    <Route path="/financial/transactions" element={<TransactionHistoryPage />} />
  </>
);
