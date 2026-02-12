
import { UserProfile, NotificationSettings, SecuritySettings, PaymentProviderConfig, User } from '../../types';
import { AuthFlow } from './auth/AuthFlow';
import { UserDirectory } from './auth/UserDirectory';
import { IdentitySecurity } from './auth/IdentitySecurity';
import { ProfileManager } from './auth/ProfileManager';
import { PreferenceManager } from './auth/PreferenceManager';
import { trackingService } from './trackingService';
import { db } from '../../database';

export const authService = {
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isAuthenticated: () => !!localStorage.getItem('auth_token') && !!localStorage.getItem('cached_user_profile'),

  // Delegados: User Directory
  syncRemoteUsers: () => UserDirectory.syncRemoteUsers(authService.getCurrentUserId()),
  searchUsers: (q: string) => UserDirectory.searchUsers(q),
  fetchUserByHandle: (h: string, f?: string) => UserDirectory.fetchUserByHandle(h, f),
  getUserByHandle: (h: string) => UserDirectory.getUserByHandle(h),
  getAllUsers: () => UserDirectory.getAllUsers(),

  // Delegados: Auth Flow
  login: (e: string, p: string) => AuthFlow.login(e, p),
  loginWithGoogle: (t?: string, r?: string) => AuthFlow.loginWithGoogle(t, r),
  register: (e: string, p: string, r?: string) => AuthFlow.register(e, p, r),
  verifyCode: (e: string, c: string, r?: boolean) => AuthFlow.verifyCode(e, c, r),
  sendVerificationCode: (e: string, t?: 'register' | 'reset') => AuthFlow.sendVerificationCode(e, t),
  resetPassword: (e: string, p: string) => AuthFlow.resetPassword(e, p),
  performLoginSync: (u: User) => AuthFlow.performLoginSync(u),

  // Delegados: Identity & Security
  updateHeartbeat: () => IdentitySecurity.updateHeartbeat(authService.getCurrentUserId()),
  getUserSessions: () => IdentitySecurity.getUserSessions(authService.getCurrentUserEmail()),
  revokeOtherSessions: () => {
      const email = authService.getCurrentUserEmail();
      return email ? IdentitySecurity.revokeOtherSessions(email) : Promise.resolve();
  },
  changePassword: (cur: string, nxt: string) => {
      const email = authService.getCurrentUserEmail();
      if (!email) throw new Error("Não autenticado");
      return IdentitySecurity.changePassword(email, cur, nxt);
  },

  // Delegados: Profile
  completeProfile: (e: string, d: UserProfile) => ProfileManager.completeProfile(e, d),
  checkUsernameAvailability: (n: string) => ProfileManager.checkUsernameAvailability(n),

  // Delegados: Preferences
  updateNotificationSettings: (s: NotificationSettings) => {
      const email = authService.getCurrentUserEmail();
      return email ? PreferenceManager.updateNotificationSettings(email, s) : Promise.resolve();
  },
  updateSecuritySettings: (s: SecuritySettings) => {
      const email = authService.getCurrentUserEmail();
      return email ? PreferenceManager.updateSecuritySettings(email, s) : Promise.resolve();
  },
  updatePaymentConfig: (c: PaymentProviderConfig) => {
      const email = authService.getCurrentUserEmail();
      if (!email) {
          const cached = authService.getCurrentUser();
          if (cached?.email) return PreferenceManager.updatePaymentConfig(cached.email, c);
          throw new Error("Usuário não identificado para salvar configuração.");
      }
      return PreferenceManager.updatePaymentConfig(email, c);
  },
  deletePaymentProvider: (providerId: string) => {
      const email = authService.getCurrentUserEmail();
      if (!email) throw new Error("Usuário não autenticado.");
      return PreferenceManager.deletePaymentProvider(email, providerId);
  },

  // Helpers de Sessão
  getCurrentUserId: () => localStorage.getItem('user_id'),
  getCurrentUserEmail: () => {
      const user = authService.getCurrentUser();
      return user?.email || null;
  },
  getCurrentUser: (): User | null => { 
      try { 
          const data = localStorage.getItem('cached_user_profile');
          return data ? JSON.parse(data) : null; 
      } catch { return null; }
  },

  logout: () => { 
      ['user_id', 'auth_token', 'cached_user_profile', 'guest_email_capture', 'flux_instance_id'].forEach(k => localStorage.removeItem(k));
      db.auth.clearSession();
      sessionStorage.clear();
      trackingService.hardReset(); 
      window.location.href = '/#/';
  }
};
