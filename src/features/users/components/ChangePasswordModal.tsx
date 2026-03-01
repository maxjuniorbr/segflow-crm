import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { X } from 'lucide-react';
import { Button, Input, HelperText, SectionTitle } from '../../../shared/components/UIComponents';
import { isStrongPassword } from '../../../utils/validators';
import { validationMessages } from '../../../utils/validationMessages';
import { uiMessages } from '../../../utils/uiMessages';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const titleId = useId();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const handleClose = useCallback(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
        setLoading(false);
        onClose();
    }, [onClose]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!currentPassword) {
            newErrors.currentPassword = validationMessages.currentPasswordRequired;
        }

        if (!newPassword) {
            newErrors.newPassword = validationMessages.newPasswordRequired;
        } else if (!isStrongPassword(newPassword, 10)) {
            newErrors.newPassword = validationMessages.passwordMinLengthStrong(10);
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
        } catch (_error) {
            setLoading(false);
        }
    };

    const dialogRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose();
            return;
        }
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [handleClose]);

    const previousFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        previousFocusRef.current = document.activeElement as HTMLElement | null;
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            const firstInput = dialogRef.current?.querySelector<HTMLElement>('input');
            firstInput?.focus();
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div
                ref={dialogRef}
                className="bg-card rounded-lg shadow-xl max-w-md w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <SectionTitle><span id={titleId}>{uiMessages.pages.users.form.changePasswordTitle}</span></SectionTitle>
                    <button
                        onClick={handleClose}
                        className="p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors rounded-full"
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
                        label={uiMessages.pages.users.form.currentPasswordLabel}
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
                        label={uiMessages.pages.users.form.newPasswordLabel}
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
                        label={uiMessages.pages.users.form.confirmNewPasswordLabel}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        error={errors.confirmPassword}
                        required
                    />

                    <HelperText>{uiMessages.pages.users.form.changePasswordHelper}</HelperText>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" isLoading={loading} className="flex-1">
                            {uiMessages.pages.users.form.changePasswordAction}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                            {uiMessages.common.cancel}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
