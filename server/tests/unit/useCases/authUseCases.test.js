import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('crypto', () => ({
    randomUUID: vi.fn(() => 'test-uuid'),
    createHash: vi.fn(() => ({
        update: vi.fn(() => ({
            digest: vi.fn(() => 'hashed-token')
        }))
    }))
}));

vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn()
    }
}));

vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(() => 'access-token'),
        verify: vi.fn()
    }
}));

vi.mock('../../../config/db.js', () => ({
    default: {
        query: vi.fn(),
        connect: vi.fn()
    }
}));

vi.mock('../../../src/config/env.js', () => ({
    jwtSecret: 'test-jwt-secret'
}));

vi.mock('../../../src/infrastructure/repositories/userRepository.js', () => ({
    findUserByEmail: vi.fn(),
    findUserByCpf: vi.fn(),
    createUser: vi.fn(),
    findUserById: vi.fn(),
    findUserByIdMinimal: vi.fn(),
    findUserByCpfExcludingId: vi.fn()
}));

vi.mock('../../../src/infrastructure/repositories/refreshTokenRepository.js', () => ({
    createRefreshToken: vi.fn(),
    deleteRefreshToken: vi.fn(),
    revokeRefreshTokenByHash: vi.fn(),
    isTokenRevoked: vi.fn(),
    deleteAllUserRefreshTokens: vi.fn()
}));

vi.mock('../../../src/infrastructure/repositories/brokerRepository.js', () => ({
    findBrokerByCnpj: vi.fn(),
    findBrokerBySusep: vi.fn(),
    createBroker: vi.fn()
}));

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../../config/db.js';
import {
    findUserByEmail,
    findUserByIdMinimal
} from '../../../src/infrastructure/repositories/userRepository.js';
import {
    createRefreshToken,
    deleteRefreshToken,
    revokeRefreshTokenByHash,
    isTokenRevoked,
    deleteAllUserRefreshTokens
} from '../../../src/infrastructure/repositories/refreshTokenRepository.js';
import {
    findBrokerByCnpj,
    findBrokerBySusep
} from '../../../src/infrastructure/repositories/brokerRepository.js';
import {
    loginUser,
    refreshAccessToken,
    registerBrokerWithAdmin,
    revokeRefreshToken
} from '../../../src/application/useCases/authUseCases.js';
import { UnauthorizedError } from '../../../src/application/errors/AppError.js';

const mockClient = {
    query: vi.fn(),
    release: vi.fn()
};

const sampleUser = {
    id: 'user-1',
    broker_id: 'broker-1',
    name: 'Test User',
    cpf: '12345678901',
    email: 'test@example.com',
    password: 'hashed-password',
    username: 'testuser'
};

beforeEach(() => {
    vi.clearAllMocks();
    mockClient.query.mockReset();
    mockClient.release.mockReset();
    pool.connect.mockResolvedValue(mockClient);
    jwt.sign.mockReturnValue('access-token');
});

describe('loginUser', () => {
    it('returns tokens on successful login', async () => {
        findUserByEmail.mockResolvedValueOnce(sampleUser);
        bcrypt.compare.mockResolvedValueOnce(true);
        createRefreshToken.mockResolvedValueOnce();

        const result = await loginUser({ email: 'test@example.com', password: 'password123' });

        expect(result.status).toBe(200);
        expect(result.token).toBe('access-token');
        expect(result.refreshToken).toBe('test-uuid');
        expect(result.payload.user.email).toBe('test@example.com');
        expect(result.payload.user.isAuthenticated).toBe(true);
        expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
        expect(createRefreshToken).toHaveBeenCalledWith('user-1', 'hashed-token', expect.any(Date));
    });

    it('throws UnauthorizedError when user not found (timing-safe)', async () => {
        findUserByEmail.mockResolvedValueOnce(null);
        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(loginUser({ email: 'missing@example.com', password: 'pass' }))
            .rejects.toThrow(UnauthorizedError);
        expect(bcrypt.compare).toHaveBeenCalled();
    });

    it('throws UnauthorizedError when password is wrong', async () => {
        findUserByEmail.mockResolvedValueOnce(sampleUser);
        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(loginUser({ email: 'test@example.com', password: 'wrong' }))
            .rejects.toThrow(UnauthorizedError);
    });
});

