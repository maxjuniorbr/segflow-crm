import express from 'express';
import rateLimit from 'express-rate-limit';
import pool from '../config/db.js';
import { registerBroker, login, validate as validateToken, logout, refresh } from '../controllers/authController.js';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { changePassword } from '../controllers/passwordController.js';
import { getBrokers, getBrokerById, createBroker, updateBroker, deleteBroker } from '../controllers/brokerController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authMiddleware, validate } from '../middleware/index.js';
import {
    registerBrokerSchema,
    loginSchema,
    changePasswordSchema,
    clientSchema,
    clientListQuerySchema,
    documentSchema,
    documentListQuerySchema,
    userSchema,
    userListQuerySchema,
    brokerSchema,
    brokerListQuerySchema,
    idParamSchema,
    userIdParamSchema
} from '../schemas/index.js';

const router = express.Router();

import { isTest as isTestEnv, isDevelopment } from '../src/config/env.js';
const isStressTestMode = isTestEnv || (isDevelopment && process.env.STRESS_TEST_MODE === 'true');

const noOpMiddleware = (req, res, next) => next();

const authLimiter = isStressTestMode ? noOpMiddleware : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente mais tarde.' }
});

const writeLimiter = isStressTestMode ? noOpMiddleware : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

const readLimiter = isStressTestMode ? noOpMiddleware : rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});


router.get('/health', async (_req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok' });
    } catch {
        res.status(503).json({ status: 'degraded', db: 'unreachable' });
    }
});

router.post('/register-broker', authLimiter, validate(registerBrokerSchema), registerBroker);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/auth/validate', authMiddleware, readLimiter, validateToken);
router.post('/auth/refresh', authLimiter, refresh);
router.post('/auth/logout', authLimiter, logout);

router.get('/clients', authMiddleware, readLimiter, validate(clientListQuerySchema, { target: 'query' }), getClients);
router.get('/clients/:id', authMiddleware, readLimiter, validate(idParamSchema, { target: 'params' }), getClientById);
router.post('/clients', authMiddleware, writeLimiter, validate(clientSchema), createClient);
router.put(
    '/clients/:id',
    authMiddleware,
    writeLimiter,
    validate(idParamSchema, { target: 'params' }),
    validate(clientSchema),
    updateClient
);
router.delete('/clients/:id', authMiddleware, writeLimiter, validate(idParamSchema, { target: 'params' }), deleteClient);

router.get('/documents', authMiddleware, readLimiter, validate(documentListQuerySchema, { target: 'query' }), getDocuments);
router.get('/documents/:id', authMiddleware, readLimiter, validate(idParamSchema, { target: 'params' }), getDocumentById);
router.post('/documents', authMiddleware, writeLimiter, validate(documentSchema), createDocument);
router.put(
    '/documents/:id',
    authMiddleware,
    writeLimiter,
    validate(idParamSchema, { target: 'params' }),
    validate(documentSchema),
    updateDocument
);
router.delete('/documents/:id', authMiddleware, writeLimiter, validate(idParamSchema, { target: 'params' }), deleteDocument);

router.get('/brokers', authMiddleware, readLimiter, validate(brokerListQuerySchema, { target: 'query' }), getBrokers);
router.get('/brokers/:id', authMiddleware, readLimiter, validate(idParamSchema, { target: 'params' }), getBrokerById);
router.post('/brokers', authMiddleware, writeLimiter, validate(brokerSchema), createBroker);
router.put(
    '/brokers/:id',
    authMiddleware,
    writeLimiter,
    validate(idParamSchema, { target: 'params' }),
    validate(brokerSchema),
    updateBroker
);
router.delete('/brokers/:id', authMiddleware, writeLimiter, validate(idParamSchema, { target: 'params' }), deleteBroker);

router.get('/users', authMiddleware, readLimiter, validate(userListQuerySchema, { target: 'query' }), getUsers);
router.get('/users/:id', authMiddleware, readLimiter, validate(userIdParamSchema, { target: 'params' }), getUserById);
router.put(
    '/users/:id',
    authMiddleware,
    writeLimiter,
    validate(userIdParamSchema, { target: 'params' }),
    validate(userSchema),
    updateUser
);
router.put(
    '/users/:id/password',
    authMiddleware,
    writeLimiter,
    validate(userIdParamSchema, { target: 'params' }),
    validate(changePasswordSchema),
    changePassword
);
router.delete('/users/:id', authMiddleware, writeLimiter, validate(userIdParamSchema, { target: 'params' }), deleteUser);

router.get('/dashboard/stats', authMiddleware, readLimiter, getDashboardStats);

export default router;
