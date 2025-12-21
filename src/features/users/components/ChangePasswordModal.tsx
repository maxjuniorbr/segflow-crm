import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button, Input, HelperText, SectionTitle } from '../../../shared/components/UIComponents';
import { validationMessages } from '../../../utils/validationMessages';
import { uiMessages } from '../../../utils/uiMessages';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setLoading(false);
        onClose();
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!currentPassword) {
            newErrors.currentPassword = validationMessages.currentPasswordRequired;
        }

        if (!newPassword) {
            newErrors.newPassword = validationMessages.newPasswordRequired;
        } else if (newPassword.length < 8 || !/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
            newErrors.newPassword = validationMessages.passwordMinLengthStrong(8);
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = validationMessages.confirmPasswordRequired;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = validationMessages.passwordMismatch;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            await onConfirm(currentPassword, newPassword);
            handleClose();
        } catch (error) {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                    <SectionTitle>Alterar senha</SectionTitle>
                    <button
                        onClick={handleClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                        type="button"
                        aria-label={uiMessages.common.close}
                        title={uiMessages.common.close}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        id="currentPassword"
                        name="currentPassword"
                        label="Senha Atual"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            if (errors.currentPassword) setErrors(prev => ({ ...prev, currentPassword: '' }));
                        }}
                        error={errors.currentPassword}
                        required
                    />

                    <Input
                        id="newPassword"
                        name="newPassword"
                        label="Nova Senha"
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                        }}
                        error={errors.newPassword}
                        required
                    />

                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirmar Nova Senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        error={errors.confirmPassword}
                        required
                    />

                    <HelperText>
                        A nova senha deve ter no mínimo 8 caracteres, combinando letras e números.
                    </HelperText>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" isLoading={loading} className="flex-1">
                            Alterar Senha
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
