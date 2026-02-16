
import { eventCollectorService } from '../eventCollectorService';
import { stateLogger } from './StateLogger';
import { trafficSource } from '../pixel/context/TrafficSource';

/**
 * Retorna metadados comuns a serem anexados em todos os eventos de telemetria.
 * Inclui origem do tráfego, URL e informações do navegador.
 */
const getCommonMetadata = () => {
    return {
        ...trafficSource.getOriginData(), // Adiciona todos os dados de UTM, Click IDs, referrer, etc.
        url: window.location.href,
        ua: navigator.userAgent,
    };
};

/**
 * EventTracker: Centraliza o envio de telemetria rica.
 * Adiciona automaticamente metadados contextuais, como origem do tráfego e rastro do usuário.
 */
export const eventTracker = {
    /**
     * Rastreia um erro crítico com snapshot de estado e metadados completos.
     */
    trackCriticalError: (error: Error | string, context: string) => {
        const errorMsg = typeof error === 'string' ? error : error.message;
        const stack = error instanceof Error ? error.stack : undefined;

        console.error(`🚨 [EventTracker] Critical Error in ${context}:`, errorMsg);

        eventCollectorService.track('user_error', {
            context,
            message: errorMsg,
            stack,
            breadcrumbs: stateLogger.getSnapshot(),
            ...getCommonMetadata(),
        });
    },

    /**
     * Rastreia uma ação de negócio importante com metadados completos.
     */
    trackAction: (actionName: string, data?: any) => {
        stateLogger.push(actionName, 'interaction', data);
        
        eventCollectorService.track('system_health_check', {
            action: actionName,
            ...data,
            ...getCommonMetadata(),
        });
    }
};
