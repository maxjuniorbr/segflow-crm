import pool from '../../../config/db.js';

export const createRefreshToken = async (userId, tokenHash, expiresAt) => {
    await pool.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, tokenHash, expiresAt]
    );
};

export const deleteRefreshToken = async (tokenHash) => {
    await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
};

export const revokeRefreshTokenByHash = async (tokenHash) => {
    const result = await pool.query(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1 AND revoked = FALSE RETURNING user_id, expires_at',
        [tokenHash]
    );
    return result.rows[0];
};

export const isTokenRevoked = async (tokenHash) => {
    const result = await pool.query(
        'SELECT user_id FROM refresh_tokens WHERE token_hash = $1 AND revoked = TRUE',
        [tokenHash]
    );
    return result.rows[0];
};

export const deleteAllUserRefreshTokens = async (userId) => {
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
};

export const deleteExpiredRefreshTokens = async () => {
    const result = await pool.query(
        `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR (revoked = TRUE AND created_at < NOW() - INTERVAL '7 days')`
    );
    return result.rowCount;
};
