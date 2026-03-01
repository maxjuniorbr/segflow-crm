import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { randomUUID } from 'crypto';
import routes from '../routes/index.js';
import { isDevelopment, isTest, corsAllowedOrigins } from './config/env.js';
import { AppError } from './application/errors/AppError.js';

const app = express();

if (!isDevelopment && !isTest) {
    app.set('trust proxy', 1);
}

app.use(helmet());
app.use(compression());

const allowedOrigins = corsAllowedOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

// Returns true for no-origin requests (server-to-server, mobile, curl).
// CORS is a browser mechanism; non-browser clients bypass it regardless.
const isAllowedOrigin = (origin = '') => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    return false;
};

app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }
        return callback(new AppError('Not allowed by CORS', 403));
    },
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    req.id = randomUUID();
    res.setHeader('X-Request-Id', req.id);
    next();
});

if (isDevelopment) {
    app.use('/api', (req, res, next) => {
        console.log(`Request ${req.method} ${req.path}`);
        next();
    });
}

app.use('/api', routes);

app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((_req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' });
    }
    const status = err.statusCode || err.status || 500;
    const message = (isDevelopment || isTest) ? err.message : 'Internal server error';
    console.error(`Unhandled error [${req?.id}]:`, err);
    res.status(status).json({ error: message });
});

export default app;
