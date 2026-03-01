import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DocumentList } from './DocumentList';

const getDocumentsMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    getDocuments: (...args: any[]) => getDocumentsMock(...args),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('DocumentList page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('loads more documents when requested', async () => {
    const user = userEvent.setup();

    getDocumentsMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 'doc-1',
            clientId: 'cli-1',
            type: 'Auto',
            company: 'Seg',
            documentNumber: '123',
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            status: 'Proposta',
            clientName: 'Cliente 1',
            clientPersonType: 'Física',
            clientCpf: '123',
          }
        ],
        total: 2,
        limit: 50,
        offset: 0,
        nextCursor: 'cursor-1'
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: 'doc-2',
            clientId: 'cli-2',
            type: 'Life',
            company: 'Seg2',
            documentNumber: '456',
            startDate: '2025-02-01',
            endDate: '2026-01-31',
            status: 'Apólice',
            clientName: 'Cliente 2',
            clientPersonType: 'Jurídica',
            clientCnpj: '999',
          }
        ],
        total: 2,
        limit: 50,
        offset: 0,
        nextCursor: null
      });

    render(
      <MemoryRouter>
        <DocumentList />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(getDocumentsMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
      expect(screen.getAllByText('Cliente 1').length).toBeGreaterThan(0);
    });

    const loadMore = screen.getByRole('button', { name: /carregar mais/i });
    await user.click(loadMore);

    await waitFor(() => {
      expect(getDocumentsMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 50, cursor: 'cursor-1' }));
      expect(screen.getAllByText('Cliente 2').length).toBeGreaterThan(0);
    });
  });
});
