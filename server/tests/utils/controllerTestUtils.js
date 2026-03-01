import { vi } from 'vitest';

export const createRes = () => ({
    statusCode: 200,
    payload: null,
    cookies: [],
    clearedCookies: [],
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.payload = data;
        return this;
    },
    cookie(name, value, options) {
        this.cookies.push({ name, value, options });
        return this;
    },
    clearCookie(name, options) {
        this.clearedCookies.push({ name, options });
        return this;
    }
});

export const createReq = (overrides = {}) => ({
    query: {},
    params: {},
    body: {},
    user: { id: 1, brokerId: 'bro-test' },
    ...overrides
});

export const resetControllerMocks = (pool, bcrypt) => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
};