describe('refreshAccessToken', () => {
    it('throws UnauthorizedError when token is null', async () => {
        await expect(refreshAccessToken(null)).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when token does not exist', async () => {
        revokeRefreshTokenByHash.mockResolvedValueOnce(undefined);
        isTokenRevoked.mockResolvedValueOnce(undefined);

        await expect(refreshAccessToken('invalid-token')).rejects.toThrow(UnauthorizedError);
        expect(revokeRefreshTokenByHash).toHaveBeenCalledWith('hashed-token');
        expect(isTokenRevoked).toHaveBeenCalledWith('hashed-token');
        expect(deleteAllUserRefreshTokens).not.toHaveBeenCalled();
    });

    it('detects reuse and invalidates all user tokens', async () => {
        revokeRefreshTokenByHash.mockResolvedValueOnce(undefined);
        isTokenRevoked.mockResolvedValueOnce({ user_id: 'user-1' });

        await expect(refreshAccessToken('reused-token')).rejects.toThrow(UnauthorizedError);
        expect(deleteAllUserRefreshTokens).toHaveBeenCalledWith('user-1');
    });

    it('throws UnauthorizedError when token is expired', async () => {
        const pastDate = new Date(Date.now() - 10_000).toISOString();
        revokeRefreshTokenByHash.mockResolvedValueOnce({ user_id: 'user-1', expires_at: pastDate });

        await expect(refreshAccessToken('expired-token')).rejects.toThrow(UnauthorizedError);
    });

    it('throws UnauthorizedError when user not found', async () => {
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        revokeRefreshTokenByHash.mockResolvedValueOnce({ user_id: 'user-1', expires_at: futureDate });
        findUserByIdMinimal.mockResolvedValueOnce(null);

        await expect(refreshAccessToken('valid-token')).rejects.toThrow(UnauthorizedError);
    });

    it('returns new tokens on successful rotation', async () => {
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        revokeRefreshTokenByHash.mockResolvedValueOnce({ user_id: 'user-1', expires_at: futureDate });
        findUserByIdMinimal.mockResolvedValueOnce({ id: 'user-1', email: 'test@example.com', broker_id: 'broker-1' });
        createRefreshToken.mockResolvedValueOnce();

        const result = await refreshAccessToken('valid-token');

        expect(result.status).toBe(200);
        expect(result.token).toBe('access-token');
        expect(result.refreshToken).toBe('test-uuid');
        expect(result.payload.valid).toBe(true);
        expect(revokeRefreshTokenByHash).toHaveBeenCalledWith('hashed-token');
        expect(createRefreshToken).toHaveBeenCalledWith('user-1', 'hashed-token', expect.any(Date));
    });
});

describe('registerBrokerWithAdmin', () => {
    const validPayload = {
        corporateName: 'Corp Name',
        tradeName: 'Trade Name',
        cnpj: '12.345.678/0001-90',
        susepCode: 'SUS123',
        phone: '11999999999',
        mobile: '11999999998',
        email: 'broker@example.com',
        contactName: 'Contact',
        cpf: '123.456.789-00',
        password: 'password123'
    };

    it('registers broker and admin user successfully', async () => {
        findBrokerByCnpj.mockResolvedValueOnce(null);
        findBrokerBySusep.mockResolvedValueOnce(null);
        findUserByEmail.mockResolvedValueOnce(null);
        bcrypt.genSalt.mockResolvedValueOnce('salt');
        bcrypt.hash.mockResolvedValueOnce('hashed-pwd');
        mockClient.query.mockResolvedValue();

        const result = await registerBrokerWithAdmin(validPayload);

        expect(result.status).toBe(201);
        expect(result.payload.message).toBe('Corretora cadastrada com sucesso');
        expect(findBrokerByCnpj).toHaveBeenCalledWith('12345678000190');
        expect(findBrokerBySusep).toHaveBeenCalledWith('SUS123');
        expect(findUserByEmail).toHaveBeenCalledWith('broker@example.com');
        expect(pool.connect).toHaveBeenCalled();
        expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
        expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
        expect(mockClient.release).toHaveBeenCalled();
    });

    it('returns 400 when CNPJ is already registered', async () => {
        findBrokerByCnpj.mockResolvedValueOnce({ id: 'existing' });

        const result = await registerBrokerWithAdmin(validPayload);

        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('cnpj');
        expect(pool.connect).not.toHaveBeenCalled();
    });

    it('returns 400 when email is already registered', async () => {
        findBrokerByCnpj.mockResolvedValueOnce(null);
        findBrokerBySusep.mockResolvedValueOnce(null);
        findUserByEmail.mockResolvedValueOnce({ id: 'existing' });

        const result = await registerBrokerWithAdmin(validPayload);

        expect(result.status).toBe(400);
        expect(result.payload.error[0].path).toContain('email');
        expect(pool.connect).not.toHaveBeenCalled();
    });
});

describe('revokeRefreshToken', () => {
    it('revokes token and deletes all user sessions when token found', async () => {
        revokeRefreshTokenByHash.mockResolvedValueOnce({ user_id: 'user-1' });
        deleteAllUserRefreshTokens.mockResolvedValueOnce();

        await revokeRefreshToken('raw-token');

        expect(revokeRefreshTokenByHash).toHaveBeenCalledWith('hashed-token');
        expect(deleteAllUserRefreshTokens).toHaveBeenCalledWith('user-1');
    });

    it('falls back to deleteRefreshToken when token not found (already revoked)', async () => {
        revokeRefreshTokenByHash.mockResolvedValueOnce(undefined);
        deleteRefreshToken.mockResolvedValueOnce();

        await revokeRefreshToken('raw-token');

        expect(deleteRefreshToken).toHaveBeenCalledWith('hashed-token');
        expect(deleteAllUserRefreshTokens).not.toHaveBeenCalled();
    });

    it('does nothing when token is empty', async () => {
        await revokeRefreshToken('');
        expect(revokeRefreshTokenByHash).not.toHaveBeenCalled();

        await revokeRefreshToken(null);
        expect(revokeRefreshTokenByHash).not.toHaveBeenCalled();
    });
});
