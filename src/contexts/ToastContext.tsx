import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toastBus } from '../services/toastBus';
import { uiBaseMessages } from '../utils/uiBaseMessages';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    useEffect(() => {
        return () => {
            timersRef.current.forEach(timer => clearTimeout(timer));
            timersRef.current.clear();
        };
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, message, type };

        setToasts(prev => [...prev, newToast].slice(-5));

        const timer = setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
            timersRef.current.delete(id);
        }, 5000);
        timersRef.current.set(id, timer);
    }, []);

    useEffect(() => {
        const unsubscribe = toastBus.subscribe(({ message, type }) => {
            showToast(message, type);
        });
        return unsubscribe;
    }, [showToast]);

    const removeToast = useCallback((id: string) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info
    };

    const styles = {
        success: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-700',
        error: 'bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-700',
        warning: 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-700',
        info: 'bg-info-50 text-info-700 border-info-200 dark:bg-info-900/30 dark:text-info-400 dark:border-info-700'
    };

    const iconColors = {
        success: 'text-success-500',
        error: 'text-danger-500',
        warning: 'text-warning-500',
        info: 'text-info-500'
    };

    const urgentToasts = toasts.filter(t => t.type === 'error' || t.type === 'warning');
    const politeToasts = toasts.filter(t => t.type !== 'error' && t.type !== 'warning');

    const renderToast = (toast: Toast) => {
        const Icon = icons[toast.type];
        return (
            <div
                key={toast.id}
                className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-5 ${styles[toast.type]}`}
            >
                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[toast.type]}`} />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button
                    onClick={() => removeToast(toast.id)}
                    className="text-muted hover:text-foreground transition-colors"
                    aria-label={uiBaseMessages.common.close}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
                <div role="alert" aria-live="assertive" aria-atomic="false">
                    {urgentToasts.map(renderToast)}
                </div>
                <div role="status" aria-live="polite" aria-atomic="false">
                    {politeToasts.map(renderToast)}
                </div>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
