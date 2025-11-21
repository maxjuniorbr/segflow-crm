import express from 'express';
import { register, login } from '../controllers/authController.js';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { authMiddleware, validate } from '../middleware/index.js';
import { registerSchema, loginSchema, clientSchema, documentSchema } from '../schemas/index.js';

const router = express.Router();

// Auth
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Clients
router.get('/clients', authMiddleware, getClients);
router.get('/clients/:id', authMiddleware, getClientById);
router.post('/clients', authMiddleware, validate(clientSchema), createClient);
router.put('/clients/:id', authMiddleware, validate(clientSchema), updateClient);
router.delete('/clients/:id', authMiddleware, deleteClient);

// Documents
router.get('/documents', authMiddleware, getDocuments);
router.post('/documents', authMiddleware, validate(documentSchema), createDocument);
router.put('/documents/:id', authMiddleware, validate(documentSchema), updateDocument);
router.delete('/documents/:id', authMiddleware, deleteDocument);

export default router;
