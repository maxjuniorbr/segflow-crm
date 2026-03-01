import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError } from './api';
import { toastBus, ToastType } from './toastBus';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createResponse = (status: number, body?: unknown, ok?: boolean): Response => ({
    status,
    ok: ok ?? (status >= 200 && status < 300),
    json: vi.fn().mockResolvedValue(body ?? {}),
    headers: new Headers(),
    redirected: false,
    statusText: 'OK',
    type: 'basic' as ResponseType,
    url: '',
    clone: vi.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: vi.fn(),
    blob: vi.fn(),
    formData: vi.fn(),
    text: vi.fn(),
    bytes: vi.fn()
});

let toastLog: Array<{ message: string; type: ToastType }>;
let unsubscribe: () => void;

beforeEach(() => {
    vi.clearAllMocks();
    toastLog = [];
    unsubscribe = toastBus.subscribe(payload => toastLog.push(payload));
});

afterEach(() => {
    unsubscribe();
});

describe('ApiError', () => {
    it('creates error with message, status and details', () => {
        const err = new ApiError('test', 400, { field: 'email' });
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe('ApiError');
        expect(err.message).toBe('test');
        expect(err.status).toBe(400);
        expect(err.details).toEqual({ field: 'email' });
    });
});

describe('api.get', () => {
    it('makes GET request with correct headers and credentials', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(200, { data: 'ok' }));

        const result = await api.get('/api/test');
        expect(result).toEqual({ data: 'ok' });
        expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            method: 'GET',
            credentials: 'include'
        }));
    });

    it('returns null for 204 responses', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(204, null, true));
        const result = await api.get('/api/test');
        expect(result).toBeNull();
    });
});

describe('api.post', () => {
    it('sends JSON body when data is provided', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(201, { id: '1' }));

        await api.post('/api/test', { name: 'test' });
        expect(mockFetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ name: 'test' })
        }));
    });

    it('does not send body when data is undefined', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(200, {}));

        await api.post('/api/test');
        const callArgs = mockFetch.mock.calls[0][1];
        expect(callArgs.body).toBeUndefined();
    });
});

describe('api.put', () => {
    it('sends PUT request with JSON body', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(200, {}));

        await api.put('/api/test/1', { name: 'updated' });
        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ name: 'updated' })
        }));
    });
});

describe('api.delete', () => {
    it('sends DELETE request', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(204, null, true));

        await api.delete('/api/test/1');
        expect(mockFetch).toHaveBeenCalledWith('/api/test/1', expect.objectContaining({
            method: 'DELETE'
        }));
    });
});

describe('error handling', () => {
    it('throws ApiError with server error message', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(400, { error: 'Campo obrigatório' }));

        await expect(api.get('/api/test')).rejects.toThrow('Campo obrigatório');
    });

    it('handles array error payload', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(400, {
            error: [{ message: 'Email inválido', path: ['email'] }]
        }));

        await expect(api.get('/api/test')).rejects.toThrow('Email inválido');
    });

    it('uses payload.message as fallback', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(422, { message: 'Dados inválidos' }));

        await expect(api.get('/api/test')).rejects.toThrow('Dados inválidos');
    });

    it('uses status message when no payload message', async () => {
        const resp = createResponse(500, null);
        resp.json = vi.fn().mockRejectedValue(new Error('no json'));
        mockFetch.mockResolvedValueOnce(resp);

        await expect(api.get('/api/test')).rejects.toThrow('Erro interno no servidor.');
    });

    it('uses generic fallback for unknown status', async () => {
        const resp = createResponse(599, null);
        resp.json = vi.fn().mockRejectedValue(new Error('no json'));
        mockFetch.mockResolvedValueOnce(resp);

        await expect(api.get('/api/test')).rejects.toThrow(/Erro inesperado/);
    });

    it('throws network error when fetch fails', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(api.get('/api/test')).rejects.toThrow(/conectar ao servidor/);
    });
});

describe('toast notifications', () => {
    it('emits error toast on API error', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(400, { error: 'Bad request' }));

        await expect(api.get('/api/test')).rejects.toThrow();
        expect(toastLog).toEqual([expect.objectContaining({ type: 'error' })]);
    });

    it('suppresses toast when suppressToast is true', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(400, { error: 'Bad request' }));

        await expect(api.get('/api/test', { suppressToast: true })).rejects.toThrow();
        expect(toastLog).toHaveLength(0);
    });

    it('emits error toast on network error', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(api.get('/api/test')).rejects.toThrow();
        expect(toastLog).toEqual([expect.objectContaining({
            type: 'error',
            message: expect.stringContaining('conectar')
        })]);
    });

    it('suppresses toast on network error when suppressToast is true', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        await expect(api.get('/api/test', { suppressToast: true })).rejects.toThrow();
        expect(toastLog).toHaveLength(0);
    });
});

describe('401 handling and token refresh', () => {
    it('attempts token refresh on 401 and retries on success', async () => {
        mockFetch
            .mockResolvedValueOnce(createResponse(401, {}, false))
            .mockResolvedValueOnce(createResponse(200, {}, true))
            .mockResolvedValueOnce(createResponse(200, { data: 'refreshed' }));

        const result = await api.get('/api/protected');
        expect(result).toEqual({ data: 'refreshed' });
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('redirects to login when refresh fails', async () => {
        mockFetch
            .mockResolvedValueOnce(createResponse(401, {}, false))
            .mockResolvedValueOnce(createResponse(401, {}, false));

        await expect(api.get('/api/protected')).rejects.toThrow('Sessão expirada.');
        expect(globalThis.location.href).toContain('#/login');
    });

    it('does not redirect when redirectOnAuthError is false', async () => {
        const hrefBefore = globalThis.location.href;
        mockFetch.mockResolvedValueOnce(createResponse(401, {}, false));

        await expect(
            api.get('/api/test', { redirectOnAuthError: false })
        ).rejects.toThrow('Não autorizado.');
        expect(globalThis.location.href).toBe(hrefBefore);
    });

    it('handles 403 without redirect (not an auth failure)', async () => {
        const hrefBefore = globalThis.location.href;
        mockFetch.mockResolvedValueOnce(createResponse(403, { error: 'Acesso negado' }, false));

        await expect(api.get('/api/admin')).rejects.toThrow('Acesso negado');
        expect(globalThis.location.href).toBe(hrefBefore);
    });

    it('handles 403 with custom error message from server', async () => {
        mockFetch.mockResolvedValueOnce(createResponse(403, { error: 'Você só pode alterar sua própria senha' }, false));

        await expect(api.get('/api/admin')).rejects.toThrow('Você só pode alterar sua própria senha');
    });

    it('redirects on double-401 when refresh succeeds but retry still returns 401', async () => {
        mockFetch
            .mockResolvedValueOnce(createResponse(401, {}, false))
            .mockResolvedValueOnce(createResponse(200, {}, true))
            .mockResolvedValueOnce(createResponse(401, {}, false));

        await expect(api.get('/api/protected')).rejects.toThrow('Sessão expirada.');
        expect(globalThis.location.href).toContain('#/login');
    });
});
