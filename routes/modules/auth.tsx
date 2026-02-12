
import React, { lazy } from 'react';

const Login = lazy(() => import('../../pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('../../pages/Register').then(m => ({ default: m.Register })));
const VerifyEmail = lazy(() => import('../../pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })));
const ForgotPassword = lazy(() => import('../../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('../../pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Banned = lazy(() => import('../../pages/Banned').then(m => ({ default: m.Banned })));

export const authRoutes = [
  { path: '/', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/banned', element: <Banned /> }
];
