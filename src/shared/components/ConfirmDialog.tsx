import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './UIComponents';

interface ConfirmDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar', variant = 'danger'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: 'bg-danger-50 text-danger-600',
        warning: 'bg-warning-50 text-warning-600',
        info: 'bg-info-50 text-info-600'
    };

    const buttonVariants = {
        danger: 'danger',
        warning: 'secondary',
        info: 'primary'
    } as const;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-neutral-900/50 transition-opacity"
                onClick={onCancel}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-start p-6">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${variantStyles[variant]}`}>
                        <AlertTriangle className="h-6 w-6" />
                    </div>

                    <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-600">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="ml-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-neutral-50 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={buttonVariants[variant]}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
};
