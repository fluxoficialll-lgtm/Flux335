
import { API_BASE } from '../../apiConfig';
import { User, Group } from '../../types';
import { authService } from '../authService';
import { getCookie } from '../metaPixelService';
import { trackingService } from '../trackingService'; 

const PROXY_BASE = `${API_BASE}/api/syncpay`;

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

const generateValidCpf = (): string => {
    const rnd = (n: number) => Math.floor(Math.random() * n);
    const mod = (dividend: number, divisor: number) => Math.round(dividend - (Math.floor(dividend / divisor) * divisor));
    const n1 = rnd(10); const n2 = rnd(10); const n3 = rnd(10); const n4 = rnd(10); const n5 = rnd(10); const n6 = rnd(10); const n7 = rnd(10); const n8 = rnd(10); const n9 = rnd(10);
    let d1 = n9*2 + n8*3 + n7*4 + n6*5 + n5*6 + n4*7 + n3*8 + n2*9 + n1*10;
    d1 = 11 - (mod(d1, 11)); if (d1 >= 10) d1 = 0;
    let d2 = d1*2 + n9*3 + n8*4 + n7*5 + n6*6 + n5*7 + n4*8 + n3*9 + n2*10 + n1*11;
    d2 = 11 - (mod(d2, 11)); if (d2 >= 10) d2 = 0;
    return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
};

export const syncPayService = {
    authenticate: async (clientId: string, clientSecret: string) => {
        const user = authService.getCurrentUser();
        if (!user) throw new Error("Usuário não autenticado.");

        return safeFetch(`${PROXY_BASE}/auth-token`, {
            method: 'POST',
            body: JSON.stringify({ clientId, clientSecret, email: user.email })
        });
    },

    createPayment: async (user: User, group: Group, method: 'pix' | 'boleto' = 'pix') => {
        const groupId = group.id;
        const sellerIdentifier = group.creatorEmail || group.creatorId;
        
        if (!sellerIdentifier) {
            throw new Error("Vendedor não identificado neste grupo.");
        }

        const userCpf = user.profile?.cpf?.replace(/\D/g, '') || generateValidCpf();
        let rawName = user.profile?.nickname || user.profile?.name || 'Cliente Flux';
        let cleanName = rawName.replace(/[^a-zA-ZÀ-ÿ ]/g, ' ').trim();
        if (!cleanName.includes(' ')) cleanName += ' Visitante';

        const cleanPhone = (user.profile?.phone || '11999999999').replace(/\D/g, '');

        const utms = trackingService.getStoredParams();
        const fbp = getCookie('_fbp');

        const payload = {
            amount: parseFloat(group.price || '0'),
            description: `Acesso VIP: ${group.name.substring(0, 25)}`,
            ownerEmail: sellerIdentifier, 
            client: {
                name: cleanName,
                cpf: userCpf,
                email: user.email,
                phone: cleanPhone
            },
            metadata: { 
                groupId, 
                fbp, 
                ...utms,
                sellerId: group.creatorId 
            }
        };

        const response = await safeFetch(`${PROXY_BASE}/cash-in`, {
            method: 'POST',
            body: JSON.stringify({ payload })
        });
        
        return {
            pixCode: response.pix_code || "",
            identifier: response.identifier || "",
            qrCodeImage: response.qr_code_image || "",
            boletoUrl: response.url || response.boleto_url || ""
        };
    },

    checkTransactionStatus: async (transactionId: string, ownerEmail?: string, groupId?: string, email?: string) => {
        return safeFetch(`${PROXY_BASE}/check-status`, {
            method: 'POST',
            body: JSON.stringify({ 
                transactionId, 
                ownerEmail: ownerEmail || email, 
                groupId, 
                email 
            })
        });
    },

    getBalance: async (userEmail: string) => {
        try {
            const response = await safeFetch(`${PROXY_BASE}/balance`, {
                method: 'POST',
                body: JSON.stringify({ email: userEmail })
            });
            return response.balance || 0;
        } catch (e) { return 0; }
    },

    getTransactions: async (userEmail: string) => {
        return [];
    },

    requestWithdrawal: async (user: User, amount: number, pixKey: string, pixKeyType: string) => {
        return safeFetch(`${PROXY_BASE}/withdraw`, {
            method: 'POST', 
            body: JSON.stringify({ amount, pix_key: pixKey, pix_key_type: pixKeyType })
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
