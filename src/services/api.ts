const API_URL = import.meta.env.VITE_API_URL || '';

const defaultHeaders = {
    'Content-Type': 'application/json'
};

export class ApiError extends Error {
    status?: number;
    details?: unknown;

    constructor(message: string, status?: number, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.details = details;
    }
}

const statusMessages: Record<number, string> = {
    400: 'Requisição inválida.',
    401: 'Não autorizado.',
    403: 'Acesso negado.',
    404: 'Recurso não encontrado.',
    409: 'Conflito ao processar a solicitação.',
    422: 'Dados inválidos.',
    500: 'Erro interno no servidor.'
};

const getStatusMessage = (status: number, fallback: string) => {
    return statusMessages[status] || fallback;
};

const networkErrorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

const handleUnauthorized = () => {
    window.location.href = '#/login';
};

const parseError = async (response: Response) => {
    if (response.status === 204) return null;
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const buildErrorMessage = (status: number, payload: any) => {
    if (payload) {
        if (Array.isArray(payload.error)) {
            const messages = payload.error.map((e: any) => e.message).join(', ');
            if (messages) return messages;
        }
        if (typeof payload.error === 'string' && payload.error.trim()) {
            return payload.error;
        }
        if (typeof payload.message === 'string' && payload.message.trim()) {
            return payload.message;
        }
    }

    return getStatusMessage(status, `Erro inesperado (HTTP ${status}).`);
};

const handleResponse = async (response: Response, options?: ApiRequestOptions) => {
    if (response.status === 401 || response.status === 403) {
        const shouldRedirect = options?.redirectOnAuthError !== false;
        if (shouldRedirect) {
            handleUnauthorized();
        }
        const message = shouldRedirect
            ? 'Sessão expirada.'
            : getStatusMessage(response.status, 'Não autorizado.');
        throw new ApiError(message, response.status);
    }

    if (!response.ok) {
        const errorPayload = await parseError(response);
        const errorMessage = buildErrorMessage(response.status, errorPayload);
        throw new ApiError(errorMessage, response.status, errorPayload);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

type ApiRequestOptions = {
    redirectOnAuthError?: boolean;
};

const request = async (endpoint: string, init: RequestInit, options?: ApiRequestOptions) => {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, init);
        return handleResponse(response, options);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(networkErrorMessage);
    }
};

export const api = {
    get: async (endpoint: string, options?: ApiRequestOptions) => {
        return request(endpoint, {
            method: 'GET',
            headers: defaultHeaders,
            credentials: 'include'
        }, options);
    },

    post: async (endpoint: string, data?: any, options?: ApiRequestOptions) => {
        const requestInit: RequestInit = {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include'
        };

        if (data !== undefined) {
            requestInit.body = JSON.stringify(data);
        }

        return request(endpoint, requestInit, options);
    },

    put: async (endpoint: string, data: any, options?: ApiRequestOptions) => {
        return request(endpoint, {
            method: 'PUT',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(data)
        }, options);
    },

    delete: async (endpoint: string, options?: ApiRequestOptions) => {
        return request(endpoint, {
            method: 'DELETE',
            headers: defaultHeaders,
            credentials: 'include'
        }, options);
    }
};
