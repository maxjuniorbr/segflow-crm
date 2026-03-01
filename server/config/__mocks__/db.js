import { vi } from 'vitest';

const queryFn = vi.fn();

export default {
    query: queryFn,
    connect: vi.fn().mockResolvedValue({
        query: queryFn,
        release: vi.fn(),
    })
};
