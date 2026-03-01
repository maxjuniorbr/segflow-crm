import pool from '../../../config/db.js';

export const getDashboardStats = async (brokerId) => {
    if (!brokerId) throw new Error('brokerId is required for dashboard queries');
    const countsResult = await pool.query(`
        SELECT
            (SELECT COUNT(*) FROM clients WHERE broker_id = $1) AS "totalClients",
            COUNT(*) FILTER (WHERE d.status = 'Apólice') AS "activePolicies",
            COUNT(*) FILTER (WHERE d.status = 'Proposta') AS "pendingProposals",
            COUNT(*) FILTER (WHERE d.end_date >= CURRENT_DATE AND d.end_date <= CURRENT_DATE + INTERVAL '30 days' AND d.status != 'Cancelado') AS "expiringSoon"
        FROM documents d
        JOIN clients c ON c.id = d.client_id
        WHERE c.broker_id = $1
    `, [brokerId]);

    const counts = countsResult.rows[0];

    const upcomingResult = await pool.query(`
        SELECT 
            d.id,
            c.name AS "clientName",
            d.type,
            d.company,
            d.end_date AS "endDate"
        FROM documents d
        JOIN clients c ON c.id = d.client_id
        WHERE d.end_date >= CURRENT_DATE
          AND d.status != 'Cancelado'
          AND c.broker_id = $1
        ORDER BY d.end_date ASC
        LIMIT 5
    `, [brokerId]);

    return {
        totalClients: parseInt(counts.totalClients, 10) || 0,
        activePolicies: parseInt(counts.activePolicies, 10) || 0,
        pendingProposals: parseInt(counts.pendingProposals, 10) || 0,
        expiringSoon: parseInt(counts.expiringSoon, 10) || 0,
        upcomingExpirations: upcomingResult.rows.map(row => ({
            id: row.id,
            clientName: row.clientName || 'Cliente não encontrado',
            type: row.type,
            company: row.company,
            endDate: row.endDate
        }))
    };
};
