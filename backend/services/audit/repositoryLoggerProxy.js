
const { performance } = require('perf_hooks');

/**
 * Cria um proxy para um repositório a fim de registrar todas as chamadas de método.
 * Esta função "envelopa" cada método de um repositório para registrar informações
 * sobre a chamada, seu status (sucesso/erro) e o tempo de execução.
 *
 * @param {object} repository - O objeto do repositório original.
 * @param {object} logger - A instância do logger a ser usada (ex: trafficLogger).
 * @param {string} repositoryName - O nome do repositório para identificação nos logs.
 * @returns {object} - O repositório "envelopado" com a lógica de logging.
 */
const createRepositoryProxy = (repository, logger, repositoryName) => {
    const proxy = {};

    // Itera sobre todos os métodos do repositório original.
    for (const key of Object.keys(repository)) {
        const originalMethod = repository[key];

        if (typeof originalMethod === 'function') {
            // Cria uma nova função que substitui a original.
            proxy[key] = async function(...args) {
                const startTime = performance.now();
                
                // Tenta extrair o traceId dos argumentos da função.
                const traceId = args.find(arg => arg && arg.traceId)?.traceId || 'N/A';

                const logData = {
                    type: 'DATABASE_QUERY',
                    repository: repositoryName,
                    method: key,
                    traceId,
                };

                try {
                    // Executa o método original do repositório.
                    const result = await originalMethod.apply(repository, args);
                    const endTime = performance.now();

                    // Loga o sucesso da operação.
                    logger.log({
                        ...logData,
                        status: 'SUCCESS',
                        duration: `${(endTime - startTime).toFixed(2)}ms`,
                    });

                    return result;
                } catch (error) {
                    const endTime = performance.now();
                    
                    // Loga a falha da operação.
                    logger.log({
                        ...logData,
                        status: 'ERROR',
                        duration: `${(endTime - startTime).toFixed(2)}ms`,
                        error: error.message,
                    });

                    // Re-lança o erro para não alterar o fluxo da aplicação.
                    throw error;
                }
            };
        } else {
            // Copia propriedades que não são funções.
            proxy[key] = originalMethod;
        }
    }

    return proxy;
};

module.exports = { createRepositoryProxy };
