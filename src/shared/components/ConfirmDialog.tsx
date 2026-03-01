import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from './UIComponents';
import { uiMessages } from '../../utils/uiMessages';
import { useModalBehavior } from '../hooks/useModalBehavior';

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
    confirmText = uiMessages.common.confirm,
    cancelText = uiMessages.common.cancel,
    variant = 'danger'
}) => {
    const dialogRef = useModalBehavior({ isOpen, onClose: onCancel });
    const uniqueId = React.useId();
    const titleId = `${uniqueId}-title`;
    const messageId = `${uniqueId}-message`;

    if (!isOpen) return null;

    const variantStyles = {
        danger: 'bg-danger-50 text-danger-600 dark:bg-danger-900/30 dark:text-danger-400',
        warning: 'bg-warning-50 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400',
        info: 'bg-info-50 text-info-600 dark:bg-info-900/30 dark:text-info-400'
    };

    const buttonVariants = {
        danger: 'danger',
        warning: 'secondary',
        info: 'primary'
    } as const;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onCancel}
                aria-hidden="true"
            />

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={messageId}
                className="relative bg-card rounded-lg shadow-xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200"
            >
                <div className="flex items-start p-6">
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${variantStyles[variant]}`}>
                        <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                    </div>

                    <div className="ml-4 flex-1">
                        <h3 id={titleId} className="text-lg font-semibold text-foreground">
                            {title}
                        </h3>
                        <p id={messageId} className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {message}
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="ml-4 p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-foreground transition-colors rounded-full"
                        aria-label={uiMessages.common.close}
                        title={uiMessages.common.close}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-background px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        autoFocus
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
