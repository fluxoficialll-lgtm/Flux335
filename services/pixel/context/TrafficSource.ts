
import { TrafficSourceData } from '../../../types/pixel.types';

const STORAGE_KEY = 'flux_traffic_origin';

export const trafficSource = {
  /**
   * Analisa a URL e o referrer para capturar a origem do tráfego de forma mais precisa.
   * Salva os dados se encontrar qualquer parâmetro de marketing ou um referrer.
   */
  capture: () => {
    const params = new URLSearchParams(window.location.search);
    const sourceData: TrafficSourceData = {};
    let hasMarketingData = false;

    // Lista de parâmetros a serem capturados
    const marketingParams: (keyof TrafficSourceData)[] = [
      'utm_source', 'utm_medium', 'utm_campaign',
      'utm_content', 'utm_term', 'gclid', 'fbclid', 'ref'
    ];

    marketingParams.forEach(key => {
      const value = params.get(key as string);
      if (value) {
        sourceData[key] = value;
        hasMarketingData = true;
      }
    });

    // Analisa o document.referrer
    const referrer = document.referrer;
    let referringDomain = '';
    if (referrer) {
      try {
        referringDomain = new URL(referrer).hostname;
      } catch (error) {
        console.warn('[TrafficSource] Falha ao parsear o referrer:', referrer);
      }
    }

    // Decide se deve salvar os dados
    if (hasMarketingData || referringDomain) {
      const finalData = {
        ...sourceData,
        referrer: referrer || undefined,
        referring_domain: referringDomain || undefined,
        timestamp: Date.now()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalData));
      console.log("🚦 [TrafficSource] Origem de tráfego capturada:", finalData);
    }
  },

  /**
   * Retorna os dados de origem salvos, se existirem e forem válidos.
   * A janela de atribuição é de 30 dias.
   */
  getOriginData: (): TrafficSourceData => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    
    try {
      const parsed = JSON.parse(raw);
      
      // Janela de atribuição de 30 dias
      if (Date.now() - parsed.timestamp > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }

      // Remove o timestamp para retornar apenas os dados de origem
      delete parsed.timestamp;
      
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
  }
};
