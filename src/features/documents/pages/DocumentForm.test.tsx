import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DocumentForm } from './DocumentForm';

const getClientsMock = vi.fn();
const saveDocumentMock = vi.fn();
const navigateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    getClients: (...args: any[]) => getClientsMock(...args),
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
    getClientsMock.mockResolvedValue([
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
    ]);
  });

  it('creates a new document and redirects to client', async () => {
    saveDocumentMock.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={['/documents/new']}>
        <Routes>
          <Route path="/documents/new" element={<DocumentForm />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getClientsMock).toHaveBeenCalled();
    });

    const clientSearch = await screen.findByLabelText(/Cliente/i);
    fireEvent.change(clientSearch, { target: { value: 'Joao' } });

    const clientOption = await screen.findByText(/Joao Cliente/i);
    fireEvent.click(clientOption.closest('button')!);

    fireEvent.change(screen.getByLabelText(/Início de Vigência/i), { target: { value: '01/01/2025' } });
    fireEvent.change(screen.getByLabelText(/Fim de Vigência/i), { target: { value: '31/12/2025' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }));

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
