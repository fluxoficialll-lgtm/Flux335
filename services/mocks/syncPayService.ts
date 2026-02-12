
import { User, Group } from '../../types';

export const syncPayService = {
    authenticate: async () => true,
    createPayment: async (user: User, group: Group, method: 'pix' | 'boleto' = 'pix') => ({
        pixCode: "00020126360014BR.GOV.BCB.PIX0114MOCK-KEY-FLUX520400005303986540510.005802BR5913FLUX-PLATFORM6009SAO-PAULO62070503***6304E1D1",
        identifier: "tx_" + Math.random().toString(36).substr(2, 9),
        qrCodeImage: "",
        boletoUrl: ""
    }),
    checkTransactionStatus: async (transactionId: string, ownerEmail?: string, groupId?: string, email?: string) => ({ status: 'pending' }),
    getBalance: async () => 12450.85,
    getTransactions: async (userEmail: string) => {
        // Mock de transações ricas para teste da interface unificada
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // Simula transações de um grupo específico
        const pathParts = window.location.hash.split('/');
        const currentGroupId = pathParts[pathParts.length - 1];

        return [
            { id: '1', amount: 97.00, status: 'paid', provider: 'syncpay', method: 'Pix', country: 'BR', groupId: currentGroupId, createdAt: now - 3600000 },
            { id: '2', amount: 97.00, status: 'paid', provider: 'syncpay', method: 'Pix', country: 'BR', groupId: currentGroupId, createdAt: now - 18000000 },
            { id: '3', amount: 19.90, status: 'paid', provider: 'stripe', method: 'Card', country: 'US', groupId: currentGroupId, createdAt: now - oneDay - 5000 },
            { id: '4', amount: 19.90, status: 'paid', provider: 'stripe', method: 'Card', country: 'US', groupId: currentGroupId, createdAt: now - (2 * oneDay) },
            { id: '5', amount: 45.00, status: 'paid', provider: 'paypal', method: 'Wallet', country: 'DE', groupId: currentGroupId, createdAt: now - (5 * oneDay) },
            { id: '6', amount: 97.00, status: 'paid', provider: 'syncpay', method: 'Pix', country: 'BR', groupId: currentGroupId, createdAt: now - 10000 },
            { id: '7', amount: 19.90, status: 'paid', provider: 'stripe', method: 'Card', country: 'GB', groupId: currentGroupId, createdAt: now - 600000 },
        ];
    },
    getFees: async () => ({ sale_fee_type: "percent", sale_fee_value: 10, withdrawal_fee: 5.00 }),
    requestWithdrawal: async () => ({ transactionId: 'wd_mock' })
};
