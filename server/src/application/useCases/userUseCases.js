// @ts-check
import bcrypt from 'bcryptjs';
import { User } from '../../domain/entities/User.js';
import { toPublicUser } from '../dto/userDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    listUsers as listUsersRepo,
    findUserById,
    findUserByCpfExcludingId,
    findUserByEmailExcludingId,
    updateUser as updateUserRepo,
    updateUserWithPassword as updateUserWithPasswordRepo,
    deleteUser as deleteUserRepo
} from '../../infrastructure/repositories/userRepository.js';

/**
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const listUsers = async () => {
    const result = await listUsersRepo();
    const users = result.map(row => toPublicUser(User.fromDatabase(row)));
    return { status: 200, payload: users };
};

/**
 * @param {number|string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const getUserByIdUseCase = async (id) => {
    const result = await findUserById(id);
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
    let { name, cpf, email, password } = payload;

    const cpfClean = cpf ? cpf.replace(/[^\d]/g, '') : null;

    if (cpfClean) {
        const cpfCheck = await findUserByCpfExcludingId(cpfClean, id);
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

    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await updateUserWithPasswordRepo({
            id,
            name,
            cpf: cpfClean,
            email,
            password: hashedPassword
        });
    } else {
        await updateUserRepo({
            id,
            name,
            cpf: cpfClean,
            email
        });
    }

    return { status: 200, payload: buildMessageResponse('Usuário atualizado com sucesso') };
};

/**
 * @param {number|string} id
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const deleteUserUseCase = async (id) => {
    await deleteUserRepo(id);
    return { status: 200, payload: buildMessageResponse('Usuário excluído') };
};
