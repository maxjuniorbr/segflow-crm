// @ts-check
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { buildAuthResponse, buildAuthUser } from '../dto/authDto.js';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    findUserByEmail,
    findUserByCpf,
    createUser,
    findUserById
} from '../../infrastructure/repositories/userRepository.js';

/**
 * @param {import('../../types.js').AuthRegisterPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const registerUser = async ({ name, cpf, email, password }) => {
    const emailCheck = await findUserByEmail(email);
    if (emailCheck) {
        return { status: 400, payload: { error: 'Email já cadastrado' } };
    }

    const cpfClean = cpf.replace(/[^\d]/g, '');
    const cpfCheck = await findUserByCpf(cpfClean);
    if (cpfCheck) {
        return { status: 400, payload: { error: 'CPF já cadastrado' } };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const username = email.split('@')[0];

    await createUser({
        name,
        cpf: cpfClean,
        email,
        password: hashedPassword,
        username
    });

    return { status: 201, payload: buildMessageResponse('Usuário criado com sucesso') };
};

/**
 * @param {import('../../types.js').AuthLoginPayload} payload
 * @returns {Promise<import('../../types.js').UseCaseResult & { token?: string }>}
 */
export const loginUser = async ({ email, password }) => {
    const user = await findUserByEmail(email);
    if (!user) {
        return { status: 400, payload: { error: 'Credenciais inválidas' } };
    }

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
        return { status: 400, payload: { error: 'Credenciais inválidas' } };
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });

    return { status: 200, payload: buildAuthResponse(user), token };
};

/**
 * @param {number|string} userId
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const validateUser = async (userId) => {
    const user = await findUserById(userId);
    if (!user) {
        return { status: 401, payload: { valid: false, error: 'Usuário não encontrado' } };
    }

    return { status: 200, payload: { valid: true, user: buildAuthUser(user) } };
};
