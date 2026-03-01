import { vi } from 'vitest';

export default {
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn()
};
