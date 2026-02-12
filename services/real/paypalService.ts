
import { API_BASE } from '../../apiConfig';
import { Group } from '../../types';
import { authService } from '../authService';

const PROXY_BASE = `${API_BASE}/api/paypal`;

const safeFetch = async (url: string, options: RequestInit = {}) => {
    const token = authService.getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
};

export const paypalService = {
    authenticate: async (clientId: string, clientSecret: string) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado.");

        return safeFetch(`${PROXY_BASE}/auth-token`, {
            method: 'POST',
            body: JSON.stringify({ clientId, clientSecret, email: user.email })
        });
    },

    createOrder: async (group: Group, ownerEmail: string) => {
        return safeFetch(`${PROXY_BASE}/create-order`, {
            method: 'POST',
            body: JSON.stringify({ 
                amount: parseFloat(group.price || '0'),
                currency: group.currency || 'BRL',
                description: `Acesso VIP: ${group.name}`,
                ownerEmail
            })
        });
    },

    checkOrderStatus: async (orderId: string, ownerEmail: string) => {
        return safeFetch(`${PROXY_BASE}/check-status`, {
            method: 'POST',
            body: JSON.stringify({ orderId, ownerEmail })
        });
    },

    disconnect: async (): Promise<boolean> => {
        const user = authService.getCurrentUser();
        if (!user) {
            throw new Error("Usuário não autenticado.");
        }

        await safeFetch(`${PROXY_BASE}/disconnect`, { 
            method: 'POST',
            body: JSON.stringify({ email: user.email })
        });
        return true;
    }
};
