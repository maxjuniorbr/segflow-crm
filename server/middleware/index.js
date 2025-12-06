import jwt from 'jsonwebtoken';

const parseCookies = (cookieHeader = '') => {
    return cookieHeader.split(';').reduce((acc, cookie) => {
        const [rawName, ...rawValue] = cookie.trim().split('=');
        if (!rawName) {
            return acc;
        }
        acc[rawName] = rawValue.join('=');
        return acc;
    }, {});
};

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        } catch (err) {
            return res.status(400).json({ error: err.errors });
        }
    };
};
