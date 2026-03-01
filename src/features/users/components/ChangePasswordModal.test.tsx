import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePasswordModal } from './ChangePasswordModal';

async function fillPasswordForm(
    user: ReturnType<typeof userEvent.setup>,
    { current, newPwd, confirm }: { current: string; newPwd: string; confirm: string }
) {
    await user.clear(screen.getByLabelText(/Senha Atual/i));
    await user.type(screen.getByLabelText(/Senha Atual/i), current);
    await user.clear(screen.getByLabelText(/^Nova Senha/i));
    await user.type(screen.getByLabelText(/^Nova Senha/i), newPwd);
    await user.clear(screen.getByLabelText(/^Confirmar Nova Senha/i));
    await user.type(screen.getByLabelText(/^Confirmar Nova Senha/i), confirm);
}

describe('ChangePasswordModal', () => {
    it('valida senha fraca antes de enviar', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn().mockResolvedValue(undefined);
        render(
            <ChangePasswordModal
                isOpen
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />
        );

        await fillPasswordForm(user, { current: '12345678', newPwd: '1234567', confirm: '1234567' });
        await user.click(screen.getByRole('button', { name: /alterar senha/i }));

        expect(await screen.findByText('A nova senha deve ter no mínimo 10 caracteres, combinando letras e números.', { selector: 'p.text-danger-600' })).toBeInTheDocument();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('envia dados quando validações passam', async () => {
        const user = userEvent.setup();
        const onConfirm = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        render(
            <ChangePasswordModal
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
            />
        );

        await fillPasswordForm(user, { current: 'SenhaAtual1', newPwd: 'SenhaNova1', confirm: 'SenhaNova1' });
        await user.click(screen.getByRole('button', { name: /alterar senha/i }));

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith('SenhaAtual1', 'SenhaNova1');
            expect(onClose).toHaveBeenCalled();
        });
    });
});
