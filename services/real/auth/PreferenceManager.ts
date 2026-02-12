
import { apiClient } from '../../apiClient';
import { db } from '../../../database';
import { User, PaymentProviderConfig, NotificationSettings, SecuritySettings } from '../../../types';

// Gerencia as preferências e configurações do usuário
export const PreferenceManager = {

    // Atualiza as configurações de notificação
    async updateNotificationSettings(email: string, settings: NotificationSettings): Promise<void> {
        const user = await db.users.getByEmail(email);
        if (!user) throw new Error("User not found");

        const updatedSettings = { ...user.notificationSettings, ...settings };
        await db.users.update(user.id, { notificationSettings: updatedSettings });

        // Sincroniza com o backend
        await apiClient.post('/users/update-settings', { email, notificationSettings: updatedSettings });
    },

    // Atualiza as configurações de segurança
    async updateSecuritySettings(email: string, settings: SecuritySettings): Promise<void> {
        const user = await db.users.getByEmail(email);
        if (!user) throw new Error("User not found");

        const updatedSettings = { ...user.securitySettings, ...settings };
        await db.users.update(user.id, { securitySettings: updatedSettings });

        // Sincroniza com o backend
        await apiClient.post('/users/update-settings', { email, securitySettings: updatedSettings });
    },

    // Atualiza a configuração de um provedor de pagamento
    async updatePaymentConfig(email: string, config: PaymentProviderConfig): Promise<User> {
        if (!config.providerId) throw new Error("Provider ID is required");

        const user = await db.users.getByEmail(email);
        if (!user) throw new Error("User not found");

        // Garante que o objeto de configs exista
        const paymentConfigs = user.paymentConfigs || {};
        paymentConfigs[config.providerId] = config;

        // Atualiza o banco de dados local
        await db.users.update(user.id, { paymentConfigs });

        // Sincroniza com o backend (API)
        try {
            await apiClient.post('/users/update-payment-config', { email, paymentConfigs });
        } catch (error) {
            console.error("API Error: Failed to sync payment config. Changes saved locally.", error);
            // Opcional: Implementar lógica de fallback ou retry
        }
        
        // Retorna o usuário atualizado para refletir no cache da aplicação
        const updatedUser = await db.users.get(user.id);
        return updatedUser!;
    },

    // Deleta a configuração de um provedor de pagamento
    async deletePaymentProvider(email: string, providerId: string): Promise<User> {
        const user = await db.users.getByEmail(email);
        if (!user) throw new Error("User not found");

        const paymentConfigs = user.paymentConfigs || {};
        if (paymentConfigs[providerId]) {
            delete paymentConfigs[providerId];

            await db.users.update(user.id, { paymentConfigs });

            try {
                await apiClient.post('/users/update-payment-config', { email, paymentConfigs });
            } catch (error) {
                console.error("API Error: Failed to sync payment config deletion.", error);
            }
        }
        
        const updatedUser = await db.users.get(user.id);
        return updatedUser!;
    }
};
