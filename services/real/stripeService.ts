
import { API_BASE } from '../../apiConfig';
import { Group, User } from '../../types';
import { authService } from '../authService';

const PROXY_BASE = `${API_BASE}/api/stripe`;

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

export const stripeService = {
    authenticate: async (secretKey: string) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado.");

        return safeFetch(`${PROXY_BASE}/auth-token`, {
            method: 'POST',
            body: JSON.stringify({ secretKey, email: user.email })
        });
    },

    createPaymentIntent: async (group: Group, ownerEmail: string, paymentMethodType: string) => {
        return safeFetch(`${PROXY_BASE}/create-intent`, {
            method: 'POST',
            body: JSON.stringify({ 
                group, 
                ownerEmail, 
                paymentMethodType,
                currency: group.currency?.toLowerCase() || 'brl'
            })
        });
    },

    createCheckoutSession: async (group: Group, ownerEmail: string) => {
        const successUrl = `${window.location.origin}/#/vip-group-sales/${group.id}?session_id={CHECKOUT_SESSION_ID}&success=true`;
        const cancelUrl = `${window.location.origin}/#/vip-group-sales/${group.id}?success=false`;

        return safeFetch(`${PROXY_BASE}/create-session`, {
            method: 'POST',
            body: JSON.stringify({ group, ownerEmail, successUrl, cancelUrl })
        });
    },

    checkSessionStatus: async (sessionId: string, ownerEmail: string) => {
        return safeFetch(`${PROXY_BASE}/check-status`, {
            method: 'POST',
            body: JSON.stringify({ sessionId, ownerEmail })
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
