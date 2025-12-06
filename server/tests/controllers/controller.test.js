import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../config/db.js', () => ({
    default: {
        query: vi.fn()
    }
}));

vi.mock('bcryptjs', () => ({
    default: {
        genSalt: vi.fn(),
        hash: vi.fn(),
        compare: vi.fn()
    }
}));

import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

import {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} from '../../controllers/clientController.js';
import {
    getDocuments,
    getDocumentById,
    createDocument,
    updateDocument,
    deleteDocument
} from '../../controllers/documentController.js';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../../controllers/userController.js';
import { changePassword } from '../../controllers/passwordController.js';
import { register, login, validate, logout } from '../../controllers/authController.js';

const createRes = () => ({
    statusCode: 200,
    payload: null,
    cookies: [],
    clearedCookies: [],
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        this.payload = data;
        return this;
    },
    cookie(name, value, options) {
        this.cookies.push({ name, value, options });
        return this;
    },
    clearCookie(name, options) {
        this.clearedCookies.push({ name, options });
        return this;
    }
});

const sampleClientRow = {
    id: 'cli-1',
    name: 'João',
    persontype: 'Física',
    cpf: '123',
    cnpj: null,
    rg: '12',
    rgdispatchdate: null,
    rgissuer: null,
    birthdate: '1990-01-01',
    maritalstatus: 'Solteiro(a)',
    email: 'joao@example.com',
    phone: '11999999999',
    address: JSON.stringify({ city: 'SP' }),
    notes: null,
    createdat: '2024-01-01'
};

const sampleUserRow = {
    id: 1,
    name: 'Admin',
    cpf: '11122233344',
    email: 'admin@example.com',
    username: 'admin',
    password: 'hash',
    created_at: '2024-01-01'
};

const mockQuery = () => pool.query;

beforeEach(() => {
    vi.clearAllMocks();
    pool.query.mockReset();
    bcrypt.genSalt.mockReset();
    bcrypt.hash.mockReset();
    bcrypt.compare.mockReset();
});

describe('Client Controller', () => {
    it('returns clients list', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [sampleClientRow] });
        const res = createRes();
        await getClients({}, res);
        expect(res.payload[0].name).toBe('João');
        expect(querySpy).toHaveBeenCalled();
    });

    it('handles database errors in getClients', async () => {
        const querySpy = mockQuery().mockRejectedValueOnce(new Error('db error'));
        const res = createRes();
        await getClients({}, res);
        expect(res.statusCode).toBe(500);
        expect(res.payload.error).toContain('db error');
        expect(querySpy).toHaveBeenCalled();
    });

    it('returns 404 when client missing', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getClientById({ params: { id: 'missing' } }, res);
        expect(res.statusCode).toBe(404);
        expect(querySpy).toHaveBeenCalled();
    });

    it('creates client with unique identifiers', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await createClient({ body: { name: 'Novo', cpf: '123', cnpj: '', personType: 'Física' } }, res);
        expect(res.statusCode).toBe(201);
        expect(querySpy).toHaveBeenCalledTimes(2);
    });

    it('rejects duplicated CPF on create', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [{ id: 'dup' }] });
        const res = createRes();
        await createClient({ body: { name: 'Dup', cpf: '123', personType: 'Física' } }, res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error[0].message).toContain('CPF já cadastrado');
        expect(querySpy).toHaveBeenCalled();
    });

    it('updates client and validates duplicates', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await updateClient({ params: { id: 'cli-1' }, body: { name: 'Atualizado', cpf: '123' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.payload.message).toContain('atualizado');
    });

    it('prevents client deletion with active proposals', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [{ count: 2 }] });
        const res = createRes();
        await deleteClient({ params: { id: 'cli-1' } }, res);
        expect(res.statusCode).toBe(400);
    });

    it('deletes client when no proposals', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [{ count: 0 }] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await deleteClient({ params: { id: 'cli-1' } }, res);
        expect(res.statusCode).toBe(200);
        expect(res.payload.message).toBe('Cliente excluído');
    });
});

