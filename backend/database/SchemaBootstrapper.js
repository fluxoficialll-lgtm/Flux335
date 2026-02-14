
import { query } from './pool.js';

// Importação centralizada de todos os schemas estruturais
import { usersSchema } from './schemas/users.js';
import { groupsSchema } from './schemas/groups.js';
import { financialSchema } from './schemas/financial.js';
import { adsSchema } from './schemas/ads.js';
import { feesSchema } from './schemas/fees.js';
import { vipSchema } from './schemas/vip.js';
import { postsSchema } from './schemas/posts.js';
import { chatsSchema } from './schemas/chats.js';
import { marketplaceSchema } from './schemas/marketplace.js';
import { relationshipsSchema } from './schemas/relationships.js';
import { reportsSchema } from './schemas/reports.js';
import { interactionsSchema } from './schemas/interactions.js';
import { auditSchema } from './schemas/audit.js';
import { settingsSchema } from './schemas/settings.js';
import { paymentsSchema } from './schemas/payments.js';
import { reelsSchema } from './schemas/reels.js';
import { up as paymentProviderCredentialsSchema } from './schemas/PaymentProviderCredentialsSchema.js'; 

export const SchemaBootstrapper = {
    /**
     * Executa a sequência de bootstrapping do banco de dados.
     */
    async run() {
        console.log("🔄 DB: Inicializando Motor de Migração...");
        
        try {
            // 1. Requisitos de Sistema
            await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

            // 2. Tipos ENUM (devem ser criados antes das tabelas que os utilizam)
            await this.createEnumTypes();

            // 3. Registro de Tabelas em Ordem de Dependência
            const schemas = [
                // Nível 0: Tabelas fundamentais sem dependências externas
                usersSchema, 

                // Nível 1: Tabelas que dependem de `users`
                groupsSchema, 
                postsSchema,
                chatsSchema, 
                marketplaceSchema, 
                reelsSchema,

                // Nível 2: Tabelas de junção e relacionamento
                relationshipsSchema,
                interactionsSchema, // Depende de users e (posts ou reels)
                vipSchema, // Depende de users e groups
                
                // Nível 3: Módulos de suporte e financeiros
                financialSchema, 
                adsSchema,
                feesSchema,
                paymentsSchema, // Depende de users e financial
                paymentProviderCredentialsSchema,

                // Nível 4: Logs, auditoria e configurações
                reportsSchema, // Depende de users e (posts, comments, etc)
                auditSchema,
                settingsSchema
            ];

            for (const sql of schemas) { 
                try {
                    await query(sql); 
                } catch (schemaError) {
                    // Apenas avisa, não para a execução, para que outras migrações possam continuar
                    console.warn(`⚠️ [Bootstrapper] Aviso em schema: ${schemaError.message.substring(0, 120)}...`);
                }
            }

            // 4. Integridade e Triggers Complexas (após todas as tabelas existirem)
            await this.setupTriggers();
            
            console.log("✅ DB: Estrutura física e lógica verificada.");
        } catch (e) {
            console.error("❌ DB: Falha Crítica no Bootstrapper:", e.message);
            throw e;
        }
    },

    /**
     * Cria os tipos ENUM necessários para o sistema.
     * A cláusula `IF NOT EXISTS` previne erros em reinicializações.
     */
    async createEnumTypes() {
        await query(`CREATE TYPE product_condition IF NOT EXISTS AS ENUM ('new', 'used', 'refurbished');`);
        await query(`CREATE TYPE relationship_status IF NOT EXISTS AS ENUM ('following', 'follower', 'friends', 'blocked');`);
        await query(`CREATE TYPE transaction_type IF NOT EXISTS AS ENUM ('deposit', 'withdrawal', 'transfer', 'purchase', 'refund');`);
    },

    async setupTriggers() {
        // Trigger para contagem automática de membros no Postgres
        await query(`
            CREATE OR REPLACE FUNCTION update_member_count()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (TG_OP = 'INSERT') THEN
                    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
                ELSIF (TG_OP = 'DELETE') THEN
                    UPDATE groups SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.group_id;
                END IF;
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_update_member_count ON vip_access;
            CREATE TRIGGER trg_update_member_count
            AFTER INSERT OR DELETE ON vip_access
            FOR EACH ROW EXECUTE FUNCTION update_member_count();
        `);
    }
};
