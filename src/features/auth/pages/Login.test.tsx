import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();
const validateUserMock = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('../../../services/storage', () => ({
    storageService: {
        validateUser: (...args: any[]) => validateUserMock(...args),
        logout: vi.fn(),
    },
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Login page', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        validateUserMock.mockReset();
        mockUseAuth.mockReset();
    });

    it('shows error when credentials are inválidos', async () => {
        const user = userEvent.setup();
        validateUserMock.mockResolvedValue(null);
        mockUseAuth.mockReturnValue({ login: vi.fn() });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        await user.clear(screen.getByLabelText(/Email/i));
        await user.type(screen.getByLabelText(/Email/i), 'teste@example.com');
        await user.clear(screen.getByLabelText(/^Senha/i));
        await user.type(screen.getByLabelText(/^Senha/i), 'senha123');
        await user.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(screen.getByText('Email ou senha inválidos.')).toBeInTheDocument();
        });
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates to dashboard on login success', async () => {
        const user = userEvent.setup();
        const fakeUser = { id: 1, name: 'Teste', cpf: '123', email: 'teste@example.com', username: 'teste', isAuthenticated: true };
        const loginSpy = vi.fn();
        validateUserMock.mockResolvedValue(fakeUser);
        mockUseAuth.mockReturnValue({ login: loginSpy });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        await user.clear(screen.getByLabelText(/Email/i));
        await user.type(screen.getByLabelText(/Email/i), 'teste@example.com');
        await user.clear(screen.getByLabelText(/^Senha/i));
        await user.type(screen.getByLabelText(/^Senha/i), 'senha123');
        await user.click(screen.getByRole('button', { name: /entrar/i }));

        await waitFor(() => {
            expect(loginSpy).toHaveBeenCalledWith(fakeUser);
        });
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
        expect(screen.queryByText('Email ou senha inválidos.')).toBeNull();
    });
});
