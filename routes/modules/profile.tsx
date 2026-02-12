
import React, { lazy } from 'react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

const Profile = lazy(() => import('../../pages/Profile').then(m => ({ default: m.Profile })));
const UserProfile = lazy(() => import('../../pages/UserProfile').then(m => ({ default: m.UserProfile })));
const CompleteProfile = lazy(() => import('../../pages/CompleteProfile').then(m => ({ default: m.CompleteProfile })));
const EditProfile = lazy(() => import('../../pages/EditProfile').then(m => ({ default: m.EditProfile })));
const GlobalSearch = lazy(() => import('../../pages/GlobalSearch').then(m => ({ default: m.GlobalSearch })));
const Leaderboard = lazy(() => import('../../pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const TopGroups = lazy(() => import('../../pages/TopGroups').then(m => ({ default: m.TopGroups })));

export const profileRoutes = [
  { path: '/profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
  { path: '/user/:username', element: <ProtectedRoute><UserProfile /></ProtectedRoute> },
  { path: '/complete-profile', element: <ProtectedRoute><CompleteProfile /></ProtectedRoute> },
  { path: '/edit-profile', element: <ProtectedRoute><EditProfile /></ProtectedRoute> },
  { path: '/global-search', element: <ProtectedRoute><GlobalSearch /></ProtectedRoute> },
  { path: '/rank', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
  { path: '/top-groups', element: <ProtectedRoute><TopGroups /></ProtectedRoute> },
  { path: '/top-groups/:category', element: <ProtectedRoute><TopGroups /></ProtectedRoute> }
];
