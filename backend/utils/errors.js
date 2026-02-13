
/**
 * @fileoverview Módulo para classes de erro personalizadas da aplicação.
 * Permite a criação de erros com códigos de status HTTP e nomes específicos,
 * facilitando o tratamento de erros no middleware.
 */

/**
 * Erro base da aplicação, permite associar um código de status HTTP.
 */
class AppError extends Error {
    /**
     * @param {string} message - A mensagem de erro.
     * @param {number} statusCode - O código de status HTTP.
     * @param {Error} [originalError] - O erro original, se houver.
     */
    constructor(message, statusCode, originalError = null) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.originalError = originalError; // Guarda o erro original para logging.
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erro para recursos não encontrados (HTTP 404).
 */
class NotFoundError extends AppError {
    /**
     * @param {string} [message='Recurso não encontrado'] - A mensagem de erro.
     */
    constructor(message = 'Recurso não encontrado') {
        super(message, 404);
    }
}

export {
    AppError,
    NotFoundError
};
