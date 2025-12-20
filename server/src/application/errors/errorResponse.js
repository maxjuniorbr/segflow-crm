export const getErrorResponse = (err, { defaultMessage } = {}) => {
    const status = err?.statusCode || err?.status || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';
    const fallback = defaultMessage || 'Erro ao processar requisição';
    const message = (isDevelopment || isTest) ? (err?.message || fallback) : fallback;

    return {
        status,
        payload: { error: message }
    };
};

export const logError = (context, err) => {
    console.error(`Error in ${context}:`, err);
};
