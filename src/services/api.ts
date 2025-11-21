const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// Handle unauthorized/session expired responses
const handleUnauthorized = () => {
    // Clear authentication data
    localStorage.removeItem('segflow_active_session');
    localStorage.removeItem('token');

    // Redirect to login page
    window.location.href = '#/login';
};

export const api = {
    get: async (endpoint: string) => {
        const headers = getHeaders();
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        // Check for session expiration
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = typeof error.error === 'string'
                ? error.error
                : JSON.stringify(error.error);
            throw new Error(errorMessage || `API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    },

    post: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        // Check for session expiration
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = typeof error.error === 'string'
                ? error.error
                : JSON.stringify(error.error);
            throw new Error(errorMessage || `API Error: ${response.statusText}`);
        }
        return response.json();
    },

    put: async (endpoint: string, data: any) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        // Check for session expiration
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const error = await response.json();
            const errorMessage = typeof error.error === 'string'
                ? error.error
                : JSON.stringify(error.error);
            throw new Error(errorMessage || `API Error: ${response.statusText}`);
        }
        return response.json();
    },

    delete: async (endpoint: string) => {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        // Check for session expiration
        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `API Error: ${response.statusText}`);
        }
        return response.json();
    }
};
