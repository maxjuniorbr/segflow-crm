import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.RENDER_EXTERNAL_URL
].filter(Boolean);

const isAllowedOrigin = (origin = '') => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.endsWith('.onrender.com')) return true;
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

if (process.env.NODE_ENV !== 'production') {
    app.use('/api', (req, res, next) => {
        console.log(`Request ${req.method} ${req.path}`);
        next();
    });
}

app.use('/api', routes);

if (process.env.NODE_ENV !== 'test') {
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
