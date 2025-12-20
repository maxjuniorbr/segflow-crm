import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClientForm } from './ClientForm';

const saveClientMock = vi.fn();
const navigateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    saveClient: (...args: any[]) => saveClientMock(...args)
  }
}));

vi.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: showToastMock })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

describe('ClientForm page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits new client data', async () => {
    saveClientMock.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={['/clients/new']}>
        <Routes>
          <Route path="/clients/new" element={<ClientForm />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Joao Teste' } });
    fireEvent.change(screen.getByLabelText(/^CPF/i), { target: { value: '390.533.447-05' } });
    fireEvent.change(screen.getByLabelText(/Data de Nascimento/i), { target: { value: '01/01/1990' } });
    fireEvent.change(screen.getByLabelText(/Email \*/i), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByLabelText(/Telefone\/Celular/i), { target: { value: '(11) 99999-9999' } });
    fireEvent.change(screen.getByLabelText(/CEP/i), { target: { value: '01001-000' } });
    fireEvent.change(screen.getByLabelText(/Logradouro/i), { target: { value: 'Rua Exemplo' } });
    fireEvent.change(screen.getByLabelText(/Número/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Bairro/i), { target: { value: 'Centro' } });
    fireEvent.change(screen.getByLabelText(/Cidade/i), { target: { value: 'Sao Paulo' } });
    fireEvent.change(screen.getByLabelText(/UF/i), { target: { value: 'SP' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar Dados/i }));

    await waitFor(() => {
      expect(saveClientMock).toHaveBeenCalled();
    });

    expect(saveClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '',
        name: 'Joao Teste',
        email: 'joao@example.com',
        address: expect.objectContaining({
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01001-000'
        })
      }),
      true
    );

    expect(showToastMock).toHaveBeenCalledWith('Cliente criado com sucesso!', 'success');
    expect(navigateMock).toHaveBeenCalledWith('/clients');
  });
});
