const API_URL = import.meta.env.VITE_API_URL || '';

const defaultHeaders = {
    'Content-Type': 'application/json'
};

const handleUnauthorized = () => {
    localStorage.removeItem('segflow_active_session');
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

const handleResponse = async (response: Response) => {
    if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        throw new Error('Sessão expirada');
    }

    if (!response.ok) {
        const error = await parseError(response);
        if (error && Array.isArray(error.error)) {
            const messages = error.error.map((e: any) => e.message).join(', ');
            throw new Error(messages);
        }
        const errorMessage = error && error.error
            ? error.error
            : `API Error: ${response.statusText}`;
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export const api = {
    get: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers: defaultHeaders,
            credentials: 'include'
        });
        return handleResponse(response);
    },

    post: async (endpoint: string, data?: any) => {
        const options: RequestInit = {
            method: 'POST',
            headers: defaultHeaders,
            credentials: 'include'
        };

        if (data !== undefined) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);
        return handleResponse(response);
    },

    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: defaultHeaders,
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: defaultHeaders,
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
