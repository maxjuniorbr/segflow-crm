import '@testing-library/jest-dom';
import { vi } from 'vitest';

const testingGlobal = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
};

testingGlobal.IS_REACT_ACT_ENVIRONMENT = true;

const mockCanvasContext = {
    clearRect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray() })),
    measureText: vi.fn(() => ({ width: 0 })),
    putImageData: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn()
} as unknown as CanvasRenderingContext2D;

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: vi.fn(() => mockCanvasContext)
});

const originalGetComputedStyle = window.getComputedStyle.bind(window);

Object.defineProperty(window, 'getComputedStyle', {
    configurable: true,
    value: ((element: Element, pseudoElement?: string) =>
        originalGetComputedStyle(element, pseudoElement ? undefined : pseudoElement)) as typeof window.getComputedStyle
});
