
import dotenv from \'dotenv\';
import { createLogger } from \'./services/audit/trafficLogger.js\';

const isProduction = process.env.NODE_ENV === \'production\';

if (!isProduction) {
  dotenv.config();
}

/**
 * Processa a string de origens permitidas em um array.
 */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(\',\')
  : [];

if (!isProduction) {
    allowedOrigins.push(\'http://localhost:3000\', \'http://localhost:5173\');
}

/**
 * Objeto de configuração centralizado que mapeia TODAS as variáveis de ambiente do projeto.
 */
export const config = {
  // --- Configurações Gerais e de Logging ---\
  NODE_ENV: process.env.NODE_ENV || \'development\',
  LOG_LEVEL: process.env.LOG_LEVEL || \'debug\', // Nível de log: \'debug\', \'info\', \'warn\', \'error\'
  PORT: process.env.PORT || 3001,
  APP_URL: process.env.APP_URL,
  ALLOWED_ORIGINS: allowedOrigins,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,

  // --- Banco de Dados ---\
  DATABASE_URL: process.env.DATABASE_URL,

  // --- Segurança e Autenticação ---\
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  USER_TOKEN: process.env.USER_TOKEN,

  // --- API da Plataforma de Hospedagem ---\
  RENDER_API_KEY: process.env.RENDER_API_KEY,

  // --- Upload de Arquivos (Cloudflare R2) ---\
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,

  // --- Envio de E-mail (SMTP) ---\
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // --- Pagamentos ---\
  PAYMENT_API_URL: process.env.PAYMENT_API_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  SYNC_PAY_CLIENT_ID: process.env.SYNC_PAY_CLIENT_ID,
  SYNC_PAY_CLIENT_SECRET: process.env.SYNC_PAY_CLIENT_SECRET,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_MERCHANT_ID: process.env.PAYPAL_MERCHANT_ID,
};

/**
 * Instância única e configurada do logger para ser usada em toda a aplicação.
 */
export const logger = createLogger({ level: config.LOG_LEVEL });


// --- Verificações de Sanidade na Inicialização ---\
logger.logSystem(\'info\', \'Iniciando verificações de configuração do ambiente...\');

const criticalConfig = [
  \'DATABASE_URL\',
  \'JWT_SECRET\',
  \'GOOGLE_CLIENT_ID\',
  \'GOOGLE_CLIENT_SECRET\',
  \'R2_ACCOUNT_ID\',
  \'R2_ACCESS_KEY_ID\',
  \'R2_SECRET_ACCESS_KEY\',
  \'R2_BUCKET_NAME\',
  \'ADMIN_TOKEN\',
  \'APP_URL\',
];

const missingConfig = criticalConfig.filter(key => !config[key]);

if (missingConfig.length > 0) {
  const message = `Variáveis de ambiente obrigatórias estão faltando: ${missingConfig.join(\', \')}. A aplicação não pode iniciar.`;
  logger.logSystem(\'error\', message);
  if (isProduction) {
    throw new Error(message);
  }
} else {
  logger.logSystem(\'info\', \'Todas as configurações críticas foram encontradas.\');
}

// Avisos para configurações não críticas
const optionalConfigs = {
    SMTP: [\'SMTP_HOST\', \'SMTP_USER\', \'SMTP_PASS\'],
    Stripe: [\'STRIPE_SECRET_KEY\'],
    PayPal: [\'PAYPAL_CLIENT_ID\', \'PAYPAL_CLIENT_SECRET\'],
    SyncPay: [\'SYNC_PAY_CLIENT_ID\', \'SYNC_PAY_CLIENT_SECRET\'],
};

for (const [service, keys] of Object.entries(optionalConfigs)) {
    if (keys.some(key => !config[key])) {
        logger.logSystem(\'warn\', `Configurações para o serviço ${service} estão incompletas. Funcionalidades relacionadas podem estar desabilitadas.`);
    }
}
