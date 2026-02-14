
import { NotificationItem } from '../../types';
import { authService } from '../authService';
import { db } from '@/database';
import { USE_MOCKS } from '../../mocks';
import { sqlite } from '../../database/engine';
import { API_BASE } from '../../apiConfig';

export const notificationService = {
  getNotifications: (): NotificationItem[] => {
    const currentUserEmail = authService.getCurrentUserEmail();
    if (!currentUserEmail && !USE_MOCKS) return [];

    const stored = db.notifications.getAll();

    // FIX: Ensure stored is an array before filtering
    if (!Array.isArray(stored)) {
        console.warn('[notificationService] Stored notifications is not an array. Returning empty array.');
        return [];
    }

    if (USE_MOCKS) {
        return stored.sort((a, b) => b.timestamp - a.timestamp);
    }

    const myNotifications = stored.filter(n => n.recipientEmail === currentUserEmail);
    return myNotifications.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Syncs notifications from the server and populates the local cache.
   */
  syncNotifications: async () => {
    const email = authService.getCurrentUserEmail();
    if (!email) return;

    try {
        const res = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(email)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.notifications && Array.isArray(data.notifications)) {
                sqlite.upsertItems('notifications', data.notifications);
            }
        }
    } catch (e) {
        console.warn("[Notification Sync] Failed to fetch from server.");
    }
  },

  getUnreadCount: (): number => {
    const notifs = notificationService.getNotifications();
    // FIX: Ensure notifs is an array before filtering
    if (!Array.isArray(notifs)) {
        console.warn('[notificationService] getNotifications did not return an array. Returning 0.');
        return 0;
    }
    return notifs.filter(n => !n.read).length;
  },

  addNotification: (notif: Omit<NotificationItem, 'id' | 'time' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
        ...notif,
        id: Date.now(),
        timestamp: Date.now(),
        time: 'Agora', 
        read: false
    };

    db.notifications.add(newNotif);
  },

  removeNotification: (id: number) => {
    db.notifications.delete(id);
    // Future: Call server to delete notification too
  },

  markAllAsRead: () => {
     const all = notificationService.getNotifications();
     // FIX: Ensure all is an array before using forEach
     if (!Array.isArray(all)) {
        console.warn('[notificationService] getNotifications did not return an array for markAllAsRead.');
        return;
     }
     all.forEach(n => {
         if(!n.read) {
             const updated = { ...n, read: true };
             db.notifications.add(updated);
         }
     });
     // Future: Notify server that all notifications are read
  }
};
