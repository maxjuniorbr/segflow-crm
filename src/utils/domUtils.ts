export const scrollToFirstError = (padding = 96) => {
  if (typeof document === 'undefined') return;

  const selector = '[data-error="true"], input.border-danger-200, select.border-danger-200, textarea.border-danger-200';
  const element = document.querySelector(selector) as HTMLElement | null;

  if (!element) return;

  const rect = element.getBoundingClientRect();
  const top = window.scrollY + rect.top - padding;

  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

  if ('focus' in element) {
    (element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).focus({ preventScroll: true });
  }
};
