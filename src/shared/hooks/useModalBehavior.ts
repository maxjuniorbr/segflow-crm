import { useRef, useEffect, useLayoutEffect, useCallback, type RefObject } from 'react';

interface UseModalBehaviorOptions {
    isOpen: boolean;
    onClose: () => void;
    autoFocusSelector?: string;
}

const FOCUSABLE_SELECTOR =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function useModalBehavior({
    isOpen,
    onClose,
    autoFocusSelector,
}: UseModalBehaviorOptions): RefObject<HTMLDivElement | null> {
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }
            if (e.key === 'Tab' && dialogRef.current) {
                const focusable =
                    dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
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
        },
        [onClose],
    );

    useLayoutEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement | null;
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        if (autoFocusSelector) {
            requestAnimationFrame(() => {
                dialogRef.current
                    ?.querySelector<HTMLElement>(autoFocusSelector)
                    ?.focus();
            });
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown, autoFocusSelector]);

    return dialogRef;
}
