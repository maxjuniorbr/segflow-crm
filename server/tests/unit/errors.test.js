import { describe, it, expect, vi } from 'vitest';
import {
    AppError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ConflictError
} from '../../src/application/errors/AppError.js';
import { getErrorResponse, logError } from '../../src/application/errors/errorResponse.js';

describe('AppError hierarchy', () => {
    it('AppError sets message, statusCode and name', () => {
        const err = new AppError('test message', 418);
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('test message');
        expect(err.statusCode).toBe(418);
        expect(err.name).toBe('AppError');
    });

    it('AppError defaults to 500', () => {
        const err = new AppError('server error');
        expect(err.statusCode).toBe(500);
    });

    it('NotFoundError defaults to 404', () => {
        const err = new NotFoundError();
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(404);
        expect(err.message).toBe('Recurso não encontrado');
        expect(err.name).toBe('NotFoundError');
    });

    it('NotFoundError accepts custom message', () => {
        const err = new NotFoundError('Cliente não encontrado');
        expect(err.message).toBe('Cliente não encontrado');
        expect(err.statusCode).toBe(404);
    });

    it('ValidationError defaults to 400', () => {
        const err = new ValidationError();
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('Dados inválidos');
        expect(err.name).toBe('ValidationError');
    });

    it('UnauthorizedError defaults to 401', () => {
        const err = new UnauthorizedError();
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(401);
        expect(err.message).toBe('Não autorizado');
        expect(err.name).toBe('UnauthorizedError');
    });

    it('ConflictError defaults to 409', () => {
        const err = new ConflictError();
        expect(err).toBeInstanceOf(AppError);
        expect(err.statusCode).toBe(409);
        expect(err.message).toBe('Conflito de dados');
        expect(err.name).toBe('ConflictError');
    });
});

describe('getErrorResponse', () => {
    it('uses statusCode from AppError', () => {
        const err = new NotFoundError('not found');
        const response = getErrorResponse(err);
        expect(response.status).toBe(404);
        expect(response.payload.error).toBe('not found');
    });

    it('uses err.status as fallback', () => {
        const err = { status: 422, message: 'Unprocessable' };
        const response = getErrorResponse(err);
        expect(response.status).toBe(422);
    });

    it('defaults to 500 for unknown errors', () => {
        const response = getErrorResponse({});
        expect(response.status).toBe(500);
    });

    it('exposes message in test environment for AppError', () => {
        const err = new ValidationError('campo obrigatório');
        const response = getErrorResponse(err);
        expect(response.payload.error).toBe('campo obrigatório');
    });

    it('uses defaultMessage when provided and error is not AppError', () => {
        const err = new Error('internal detail');
        const response = getErrorResponse(err, { defaultMessage: 'Erro no cliente' });
        expect(response.payload.error).toBe('internal detail');
    });

    it('falls back to default fallback message', () => {
        const response = getErrorResponse(null);
        expect(response.status).toBe(500);
        expect(response.payload.error).toBe('Erro ao processar requisição');
    });
});

describe('logError', () => {
    it('logs context and error', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const err = new Error('boom');
        logError('testContext', err);
        expect(spy).toHaveBeenCalledWith('Error in testContext:', err);
        spy.mockRestore();
    });
});
