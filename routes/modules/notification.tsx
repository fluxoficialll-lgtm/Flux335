
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Notifications = lazy(() => import('../../pages/Notifications').then(m => ({ default: m.Notifications })));
const Messages = lazy(() => import('../../pages/Messages').then(m => ({ default: m.Messages })));

export const notificationRoutes = [
  { path: '/notifications', element: <ProtectedRoute><Notifications /></ProtectedRoute> },
  { path: '/messages', element: <ProtectedRoute><Messages /></ProtectedRoute> }
];
