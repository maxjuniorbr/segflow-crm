// @ts-check
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';
import { buildAuthResponse, buildAuthUser } from '../dto/authDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import { UnauthorizedError } from '../errors/AppError.js';
import pool from '../../../config/db.js';
import { jwtSecret } from '../../config/env.js';
import {
    findUserByEmail,
    findUserById,
    findUserByIdMinimal
} from '../../infrastructure/repositories/userRepository.js';
import {
    findBrokerByCnpj,
    findBrokerBySusep,
    createBroker
} from '../../infrastructure/repositories/brokerRepository.js';
import {
    createRefreshToken,
    deleteRefreshToken,
    revokeRefreshTokenByHash,
    isTokenRevoked,
    deleteAllUserRefreshTokens
} from '../../infrastructure/repositories/refreshTokenRepository.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const DUMMY_HASH = '$2b$12$LJ3m4ys3Lk0TSwH0NC8xbeGn0KKGEB3gYK7txYxE.YVsVPnweBwO6';

const getJwtSecret = () => {
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
    return jwtSecret;
};

/**
 * @param {import('../../types.js').AuthLoginPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult & { token?: string, refreshToken?: string }>}
 */
export const loginUser = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) {
        await bcrypt.compare(password, DUMMY_HASH);
        throw new UnauthorizedError('Credenciais inválidas');
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
        throw new UnauthorizedError('Credenciais inválidas');
    }

    const accessToken = jwt.sign(
        { id: user.id, email: user.email, brokerId: user.broker_id },
        getJwtSecret(),
        { expiresIn: '15m', algorithm: 'HS256' }
    );

    const refreshTokenRaw = randomUUID();
    const refreshTokenHash = hashToken(refreshTokenRaw);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createRefreshToken(user.id, refreshTokenHash, expiresAt);

    return {
        status: 200,
        payload: buildAuthResponse(user),
        token: accessToken,
        refreshToken: refreshTokenRaw
    };
};

/**
 * @param {string} refreshTokenRaw
 * @returns {Promise<import('../../types.js').UseCaseResult & { token?: string, refreshToken?: string }>}
 */
export const refreshAccessToken = async (refreshTokenRaw) => {
    if (!refreshTokenRaw) {
        throw new UnauthorizedError('Refresh token não fornecido');
    }

    const tokenHash = hashToken(refreshTokenRaw);

    const stored = await revokeRefreshTokenByHash(tokenHash);

    if (!stored) {
        const revoked = await isTokenRevoked(tokenHash);
        if (revoked) {
            await deleteAllUserRefreshTokens(revoked.user_id);
        }
        throw new UnauthorizedError('Refresh token inválido');
    }

    if (new Date(stored.expires_at) < new Date()) {
        throw new UnauthorizedError('Refresh token expirado');
    }

    const user = await findUserByIdMinimal(stored.user_id);
    if (!user) {
        throw new UnauthorizedError('Usuário não encontrado');
    }

    const newRefreshTokenRaw = randomUUID();
    const newRefreshTokenHash = hashToken(newRefreshTokenRaw);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await createRefreshToken(user.id, newRefreshTokenHash, expiresAt);

    const accessToken = jwt.sign(
        { id: user.id, email: user.email, brokerId: user.broker_id },
        getJwtSecret(),
        { expiresIn: '15m', algorithm: 'HS256' }
    );

    return { status: 200, payload: { valid: true }, token: accessToken, refreshToken: newRefreshTokenRaw };
};

/**
 * @param {string} refreshTokenRaw
 * @returns {Promise<void>}
 */
export const revokeRefreshToken = async (refreshTokenRaw) => {
    if (!refreshTokenRaw) return;
    const tokenHash = hashToken(refreshTokenRaw);
    const stored = await revokeRefreshTokenByHash(tokenHash);
    if (stored) {
        await deleteAllUserRefreshTokens(stored.user_id);
    } else {
        await deleteRefreshToken(tokenHash);
    }
};

/**
 * @param {number|string} userId
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const validateUser = async (userId, brokerId) => {
    const user = await findUserById(userId, brokerId);
    if (!user) {
        return { status: 401, payload: { valid: false, error: 'Usuário não encontrado' } };
    }

    return { status: 200, payload: { valid: true, user: buildAuthUser(user) } };
};

/**
 * @param {import('../../types.js').RegisterBrokerPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const registerBrokerWithAdmin = async (payload) => {
    const {
        corporateName,
        tradeName,
        cnpj,
        susepCode,
        phone,
        mobile,
        email,
        contactName,
        cpf,
        password
    } = payload;

    // Validate unique broker CNPJ
    const cnpjClean = cnpj.replace(/[^\d]/g, '');
    const cnpjCheck = await findBrokerByCnpj(cnpjClean);
    if (cnpjCheck) {
        return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
    }

    // Validate unique broker SUSEP code
    if (susepCode && susepCode.trim() !== '') {
        const susepCheck = await findBrokerBySusep(susepCode.trim());
        if (susepCheck) {
            return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
        }
    }

    // Validate unique user email (same as broker email)
    const emailCheck = await findUserByEmail(email);
    if (emailCheck) {
        return { status: 400, payload: { error: [{ path: ['email'], message: 'Email já cadastrado' }] } };
    }

    const cpfClean = cpf.replace(/[^\d]/g, '');
    const brokerId = randomUUID();

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email.split('@')[0];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(
            'INSERT INTO brokers (id, corporate_name, trade_name, cnpj, susep_code, contact_name, email, phone, mobile) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [brokerId, corporateName, tradeName, cnpjClean, susepCode ? susepCode.trim() : null, contactName, email, phone || null, mobile || null]
        );

        await client.query(
            'INSERT INTO users (broker_id, name, cpf, email, password, username) VALUES ($1, $2, $3, $4, $5, $6)',
            [brokerId, contactName, cpfClean, email, hashedPassword, username]
        );

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        if (err.code === '23505') {
            const detail = err.detail || '';
            if (detail.includes('cnpj')) return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
            if (detail.includes('susep_code')) return { status: 400, payload: { error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }] } };
            if (detail.includes('email')) return { status: 400, payload: { error: [{ path: ['email'], message: 'Email já cadastrado' }] } };
            if (detail.includes('cpf')) return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
            return { status: 400, payload: { error: [{ path: ['unknown'], message: 'Registro duplicado' }] } };
        }
        throw err;
    } finally {
        client.release();
    }

    return { status: 201, payload: buildMessageResponse('Corretora cadastrada com sucesso') };
};
