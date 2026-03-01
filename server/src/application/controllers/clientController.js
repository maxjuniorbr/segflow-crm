import {
    listClients,
    getClientByIdUseCase,
    createClientUseCase,
    updateClientUseCase,
    deleteClientUseCase
} from '../useCases/clientUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

/**
 * @typedef {import('express').Request & { user: { brokerId: string } }} AuthenticatedRequest
 */

/**
 * Lista clientes da corretora autenticada.
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 */
export const getClients = async (req, res) => {
    try {
        const result = await listClients({ ...req.query, brokerId: req.user.brokerId });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getClients' });
    }
};

/**
 * Busca cliente por ID.
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 */
export const getClientById = async (req, res) => {
    try {
        const result = await getClientByIdUseCase(req.params.id, req.user.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getClientById' });
    }
};

/**
 * Cria um novo cliente.
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 */
export const createClient = async (req, res) => {
    try {
        const result = await createClientUseCase({ ...req.body, brokerId: req.user.brokerId });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'createClient' });
    }
};

/**
 * Atualiza um cliente existente.
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 */
export const updateClient = async (req, res) => {
    try {
        const result = await updateClientUseCase(req.params.id, { ...req.body, brokerId: req.user.brokerId });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'updateClient' });
    }
};

/**
 * Remove um cliente por ID.
 * @param {AuthenticatedRequest} req
 * @param {import('express').Response} res
 */
export const deleteClient = async (req, res) => {
    try {
        const result = await deleteClientUseCase(req.params.id, req.user.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'deleteClient' });
    }
};
