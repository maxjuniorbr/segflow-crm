import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ClientForm } from './ClientForm';

const saveClientMock = vi.fn();
const navigateMock = vi.fn();
const showToastMock = vi.fn();
const fetchAddressMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    saveClient: (...args: any[]) => saveClientMock(...args)
  }
}));

vi.mock('../../../services/external', () => ({
  externalService: {
    fetchAddressByCep: (...args: any[]) => fetchAddressMock(...args)
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
    const user = userEvent.setup();
    saveClientMock.mockResolvedValueOnce({});
    fetchAddressMock.mockResolvedValueOnce(null);

    render(
      <MemoryRouter initialEntries={['/clients/new']}>
        <Routes>
          <Route path="/clients/new" element={<ClientForm />} />
        </Routes>
      </MemoryRouter>
    );

    await user.clear(screen.getByLabelText(/Nome Completo/i));
    await user.type(screen.getByLabelText(/Nome Completo/i), 'Joao Teste');
    await user.clear(screen.getByLabelText(/^CPF/i));
    await user.type(screen.getByLabelText(/^CPF/i), '390.533.447-05');
    await user.clear(screen.getByLabelText(/Data de Nascimento/i));
    await user.type(screen.getByLabelText(/Data de Nascimento/i), '01/01/1990');
    await user.clear(screen.getByLabelText(/Email/i));
    await user.type(screen.getByLabelText(/Email/i), 'joao@example.com');
    await user.clear(screen.getByLabelText(/Telefone\/Celular/i));
    await user.type(screen.getByLabelText(/Telefone\/Celular/i), '(11) 99999-9999');

    await user.clear(screen.getByRole('textbox', { name: /^CEP/i }));
    await user.type(screen.getByRole('textbox', { name: /^CEP/i }), '01001-000');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByLabelText(/Logradouro/i)).not.toHaveAttribute('readonly');
    });

    await user.type(screen.getByLabelText(/Logradouro/i), 'Rua Exemplo');
    await user.clear(screen.getByLabelText(/Número/i));
    await user.type(screen.getByLabelText(/Número/i), '123');
    await user.type(screen.getByLabelText(/Bairro/i), 'Centro');
    await user.type(screen.getByLabelText(/Cidade/i), 'Sao Paulo');
    await user.type(screen.getByLabelText(/UF/i), 'SP');

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

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
