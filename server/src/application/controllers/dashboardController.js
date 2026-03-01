import { getDashboardStatsUseCase } from '../useCases/dashboardUseCases.js';
import { respondWithError } from '../errors/respondWithError.js';

export const getDashboardStats = async (req, res) => {
    try {
        const result = await getDashboardStatsUseCase(req.user.brokerId);
        res.status(result.status).json(result.payload);
    } catch (err) {
        respondWithError(res, err, { context: 'getDashboardStats' });
    }
};