describe('Document Controller', () => {
    it('builds query with filters on getDocuments', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getDocuments({ query: { clientId: 'cli-1', status: 'Apólice', search: 'auto', limit: '5', offset: '2' } }, res);
        expect(querySpy).toHaveBeenCalled();
        expect(res.payload).toEqual([]);
        querySpy.mockRestore();
    });

    it('returns 500 when list fails', async () => {
        const querySpy = mockQuery().mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getDocuments({ query: {} }, res);
        expect(res.statusCode).toBe(500);
    });

    it('gets document by id and handles missing', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const resMissing = createRes();
        await getDocumentById({ params: { id: 'doc-1' } }, resMissing);
        expect(resMissing.statusCode).toBe(404);

        querySpy.mockResolvedValueOnce({ rows: [{ id: 'doc-1' }] });
        const res = createRes();
        await getDocumentById({ params: { id: 'doc-1' } }, res);
        expect(res.payload.id).toBe('doc-1');
    });

    it('creates document normalizing optional fields', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await createDocument({ body: { clientId: 'cli-1', type: 'Auto', company: 'XYZ', documentNumber: '', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice', attachmentName: '', notes: '' } }, res);
        expect(res.statusCode).toBe(201);
    });

    it('updates and deletes document', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const resUpdate = createRes();
        await updateDocument({ params: { id: 'doc-1' }, body: { clientId: 'cli-1', type: 'Auto', company: 'ABC', documentNumber: '', startDate: '2025-01-01', endDate: '2025-12-31', status: 'Apólice', attachmentName: '', notes: '' } }, resUpdate);
        expect(resUpdate.payload.message).toBe('Documento atualizado');

        querySpy.mockResolvedValueOnce({ rows: [] });
        const resDelete = createRes();
        await deleteDocument({ params: { id: 'doc-1' } }, resDelete);
        expect(resDelete.payload.message).toBe('Documento excluído');
    });
});

describe('User Controller', () => {
    const mockBcrypt = () => {
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        bcrypt.compare.mockResolvedValue(true);
    };

    it('returns user list without password', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [sampleUserRow] });
        const res = createRes();
        await getUsers({}, res);
        expect(res.payload[0].password).toBeUndefined();
    });

    it('handles errors when listing users', async () => {
        mockQuery().mockRejectedValueOnce(new Error('fail'));
        const res = createRes();
        await getUsers({}, res);
        expect(res.statusCode).toBe(500);
    });

    it('getUserById handles missing', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await getUserById({ params: { id: 1 } }, res);
        expect(res.statusCode).toBe(404);
        querySpy.mockRestore();
    });

    it('getUserById returns data when found', async () => {
        mockQuery().mockResolvedValueOnce({ rows: [sampleUserRow] });
        const res = createRes();
        await getUserById({ params: { id: 1 } }, res);
        expect(res.payload.id).toBe(sampleUserRow.id);
    });

    it('updates user with password change', async () => {
        mockBcrypt();
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const res = createRes();
        await updateUser({ params: { id: 1 }, body: { name: 'Novo', cpf: '11122233344', email: 'novo@example.com', password: 'Senha1234' } }, res);
        expect(res.payload.message).toContain('Usuário atualizado');
    });

    it('rejects duplicate email on update', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 2 }] });
        const res = createRes();
        await updateUser({ params: { id: 1 }, body: { name: 'Novo', cpf: '11122233344', email: 'dup@example.com' } }, res);
        expect(res.statusCode).toBe(400);
    });

    it('rejects duplicate CPF on update', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [{ id: 2 }] });
        const res = createRes();
        await updateUser({ params: { id: 1 }, body: { name: 'Novo', cpf: '111.222.333-44', email: 'novo@example.com' } }, res);
        expect(res.statusCode).toBe(400);
    });

    it('deletes user', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await deleteUser({ params: { id: 1 } }, res);
        expect(res.payload.message).toBe('Usuário excluído');
    });

    it('returns 500 when delete fails', async () => {
        mockQuery().mockRejectedValueOnce(new Error('db error'));
        const res = createRes();
        await deleteUser({ params: { id: 1 } }, res);
        expect(res.statusCode).toBe(500);
    });
});

