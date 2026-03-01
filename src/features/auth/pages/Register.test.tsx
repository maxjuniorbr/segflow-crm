import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Register } from './Register';
import { uiBaseMessages } from '../../../utils/uiBaseMessages';

const registerMock = vi.fn();
const navigateMock = vi.fn();

vi.mock('../../../services/storage', () => ({
  storageService: {
    registerBroker: (...args: any[]) => registerMock(...args)
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

async function fillRegisterForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { cpf?: string } = {}
) {
  const cpf = overrides.cpf ?? '390.533.447-05';

  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.corporateName, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.corporateName, 'i')), 'Test Corretora');
  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.tradeName, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.tradeName, 'i')), 'Test Fantasia');
  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.cnpj, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.cnpj, 'i')), '11.222.333/0001-81');
  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.fullName, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.fullName, 'i')), 'Joao Teste');
  await user.clear(screen.getByLabelText(new RegExp(`^${uiBaseMessages.labels.cpf}`, 'i')));
  await user.type(screen.getByLabelText(new RegExp(`^${uiBaseMessages.labels.cpf}`, 'i')), cpf);
  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.email, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.email, 'i')), 'joao@example.com');
  await user.clear(screen.getByLabelText(new RegExp(`^${uiBaseMessages.labels.password}`, 'i')));
  await user.type(screen.getByLabelText(new RegExp(`^${uiBaseMessages.labels.password}`, 'i')), 'SenhaForte123');
  await user.clear(screen.getByLabelText(new RegExp(uiBaseMessages.labels.confirmPassword, 'i')));
  await user.type(screen.getByLabelText(new RegExp(uiBaseMessages.labels.confirmPassword, 'i')), 'SenhaForte123');
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents submit when CPF is invalid', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await fillRegisterForm(user, { cpf: '123.456.789-00' });

    await user.click(screen.getByRole('button', { name: /Cadastrar/i }));

    expect(await screen.findByText('CPF inválido.')).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('registers and redirects after success', { timeout: 10000 }, async () => {
    const user = userEvent.setup();
    registerMock.mockResolvedValueOnce(undefined);

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await fillRegisterForm(user);

    await user.click(screen.getByRole('button', { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        corporateName: 'Test Corretora',
        tradeName: 'Test Fantasia',
        cnpj: '11.222.333/0001-81',
        susepCode: null,
        phone: null,
        mobile: null,
        contactName: 'Joao Teste',
        cpf: '390.533.447-05',
        email: 'joao@example.com',
        password: 'SenhaForte123'
      });
    });

    expect(await screen.findByText('Corretora Cadastrada!')).toBeInTheDocument();

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    }, { timeout: 3000 });
  });
});
