import { changePasswordUseCase } from '../useCases/passwordUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const changePassword = async (req, res) => {
    try {
        const result = await changePasswordUseCase({
            authenticatedUserId: req.user?.id,
            authenticatedBrokerId: req.user?.brokerId,
            requestedUserId: req.params.id,
            currentPassword: req.body?.currentPassword,
            newPassword: req.body?.newPassword
        });
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'changePassword', defaultMessage: 'Erro ao alterar senha' });
    }
};
