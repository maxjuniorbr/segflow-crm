import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordModal } from './ChangePasswordModal';

describe('ChangePasswordModal', () => {
    it('valida senha fraca antes de enviar', async () => {
        const onConfirm = vi.fn().mockResolvedValue(undefined);
        render(
            <ChangePasswordModal
                isOpen
                onClose={vi.fn()}
                onConfirm={onConfirm}
            />
        );

        fireEvent.change(screen.getByLabelText('Senha Atual'), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText('Nova Senha'), { target: { value: '1234567' } });
        fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), { target: { value: '1234567' } });
        fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

        expect(await screen.findByText('Senha deve ter ao menos 8 caracteres, com letras e números')).toBeInTheDocument();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('envia dados quando validações passam', async () => {
        const onConfirm = vi.fn().mockResolvedValue(undefined);
        const onClose = vi.fn();
        render(
            <ChangePasswordModal
                isOpen
                onClose={onClose}
                onConfirm={onConfirm}
            />
        );

        fireEvent.change(screen.getByLabelText('Senha Atual'), { target: { value: 'SenhaAtual1' } });
        fireEvent.change(screen.getByLabelText('Nova Senha'), { target: { value: 'SenhaNova1' } });
        fireEvent.change(screen.getByLabelText('Confirmar Nova Senha'), { target: { value: 'SenhaNova1' } });
        fireEvent.click(screen.getByRole('button', { name: /alterar senha/i }));

        await waitFor(() => {
            expect(onConfirm).toHaveBeenCalledWith('SenhaAtual1', 'SenhaNova1');
            expect(onClose).toHaveBeenCalled();
        });
    });
});
