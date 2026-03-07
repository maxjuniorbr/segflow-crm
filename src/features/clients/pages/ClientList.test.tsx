import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ClientList } from './ClientList';

const getClientsMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    getClients: (...args: any[]) => getClientsMock(...args),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('ClientList page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('loads more clients when requested', async () => {
    const user = userEvent.setup();

    getClientsMock
      .mockResolvedValueOnce({
        items: [
          {
            id: 'cli-1',
            name: 'Cliente 1',
            personType: 'Física',
            cpf: '123',
            email: 'cli1@example.com',
            phone: '11999999999',
            address: { city: 'SP', state: 'SP' },
            createdAt: '2024-01-01'
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
            id: 'cli-2',
            name: 'Cliente 2',
            personType: 'Jurídica',
            cnpj: '999',
            email: 'cli2@example.com',
            phone: '11888888888',
            address: { city: 'RJ', state: 'RJ' },
            createdAt: '2024-01-02'
          }
        ],
        total: 2,
        limit: 50,
        offset: 0,
        nextCursor: null
      });

    render(
      <MemoryRouter>
        <ClientList />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(getClientsMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
      expect(screen.getAllByText('Cliente 1').length).toBeGreaterThan(0);
    });

    const loadMore = screen.getByRole('button', { name: /carregar mais/i });
    await user.click(loadMore);

    await waitFor(() => {
      expect(getClientsMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 50, cursor: 'cursor-1' }));
      expect(screen.getAllByText('Cliente 2').length).toBeGreaterThan(0);
    });
  });

  it('shows empty state when no results', async () => {
    const user = userEvent.setup();

    getClientsMock.mockResolvedValueOnce({
      items: [], total: 0, limit: 50, offset: 0, nextCursor: null
    });

    render(<MemoryRouter><ClientList /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText(/nenhum cliente/i)).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    getClientsMock.mockRejectedValueOnce(new Error('Network error'));

    render(<MemoryRouter><ClientList /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
