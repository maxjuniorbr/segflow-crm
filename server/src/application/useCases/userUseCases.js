// @ts-check
import { User } from '../../domain/entities/User.js';
import { toPublicUser } from '../dto/userDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    listUsers as listUsersRepo,
    findUserById,
    findUserByCpfExcludingId,
    findUserByEmailExcludingId,
    updateUser as updateUserRepo,
    deleteUser as deleteUserRepo
} from '../../infrastructure/repositories/userRepository.js';

/**
 * @param {string} brokerId
 * @param {{ limit?: number }} [options]
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listUsers = async (brokerId, { limit } = {}) => {
    const result = await listUsersRepo(brokerId, { limit });
    const users = result.map(row => toPublicUser(User.fromDatabase(row)));
    return { status: 200, payload: users };
};

/**
 * @param {number|string} id
 * @param {string} brokerId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getUserByIdUseCase = async (id, brokerId) => {
    const result = await findUserById(id, brokerId);
    if (!result) {
        return { status: 404, payload: { error: 'Usuário não encontrado' } };
    }

    return { status: 200, payload: toPublicUser(User.fromDatabase(result)) };
};

/**
 * @param {number|string} id
 * @param {import('../../types.js').UserPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const updateUserUseCase = async (id, payload) => {
    const { brokerId, name, cpf, email } = payload;

    const existing = await findUserById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Usuário não encontrado' } };
    }

    const cpfClean = cpf ? cpf.replaceAll(/[^\d]/g, '') : null;

    if (cpfClean) {
        const cpfCheck = await findUserByCpfExcludingId(cpfClean, id, brokerId);
        if (cpfCheck) {
            return { status: 400, payload: { error: [{ path: ['cpf'], message: 'CPF já cadastrado' }] } };
        }
    }

    if (email) {
        const emailCheck = await findUserByEmailExcludingId(email, id);
        if (emailCheck) {
            return { status: 400, payload: { error: [{ path: ['email'], message: 'Email já cadastrado' }] } };
        }
    }

    await updateUserRepo({
        id,
        brokerId,
        name,
        cpf: cpfClean,
        email
    });

    return { status: 200, payload: buildMessageResponse('Usuário atualizado com sucesso') };
};

/**
 * @param {number|string} id
 * @param {string} brokerId
 * @param {number|string} [requestingUserId]
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteUserUseCase = async (id, brokerId, requestingUserId) => {
    if (requestingUserId != null && String(id) === String(requestingUserId)) {
        return { status: 403, payload: { error: 'Não é permitido excluir a própria conta' } };
    }
    const existing = await findUserById(id, brokerId);
    if (!existing) {
        return { status: 404, payload: { error: 'Usuário não encontrado' } };
    }
    await deleteUserRepo(id, brokerId);
    return { status: 200, payload: buildMessageResponse('Usuário excluído') };
};
