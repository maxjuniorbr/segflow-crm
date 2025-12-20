// @ts-check
import bcrypt from 'bcryptjs';
import { buildMessageResponse } from '../dto/responseDto.js';
import {
    getUserPasswordById,
    updateUserPassword
} from '../../infrastructure/repositories/userRepository.js';

const passwordPolicy = {
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
};

/**
 * @param {import('../../types.js').PasswordChangeRequest} payload
 * @returns {Promise<import('../../types.js').UseCaseResult>}
 */
export const changePasswordUseCase = async ({ authenticatedUserId, requestedUserId, currentPassword, newPassword }) => {
    if (!authenticatedUserId) {
        return { status: 401, payload: { error: 'Usuário não autenticado' } };
    }

    if (Number(authenticatedUserId) !== Number(requestedUserId)) {
        return { status: 403, payload: { error: 'Você só pode alterar sua própria senha' } };
    }

    if (!currentPassword || !newPassword) {
        return { status: 400, payload: { error: 'Senha atual e nova senha são obrigatórias' } };
    }

    if (currentPassword === newPassword) {
        return { status: 400, payload: { error: 'A nova senha deve ser diferente da atual' } };
    }

    if (newPassword.length < passwordPolicy.minLength || !passwordPolicy.pattern.test(newPassword)) {
        return {
            status: 400,
            payload: { error: 'Nova senha deve ter ao menos 8 caracteres, incluindo letras e números' }
        };
    }

    const result = await getUserPasswordById(authenticatedUserId);
    if (!result) {
        return { status: 404, payload: { error: 'Usuário não encontrado' } };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, result.password);

    if (!isValidPassword) {
        return { status: 400, payload: { error: 'Senha atual incorreta' } };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await updateUserPassword({ id: authenticatedUserId, password: hashedPassword });

    return { status: 200, payload: buildMessageResponse('Senha alterada com sucesso') };
};