describe('Password Controller', () => {
    const baseReq = {
        params: { id: '1' },
        body: { currentPassword: 'Senha123', newPassword: 'NovaSenha123' },
        user: { id: '1' }
    };

    it('rejects when user not authenticated', async () => {
        const res = createRes();
        await changePassword({ ...baseReq, user: null }, res);
        expect(res.statusCode).toBe(401);
    });

    it('rejects when user tries to change another account', async () => {
        const res = createRes();
        await changePassword({ ...baseReq, user: { id: '2' } }, res);
        expect(res.statusCode).toBe(403);
    });

    it('validates payload rules', async () => {
        const resMissing = createRes();
        await changePassword({ ...baseReq, body: { currentPassword: '', newPassword: '' } }, resMissing);
        expect(resMissing.statusCode).toBe(400);

        const resSame = createRes();
        await changePassword({ ...baseReq, body: { currentPassword: 'a', newPassword: 'a' } }, resSame);
        expect(resSame.statusCode).toBe(400);

        const resWeak = createRes();
        await changePassword({ ...baseReq, body: { currentPassword: 'a', newPassword: 'short' } }, resWeak);
        expect(resWeak.statusCode).toBe(400);
    });

    it('rejects when user not found or password invalid', async () => {
        const querySpy = mockQuery().mockResolvedValueOnce({ rows: [] });
        const resMissing = createRes();
        await changePassword(baseReq, resMissing);
        expect(resMissing.statusCode).toBe(404);

        querySpy.mockResolvedValueOnce({ rows: [{ password: 'hash' }] });
        bcrypt.compare.mockResolvedValueOnce(false);
        const resInvalid = createRes();
        await changePassword(baseReq, resInvalid);
        expect(resInvalid.statusCode).toBe(400);
    });

    it('changes password successfully', async () => {
        const querySpy = mockQuery()
            .mockResolvedValueOnce({ rows: [{ password: 'hash' }] })
            .mockResolvedValueOnce({ rows: [] });
        bcrypt.compare.mockResolvedValue(true);
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');

        const res = createRes();
        await changePassword(baseReq, res);
        expect(res.payload.message).toBe('Senha alterada com sucesso');
    });
});

describe('Auth Controller', () => {
    beforeEach(() => {
        bcrypt.genSalt.mockResolvedValue('salt');
        bcrypt.hash.mockResolvedValue('hashed');
        bcrypt.compare.mockResolvedValue(true);
    });

    it('registers user successfully', async () => {
        mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await register({ body: { name: 'Novo', cpf: '123.456.789-00', email: 'novo@example.com', password: 'Senha1234' } }, res);
        expect(res.statusCode).toBe(201);
        expect(res.payload.message).toContain('Usuário criado');
    });

    it('rejects duplicated email', async () => {
        mockQuery().mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const res = createRes();
        await register({ body: { name: 'Dup', cpf: '123.456.789-00', email: 'dup@example.com', password: 'Senha1234' } }, res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error).toContain('Email já cadastrado');
    });

    it('rejects duplicated CPF', async () => {
        mockQuery()
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ id: 1 }] });
        const res = createRes();
        await register({ body: { name: 'Dup', cpf: '123.456.789-00', email: 'dup@example.com', password: 'Senha1234' } }, res);
        expect(res.statusCode).toBe(400);
        expect(res.payload.error).toContain('CPF já cadastrado');
    });

    it('logs user in and sets cookie', async () => {
        mockQuery().mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'user@example.com',
                password: 'hash',
                name: 'User',
                cpf: '123',
                username: 'user'
            }]
        });
        const res = createRes();
        await login({ body: { email: 'user@example.com', password: 'Senha123' } }, res);
        expect(res.cookies).toHaveLength(1);
        expect(res.payload.user.isAuthenticated).toBe(true);
    });

    it('rejects login when user not found', async () => {
        mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await login({ body: { email: 'missing@example.com', password: 'Senha123' } }, res);
        expect(res.statusCode).toBe(400);
    });

    it('rejects login on incorrect password', async () => {
        mockQuery().mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'user@example.com',
                password: 'hash',
                name: 'User',
                cpf: '123',
                username: 'user'
            }]
        });
        bcrypt.compare.mockResolvedValueOnce(false);
        const res = createRes();
        await login({ body: { email: 'user@example.com', password: 'errada' } }, res);
        expect(res.statusCode).toBe(400);
    });

    it('validates existing user', async () => {
        mockQuery().mockResolvedValueOnce({
            rows: [{
                id: 1,
                email: 'user@example.com',
                name: 'User',
                cpf: '123',
                username: 'user'
            }]
        });
        const res = createRes();
        await validate({ user: { id: 1 } }, res);
        expect(res.payload.valid).toBe(true);
    });

    it('returns 401 when validation user missing', async () => {
        mockQuery().mockResolvedValueOnce({ rows: [] });
        const res = createRes();
        await validate({ user: { id: 1 } }, res);
        expect(res.statusCode).toBe(401);
    });

    it('clears cookie on logout', () => {
        const res = createRes();
        logout({}, res);
        expect(res.clearedCookies).toHaveLength(1);
        expect(res.payload.message).toContain('Sessão encerrada');
    });
});
