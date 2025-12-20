// @ts-check
import { randomUUID } from 'crypto';
import { Client } from '../../domain/entities/Client.js';
import { toClientResponse } from '../dto/clientDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    listClients as listClientsRepo,
    findClientById,
    findClientByCpf,
    findClientByCnpj,
    findClientByCpfExcludingId,
    findClientByCnpjExcludingId,
    createClient as createClientRepo,
    updateClient as updateClientRepo,
    deleteClient as deleteClientRepo,
    countActiveDocumentsForClient
} from '../../infrastructure/repositories/clientRepository.js';

/**
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listClients = async () => {
    const result = await listClientsRepo();
    return {
        status: 200,
        payload: result.map(row => toClientResponse(Client.fromDatabase(row)))
    };
};

/**
 * @param {string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getClientByIdUseCase = async (id) => {
    const result = await findClientById(id);

    if (!result) {
        return { status: 404, payload: { error: 'Cliente não encontrado' } };
    }

    const client = toClientResponse(Client.fromDatabase(result));
    return { status: 200, payload: client };
};

/**
 * @param {import('../../types.js').ClientPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const createClientUseCase = async (payload) => {
    let {
        id,
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address,
        notes
    } = payload;

    const clientId = id || randomUUID();

    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;
    if (!cpf || cpf === '') cpf = null;
    if (!cnpj || cnpj === '') cnpj = null;
    if (!rg || rg === '') rg = null;
    if (!rgIssuer || rgIssuer === '') rgIssuer = null;
    if (!email || email === '') email = null;
    if (!phone || phone === '') phone = null;
    if (!notes || notes === '') notes = null;

    const addressJson = address ? JSON.stringify(address) : null;

    if (cpf && cpf.trim() !== '') {
        const cpfCheck = await findClientByCpf(cpf);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (cnpj && cnpj.trim() !== '') {
        const cnpjCheck = await findClientByCnpj(cnpj);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    await createClientRepo({
        id: clientId,
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address: addressJson,
        notes
    });

    return {
        status: 201,
        payload: buildMessageResponse('Cliente criado', { id: clientId })
    };
};

/**
 * @param {string} id
 * @param {import('../../types.js').ClientPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateClientUseCase = async (id, payload) => {
    let {
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address,
        notes
    } = payload;

    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;
    if (!cpf || cpf === '') cpf = null;
    if (!cnpj || cnpj === '') cnpj = null;
    if (!rg || rg === '') rg = null;
    if (!rgIssuer || rgIssuer === '') rgIssuer = null;
    if (!email || email === '') email = null;
    if (!phone || phone === '') phone = null;
    if (!notes || notes === '') notes = null;

    const addressJson = address ? JSON.stringify(address) : null;

    if (cpf && cpf.trim() !== '') {
        const cpfCheck = await findClientByCpfExcludingId(cpf, id);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (cnpj && cnpj.trim() !== '') {
        const cnpjCheck = await findClientByCnpjExcludingId(cnpj, id);
        if (cnpjCheck) {
            return { status: 400, payload: { error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }] } };
        }
    }

    await updateClientRepo({
        id,
        name,
        personType,
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address: addressJson,
        notes
    });

    return { status: 200, payload: buildMessageResponse('Cliente atualizado com sucesso') };
};

/**
 * @param {string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteClientUseCase = async (id) => {
    const proposalsCheck = await countActiveDocumentsForClient(id);
    if (Number(proposalsCheck?.count) > 0) {
        return { status: 400, payload: { error: 'Não é possível excluir cliente com propostas ativas.' } };
    }

    await deleteClientRepo(id);

    return { status: 200, payload: buildMessageResponse('Cliente excluído') };
};
