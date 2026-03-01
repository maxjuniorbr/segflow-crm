import { isDevelopment, isTest } from '../../config/env.js';
import { AppError } from './AppError.js';

export const getErrorResponse = (err, { defaultMessage } = {}) => {
    const status = err?.statusCode || err?.status || 500;
    const fallback = defaultMessage || 'Erro ao processar requisição';
    const isAppError = err instanceof AppError;
    const message = (isAppError || isDevelopment || isTest) ? (err?.message || fallback) : fallback;

    return {
        status,
        payload: { error: message }
    };
};

export const logError = (context, err) => {
    if (isDevelopment || isTest) {
        console.error(`Error in ${context}:`, err);
    } else {
        console.error(`Error in ${context}: ${err?.message || 'Unknown error'} [code=${err?.code || '-'}]`);
    }
};
