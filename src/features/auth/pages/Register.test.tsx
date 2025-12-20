import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';

const registerMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    register: (...args: any[]) => registerMock(...args)
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents submit when CPF is invalid', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Joao Teste' } });
    fireEvent.change(screen.getByLabelText(/^CPF/i), { target: { value: '123.456.789-00' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'Senha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Senha123' } });

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    expect(await screen.findByText('CPF inválido.')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers and redirects after success', async () => {
    registerMock.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Joao Teste' } });
    fireEvent.change(screen.getByLabelText(/^CPF/i), { target: { value: '390.533.447-05' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: 'Senha123' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: 'Senha123' } });

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Joao Teste',
        cpf: '390.533.447-05',
        email: 'joao@example.com',
        password: 'Senha123'
      });
    });

    expect(await screen.findByText('Conta Criada!')).toBeInTheDocument();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    }, { timeout: 2500 });
  });
});
