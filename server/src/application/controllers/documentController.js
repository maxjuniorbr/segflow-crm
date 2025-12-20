import {
    listDocuments,
    getDocumentByIdUseCase,
    createDocumentUseCase,
    updateDocumentUseCase,
    deleteDocumentUseCase
} from '../useCases/documentUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const getDocuments = async (req, res) => {
    try {
        const result = await listDocuments(req.query);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getDocuments' });
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const result = await getDocumentByIdUseCase(req.params.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getDocumentById' });
    }
};

export const createDocument = async (req, res) => {
    try {
        const result = await createDocumentUseCase(req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'createDocument' });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const result = await updateDocumentUseCase(req.params.id, req.body);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'updateDocument' });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const result = await deleteDocumentUseCase(req.params.id);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'deleteDocument' });
    }
};
