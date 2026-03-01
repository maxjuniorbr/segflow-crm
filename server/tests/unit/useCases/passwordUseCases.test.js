import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(),
        genSalt: vi.fn(),
        hash: vi.fn()
    }
}));

vi.mock('../../../src/infrastructure/repositories/userRepository.js', () => ({
    getUserPasswordById: vi.fn(),
    updateUserPassword: vi.fn()
}));

vi.mock('../../../src/infrastructure/repositories/refreshTokenRepository.js', () => ({
    deleteAllUserRefreshTokens: vi.fn()
}));

import bcrypt from 'bcryptjs';
import {
    getUserPasswordById,
    updateUserPassword
} from '../../../src/infrastructure/repositories/userRepository.js';
import { deleteAllUserRefreshTokens } from '../../../src/infrastructure/repositories/refreshTokenRepository.js';
import { changePasswordUseCase } from '../../../src/application/useCases/passwordUseCases.js';

const basePayload = {
    authenticatedUserId: '1',
    authenticatedBrokerId: 'bro-1',
    requestedUserId: '1',
    currentPassword: 'OldPassword1',
    newPassword: 'NewPassword1'
};

beforeEach(() => {
    vi.clearAllMocks();
});

describe('changePasswordUseCase', () => {
    it('returns 401 when authenticatedUserId is missing', async () => {
        const result = await changePasswordUseCase({ ...basePayload, authenticatedUserId: null });
        expect(result.status).toBe(401);
        expect(result.payload.error).toMatch(/não autenticado/i);
    });

    it('returns 401 when authenticatedBrokerId is missing', async () => {
        const result = await changePasswordUseCase({ ...basePayload, authenticatedBrokerId: null });
        expect(result.status).toBe(401);
    });

    it('returns 403 when user tries to change another users password', async () => {
        const result = await changePasswordUseCase({ ...basePayload, requestedUserId: '99' });
        expect(result.status).toBe(403);
        expect(result.payload.error).toMatch(/própria senha/i);
    });

    it('returns 400 when currentPassword is empty', async () => {
        const result = await changePasswordUseCase({ ...basePayload, currentPassword: '' });
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/obrigatórias/i);
    });

    it('returns 400 when newPassword is empty', async () => {
        const result = await changePasswordUseCase({ ...basePayload, newPassword: '' });
        expect(result.status).toBe(400);
    });

    it('returns 400 when newPassword equals currentPassword', async () => {
        const result = await changePasswordUseCase({
            ...basePayload,
            currentPassword: 'SamePassword1',
            newPassword: 'SamePassword1'
        });
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/diferente/i);
    });

    it('returns 400 when newPassword is too short', async () => {
        const result = await changePasswordUseCase({ ...basePayload, newPassword: 'Short1Aa' });
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/10 caracteres/i);
    });

    it('returns 400 when newPassword lacks uppercase', async () => {
        const result = await changePasswordUseCase({ ...basePayload, newPassword: 'alllowercase1' });
        expect(result.status).toBe(400);
    });

    it('returns 400 when newPassword lacks lowercase', async () => {
        const result = await changePasswordUseCase({ ...basePayload, newPassword: 'ALLUPPERCASE1' });
        expect(result.status).toBe(400);
    });

    it('returns 400 when newPassword lacks digit', async () => {
        const result = await changePasswordUseCase({ ...basePayload, newPassword: 'NoDigitsHere' });
        expect(result.status).toBe(400);
    });

    it('returns 404 when user not found in database', async () => {
        getUserPasswordById.mockResolvedValueOnce(null);
        const result = await changePasswordUseCase(basePayload);
        expect(result.status).toBe(404);
        expect(result.payload.error).toMatch(/não encontrado/i);
    });

    it('returns 400 when current password is incorrect', async () => {
        getUserPasswordById.mockResolvedValueOnce({ password: 'stored-hash' });
        bcrypt.compare.mockResolvedValueOnce(false);

        const result = await changePasswordUseCase(basePayload);
        expect(result.status).toBe(400);
        expect(result.payload.error).toMatch(/incorreta/i);
    });

    it('hashes and updates password on success', async () => {
        getUserPasswordById.mockResolvedValueOnce({ password: 'stored-hash' });
        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.genSalt.mockResolvedValueOnce('salt');
        bcrypt.hash.mockResolvedValueOnce('new-hash');
        updateUserPassword.mockResolvedValueOnce();
        deleteAllUserRefreshTokens.mockResolvedValueOnce();

        const result = await changePasswordUseCase(basePayload);

        expect(result.status).toBe(200);
        expect(result.payload.message).toMatch(/alterada/i);
        expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
        expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword1', 'salt');
        expect(updateUserPassword).toHaveBeenCalledWith({
            id: '1',
            brokerId: 'bro-1',
            password: 'new-hash'
        });
    });

    it('invalidates all refresh tokens after password change', async () => {
        getUserPasswordById.mockResolvedValueOnce({ password: 'stored-hash' });
        bcrypt.compare.mockResolvedValueOnce(true);
        bcrypt.genSalt.mockResolvedValueOnce('salt');
        bcrypt.hash.mockResolvedValueOnce('new-hash');
        updateUserPassword.mockResolvedValueOnce();
        deleteAllUserRefreshTokens.mockResolvedValueOnce();

        await changePasswordUseCase(basePayload);

        expect(deleteAllUserRefreshTokens).toHaveBeenCalledWith('1');
    });
});
