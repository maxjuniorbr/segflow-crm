import { getDashboardStats as getDashboardStatsRepo } from '../../infrastructure/repositories/dashboardRepository.js';

/**
 * Use case to retrieve dashboard statistics.
 * @param {string} brokerId
 * @returns {Promise<{status: number, payload: object}>}
 */
export const getDashboardStatsUseCase = async (brokerId) => {
    const stats = await getDashboardStatsRepo(brokerId);
    return { status: 200, payload: stats };
};
