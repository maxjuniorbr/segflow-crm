import jwt from 'jsonwebtoken';
import { jwtSecret } from '../src/config/env.js';
import { parseCookies } from '../src/application/utils/parseCookies.js';

const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    if (req.headers.cookie) {
        const cookies = parseCookies(req.headers.cookie);
        return cookies.segflow_token;
    }
    return null;
};

export const authMiddleware = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }
    try {
        if (!jwtSecret) return res.status(500).json({ error: 'JWT_SECRET is not configured' });
        const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

export const validate = (schema, { target = 'body' } = {}) => {
    return (req, res, next) => {
        try {
            const parsed = schema.parse(req[target]);
            if (parsed !== undefined) {
                req[target] = parsed;
            }
            next();
        } catch (err) {
            const details = err.errors?.map(e => ({ path: e.path, message: e.message }));
            return res.status(400).json({ error: 'Dados de entrada inválidos', details });
        }
    };
};
