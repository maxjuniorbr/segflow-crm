import {
    listUsers,
    getUserByIdUseCase,
    updateUserUseCase,
    deleteUserUseCase
} from '../useCases/userUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const getUsers = async (req, res) => {
    try {
        const result = await listUsers(req.user.brokerId, { limit: req.query?.limit });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getUsers' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const result = await getUserByIdUseCase(req.params.id, req.user.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getUserById' });
    }
};

export const updateUser = async (req, res) => {
    try {
        const result = await updateUserUseCase(req.params.id, { ...req.body, brokerId: req.user.brokerId });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'updateUser' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const result = await deleteUserUseCase(req.params.id, req.user.brokerId, req.user.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'deleteUser' });
    }
};
