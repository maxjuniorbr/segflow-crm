import { buildMessageResponse } from '../dto/responseDto.js';
import { registerUser, loginUser, validateUser } from '../useCases/authUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

const isDevelopment = process.env.NODE_ENV === 'development';

const buildCookieBaseOptions = () => ({
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'strict',
    path: '/'
});

const authCookieOptions = () => ({
    ...buildCookieBaseOptions(),
    maxAge: 60 * 60 * 1000 // 1 hour
});


export const register = async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'register' });
    }
};

export const login = async (req, res) => {
    try {
        const result = await loginUser(req.body);
        if (result.payload?.error) {
            return res.status(result.status).json(result.payload);
        }

        res.cookie('segflow_token', result.token, authCookieOptions());
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'login' });
    }
};

export const validate = async (req, res) => {
    try {
        const result = await validateUser(req.user.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'validate' });
    }
};

export const logout = (req, res) => {
    res.clearCookie('segflow_token', buildCookieBaseOptions());
    res.json(buildMessageResponse('Sessão encerrada'));
};
