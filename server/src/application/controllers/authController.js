import { buildMessageResponse } from '../dto/responseDto.js';
import { loginUser, validateUser, registerBrokerWithAdmin, refreshAccessToken, revokeRefreshToken } from '../useCases/authUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';
import { parseCookies } from '../utils/parseCookies.js';
import { isDevelopment, isTest } from '../../config/env.js';

const buildCookieBaseOptions = () => ({
    httpOnly: true,
    secure: !isDevelopment && !isTest,
    sameSite: 'strict',
    path: '/'
});

const accessCookieOptions = () => ({
    ...buildCookieBaseOptions(),
    maxAge: 15 * 60 * 1000
});

const refreshCookieOptions = () => ({
    ...buildCookieBaseOptions(),
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000
});

export const registerBroker = async (req, res) => {
    try {
        const result = await registerBrokerWithAdmin(req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'registerBroker' });
    }
};

export const login = async (req, res) => {
    try {
        const result = await loginUser(req.body);

        res.cookie('segflow_token', result.token, accessCookieOptions());
        res.cookie('segflow_refresh', result.refreshToken, refreshCookieOptions());
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'login' });
    }
};

export const refresh = async (req, res) => {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const refreshTokenRaw = cookies.segflow_refresh;

        const result = await refreshAccessToken(refreshTokenRaw);

        res.cookie('segflow_token', result.token, accessCookieOptions());
        if (result.refreshToken) {
            res.cookie('segflow_refresh', result.refreshToken, refreshCookieOptions());
        }
        res.status(200).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'refresh' });
    }
};

export const validate = async (req, res) => {
    try {
        const result = await validateUser(req.user.id, req.user.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'validate' });
    }
};

export const logout = async (req, res) => {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const refreshTokenRaw = cookies.segflow_refresh;
        if (refreshTokenRaw) {
            await revokeRefreshToken(refreshTokenRaw);
        }
    } catch (_err) {
        // Best-effort revocation
    }
    res.clearCookie('segflow_token', buildCookieBaseOptions());
    res.clearCookie('segflow_refresh', { ...buildCookieBaseOptions(), path: '/api/auth' });
    res.json(buildMessageResponse('Sessão encerrada'));
};
