import {
    listClients,
    getClientByIdUseCase,
    createClientUseCase,
    updateClientUseCase,
    deleteClientUseCase
} from '../useCases/clientUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const getClients = async (req, res) => {
    try {
        const result = await listClients();
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getClients' });
    }
};

export const getClientById = async (req, res) => {
    try {
        const result = await getClientByIdUseCase(req.params.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getClientById' });
    }
};

export const createClient = async (req, res) => {
    try {
        const result = await createClientUseCase(req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'createClient' });
    }
};

export const updateClient = async (req, res) => {
    try {
        const result = await updateClientUseCase(req.params.id, req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'updateClient' });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const result = await deleteClientUseCase(req.params.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'deleteClient' });
    }
};
