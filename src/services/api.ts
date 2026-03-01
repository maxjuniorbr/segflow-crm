import { toastBus } from './toastBus';

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

interface ErrorPayload {
    error?: string | Array<{ message: string; path?: string[] }>;
    message?: string;
}

const buildErrorMessage = (status: number, payload: ErrorPayload | null) => {
    if (payload) {
        if (Array.isArray(payload.error)) {
            const messages = payload.error.map((e) => e.message).join(', ');
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

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const tryRefreshToken = async (): Promise<boolean> => {
    if (isRefreshing && refreshPromise) return refreshPromise;

    isRefreshing = true;
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
    }).then(res => res.ok).catch(() => false).finally(() => {
        isRefreshing = false;
        refreshPromise = null;
    });

    return refreshPromise;
};

const handleResponse = async (
    response: Response,
    options?: ApiRequestOptions,
    retryFn?: () => Promise<Response>
) => {
    if (response.status === 401 && retryFn && options?.redirectOnAuthError !== false) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
            const retryResponse = await retryFn();
            if (retryResponse.status === 401) {
                handleUnauthorized();
                throw new ApiError('Sessão expirada.', 401);
            }
            return handleResponse(retryResponse, options);
        }
        handleUnauthorized();
        throw new ApiError('Sessão expirada.', 401);
    }

    if (response.status === 401) {
        const shouldRedirect = options?.redirectOnAuthError !== false;
        if (shouldRedirect) {
            handleUnauthorized();
        }
        const message = shouldRedirect
            ? 'Sessão expirada.'
            : getStatusMessage(response.status, 'Não autorizado.');
        throw new ApiError(message, response.status);
    }

    if (response.status === 403) {
        const errorPayload = await parseError(response);
        const message = buildErrorMessage(response.status, errorPayload);
        throw new ApiError(message, response.status, errorPayload);
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
    suppressToast?: boolean;
};

const request = async (endpoint: string, init: RequestInit, options?: ApiRequestOptions) => {
    try {
        const doFetch = () => fetch(`${API_URL}${endpoint}`, init);
        const response = await doFetch();
        return await handleResponse(response, options, doFetch);
    } catch (error) {
        if (error instanceof ApiError) {
            if (!options?.suppressToast) {
                toastBus.notify({ message: error.message, type: 'error' });
            }
            throw error;
        }
        const apiError = new ApiError(networkErrorMessage);
        if (!options?.suppressToast) {
            toastBus.notify({ message: apiError.message, type: 'error' });
        }
        throw apiError;
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

    post: async (endpoint: string, data?: unknown, options?: ApiRequestOptions) => {
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

    put: async (endpoint: string, data: unknown, options?: ApiRequestOptions) => {
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
