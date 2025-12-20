import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, validate as validateToken, logout } from '../controllers/authController.js';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { changePassword } from '../controllers/passwordController.js';
import { getBrokers, getBrokerById, createBroker, updateBroker, deleteBroker } from '../controllers/brokerController.js';
import { authMiddleware, validate } from '../middleware/index.js';
import { registerSchema, loginSchema, clientSchema, documentSchema, documentListQuerySchema, userSchema, brokerSchema } from '../schemas/index.js';

const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Tente novamente mais tarde.' }
});

const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/auth/validate', authMiddleware, validateToken);
router.post('/logout', logout);

router.get('/clients', authMiddleware, getClients);
router.get('/clients/:id', authMiddleware, getClientById);
router.post('/clients', authMiddleware, writeLimiter, validate(clientSchema), createClient);
router.put('/clients/:id', authMiddleware, writeLimiter, validate(clientSchema), updateClient);
router.delete('/clients/:id', authMiddleware, writeLimiter, deleteClient);

router.get('/documents', authMiddleware, validate(documentListQuerySchema, { target: 'query' }), getDocuments);
router.get('/documents/:id', authMiddleware, getDocumentById);
router.post('/documents', authMiddleware, writeLimiter, validate(documentSchema), createDocument);
router.put('/documents/:id', authMiddleware, writeLimiter, validate(documentSchema), updateDocument);
router.delete('/documents/:id', authMiddleware, writeLimiter, deleteDocument);

router.get('/brokers', authMiddleware, getBrokers);
router.get('/brokers/:id', authMiddleware, getBrokerById);
router.post('/brokers', authMiddleware, writeLimiter, validate(brokerSchema), createBroker);
router.put('/brokers/:id', authMiddleware, writeLimiter, validate(brokerSchema), updateBroker);
router.delete('/brokers/:id', authMiddleware, writeLimiter, deleteBroker);

router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', authMiddleware, writeLimiter, validate(userSchema), updateUser);
router.put('/users/:id/password', authMiddleware, writeLimiter, changePassword);
router.delete('/users/:id', authMiddleware, writeLimiter, deleteUser);

export default router;
