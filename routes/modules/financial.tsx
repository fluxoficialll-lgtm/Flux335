
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const FinancialPanel = lazy(() => import('../../pages/FinancialPanel').then(m => ({ default: m.FinancialPanel })));
const ProviderConfig = lazy(() => import('../../pages/ProviderConfig').then(m => ({ default: m.ProviderConfig })));
const TransactionHistoryPage = lazy(() => import('../../pages/TransactionHistoryPage').then(m => ({ default: m.TransactionHistoryPage })));

export const financialRoutes = [
  { path: '/financial', element: <ProtectedRoute><FinancialPanel /></ProtectedRoute> },
  { path: '/financial/providers', element: <ProtectedRoute><ProviderConfig /></ProtectedRoute> },
  { path: '/financial/transactions', element: <ProtectedRoute><TransactionHistoryPage /></ProtectedRoute> }
];
