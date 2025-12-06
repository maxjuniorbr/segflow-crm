import express from 'express';
import { register, login, validate as validateToken, logout } from '../controllers/authController.js';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { getDocuments, getDocumentById, createDocument, updateDocument, deleteDocument } from '../controllers/documentController.js';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { changePassword } from '../controllers/passwordController.js';
import { authMiddleware, validate } from '../middleware/index.js';
import { registerSchema, loginSchema, clientSchema, documentSchema, userSchema } from '../schemas/index.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/auth/validate', authMiddleware, validateToken);
router.post('/logout', logout);

router.get('/clients', authMiddleware, getClients);
router.get('/clients/:id', authMiddleware, getClientById);
router.post('/clients', authMiddleware, validate(clientSchema), createClient);
router.put('/clients/:id', authMiddleware, validate(clientSchema), updateClient);
router.delete('/clients/:id', authMiddleware, deleteClient);

router.get('/documents', authMiddleware, getDocuments);
router.get('/documents/:id', authMiddleware, getDocumentById);
router.post('/documents', authMiddleware, validate(documentSchema), createDocument);
router.put('/documents/:id', authMiddleware, validate(documentSchema), updateDocument);
router.delete('/documents/:id', authMiddleware, deleteDocument);

router.get('/users', authMiddleware, getUsers);
router.get('/users/:id', authMiddleware, getUserById);
router.put('/users/:id', authMiddleware, validate(userSchema), updateUser);
router.put('/users/:id/password', authMiddleware, changePassword);
router.delete('/users/:id', authMiddleware, deleteUser);

export default router;
