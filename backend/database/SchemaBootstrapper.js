
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
import { settingsSchema } from './schemas/settings.js'; // <-- Adicionado

export const SchemaBootstrapper = {
    /**
     * Executa a sequência de bootstrapping do banco de dados.
     */
    async run() {
        console.log("🔄 DB: Inicializando Motor de Migração...");
        
        try {
            // 1. Requisitos de Sistema
            await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
            
            // 2. Registro de Tabelas
            const schemas = [
                usersSchema, groupsSchema, postsSchema,
                chatsSchema, marketplaceSchema, relationshipsSchema,
                reportsSchema, interactionsSchema, vipSchema,    
                financialSchema, adsSchema, feesSchema, auditSchema,
                settingsSchema // <-- Adicionado
            ];

            for (const sql of schemas) { 
                try {
                    await query(sql); 
                } catch (schemaError) {
                    console.warn(`⚠️ [Bootstrapper] Aviso em schema: ${schemaError.message.substring(0, 60)}...`);
                }
            }

            // 3. Integridade e Triggers Complexas
            await this.setupTriggers();
            
            console.log("✅ DB: Estrutura física e lógica verificada.");
        } catch (e) {
            console.error("❌ DB: Falha Crítica no Bootstrapper:", e.message);
            throw e;
        }
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
