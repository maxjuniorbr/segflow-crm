import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DocumentForm } from './DocumentForm';

const getClientsMock = vi.fn();
const saveDocumentMock = vi.fn();
const navigateMock = vi.fn();
const showToastMock = vi.fn();
const getClientByIdMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    getClients: (...args: any[]) => getClientsMock(...args),
    getClientById: (...args: any[]) => getClientByIdMock(...args),
    saveDocument: (...args: any[]) => saveDocumentMock(...args)
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

describe('DocumentForm page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClientsMock.mockResolvedValue({
      items: [
        {
          id: 'cli-1',
          name: 'Joao Cliente',
          personType: 'Física',
          email: 'joao@example.com',
          phone: '11999999999',
          address: {
            street: 'Rua A',
            number: '1',
            neighborhood: 'Centro',
            city: 'Sao Paulo',
            state: 'SP',
            zipCode: '01001-000'
          },
          createdAt: '2024-01-01'
        }
      ],
      total: 1,
      limit: 500,
      offset: 0
    });
  });

  it('creates a new document and redirects to client', async () => {
    const user = userEvent.setup();
    saveDocumentMock.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={['/documents/new']}>
        <Routes>
          <Route path="/documents/new" element={<DocumentForm />} />
        </Routes>
      </MemoryRouter>
    );

    const clientSearch = await screen.findByLabelText(/Cliente/i);
    await user.clear(clientSearch);
    await user.type(clientSearch, 'Joao');
    await waitFor(() => {
      expect(getClientsMock).toHaveBeenCalled();
    });

    const clientOption = await screen.findByText(/Joao Cliente/i);
    const clientButton = clientOption.closest('button');
    if (!clientButton) throw new Error('Expected button parent');
    await user.click(clientButton);

    await user.clear(screen.getByLabelText(/Início de Vigência/i));
    await user.type(screen.getByLabelText(/Início de Vigência/i), '01/01/2025');
    await user.clear(screen.getByLabelText(/Fim de Vigência/i));
    await user.type(screen.getByLabelText(/Fim de Vigência/i), '31/12/2025');

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(saveDocumentMock).toHaveBeenCalled();
    });

    expect(saveDocumentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '',
        clientId: 'cli-1',
        type: 'Auto',
        company: 'Porto Seguro',
        status: 'Proposta',
        startDate: '2025-01-01',
        endDate: '2025-12-31'
      }),
      true
    );

    expect(showToastMock).toHaveBeenCalledWith('Documento criado com sucesso!', 'success');
    expect(navigateMock).toHaveBeenCalledWith('/clients/cli-1');
  });

});
