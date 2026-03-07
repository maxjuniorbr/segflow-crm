import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../services/api';
import { storageService } from '../services/storage';

vi.mock('../services/api', () => ({
    api: { get: vi.fn() },
    ApiError: class extends Error {
        status?: number;
        constructor(msg: string, status?: number) {
            super(msg);
            this.status = status;
        }
    }
}));

vi.mock('../services/storage', () => ({
    storageService: { logout: vi.fn() }
}));

const TestConsumer = () => {
    const { user, loading, login, logout } = useAuth();

    return (
        <div>
            <span data-testid="loading">{loading.toString()}</span>
            <span data-testid="user">{user ? user.email : 'null'}</span>
            <span data-testid="auth">{user?.isAuthenticated?.toString() ?? 'false'}</span>
            <button onClick={() => login({ id: 2, name: 'New', cpf: '111', email: 'new@test.com', username: 'new' })}>
                Login
            </button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
});

describe('AuthProvider', () => {
    it('validates session on mount and sets user', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
            user: { id: 1, name: 'Admin', cpf: '123', email: 'admin@test.com', username: 'admin' }
        });

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading').textContent).toBe('true');

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        expect(screen.getByTestId('user').textContent).toBe('admin@test.com');
        expect(screen.getByTestId('auth').textContent).toBe('true');
        expect(api.get).toHaveBeenCalledWith('/api/auth/validate', { suppressToast: true, redirectOnAuthError: false });
    });

    it('clears user when validate returns no user', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({});

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('clears user when validate throws error', async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('login sets user with isAuthenticated', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({});
        const user = userEvent.setup();

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('false');
        });

        await user.click(screen.getByText('Login'));

        expect(screen.getByTestId('user').textContent).toBe('new@test.com');
        expect(screen.getByTestId('auth').textContent).toBe('true');
    });

    it('logout calls storageService.logout and clears session', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
            user: { id: 1, name: 'Admin', cpf: '123', email: 'admin@test.com', username: 'admin' }
        });
        vi.mocked(storageService.logout).mockResolvedValueOnce();
        sessionStorage.setItem('test-key', 'test-value');
        const user = userEvent.setup();

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('admin@test.com');
        });

        await user.click(screen.getByText('Logout'));

        expect(storageService.logout).toHaveBeenCalled();
        expect(sessionStorage.getItem('test-key')).toBeNull();
        expect(screen.getByTestId('user').textContent).toBe('null');
    });

    it('logout still clears user even if storageService.logout throws', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
            user: { id: 1, name: 'Admin', cpf: '123', email: 'admin@test.com', username: 'admin' }
        });
        vi.mocked(storageService.logout).mockRejectedValueOnce(new Error('Network'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const user = userEvent.setup();

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('admin@test.com');
        });

        await user.click(screen.getByText('Logout'));

        expect(screen.getByTestId('user').textContent).toBe('null');
        consoleSpy.mockRestore();
    });
});

describe('useAuth', () => {
    it('throws when used outside AuthProvider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
        consoleSpy.mockRestore();
    });
});
