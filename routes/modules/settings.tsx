
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Settings = lazy(() => import('../../pages/Settings').then(m => ({ default: m.Settings })));
const SecurityLogin = lazy(() => import('../../pages/SecurityLogin').then(m => ({ default: m.SecurityLogin })));
const BlockedUsers = lazy(() => import('../../pages/BlockedUsers').then(m => ({ default: m.BlockedUsers })));
const NotificationSettings = lazy(() => import('../../pages/NotificationSettings').then(m => ({ default: m.NotificationSettings })));
const LanguageSettings = lazy(() => import('../../pages/LanguageSettings').then(m => ({ default: m.LanguageSettings })));
const TermsAndPrivacy = lazy(() => import('../../pages/TermsAndPrivacy').then(m => ({ default: m.TermsAndPrivacy })));
const HelpSupport = lazy(() => import('../../pages/HelpSupport').then(m => ({ default: m.HelpSupport })));

export const settingsRoutes = [
  { path: '/settings', element: <ProtectedRoute><Settings /></ProtectedRoute> },
  { path: '/settings/security', element: <ProtectedRoute><SecurityLogin /></ProtectedRoute> },
  { path: '/settings/blocked-users', element: <ProtectedRoute><BlockedUsers /></ProtectedRoute> },
  { path: '/settings/notifications', element: <ProtectedRoute><NotificationSettings /></ProtectedRoute> },
  { path: '/settings/language', element: <ProtectedRoute><LanguageSettings /></ProtectedRoute> },
  { path: '/settings/terms', element: <ProtectedRoute><TermsAndPrivacy /></ProtectedRoute> },
  { path: '/settings/help', element: <ProtectedRoute><HelpSupport /></ProtectedRoute> }
];
