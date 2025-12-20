export type ToastType = 'success' | 'error' | 'warning' | 'info';

type ToastPayload = {
    message: string;
    type: ToastType;
};

type ToastListener = (payload: ToastPayload) => void;

const listeners = new Set<ToastListener>();

export const toastBus = {
    subscribe(listener: ToastListener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
    notify(payload: ToastPayload) {
        listeners.forEach(listener => listener(payload));
    }
};
