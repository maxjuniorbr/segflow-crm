import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../routes/index.js';
import { isDevelopment, corsAllowedOrigins } from './config/env.js';

const app = express();

app.use(helmet());

const allowedOrigins = corsAllowedOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

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
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());

if (isDevelopment) {
    app.use('/api', (req, res, next) => {
        console.log(`Request ${req.method} ${req.path}`);
        next();
    });
}

app.use('/api', routes);

export default app;
