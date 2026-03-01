import {
    listBrokers,
    getBrokerByIdUseCase,
    createBrokerUseCase,
    updateBrokerUseCase,
    deleteBrokerUseCase
} from '../useCases/brokerUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const getBrokers = async (req, res) => {
    try {
        const result = await listBrokers(req.user?.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getBrokers' });
    }
};

export const getBrokerById = async (req, res) => {
    try {
        const result = await getBrokerByIdUseCase(req.params.id, req.user?.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getBrokerById' });
    }
};

export const createBroker = async (req, res) => {
    try {
        const result = await createBrokerUseCase(req.body, req.user?.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'createBroker' });
    }
};

export const updateBroker = async (req, res) => {
    try {
        const result = await updateBrokerUseCase(req.params.id, req.body, req.user?.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'updateBroker' });
    }
};

export const deleteBroker = async (req, res) => {
    try {
        const result = await deleteBrokerUseCase(req.params.id, req.user?.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'deleteBroker' });
    }
};
