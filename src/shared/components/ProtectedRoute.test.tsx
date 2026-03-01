import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const mockUseAuth = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

describe('ProtectedRoute', () => {
    it('shows loading indicator quando contexto está carregando', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: true });
        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Conteúdo Seguro</div>
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('redireciona para login quando usuário não autenticado', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: false });
        render(
            <MemoryRouter initialEntries={['/privado']}>
                <Routes>
                    <Route
                        path="/privado"
                        element={
                            <ProtectedRoute>
                                <div>Conteúdo Seguro</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<div>Login Screen</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Login Screen')).toBeInTheDocument();
    });

    it('renderiza conteúdo quando usuário autenticado', () => {
        mockUseAuth.mockReturnValue({ user: { id: 1 }, loading: false });
        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Conteúdo Seguro</div>
                </ProtectedRoute>
            </MemoryRouter>
        );
        expect(screen.getByText('Conteúdo Seguro')).toBeInTheDocument();
    });
});
