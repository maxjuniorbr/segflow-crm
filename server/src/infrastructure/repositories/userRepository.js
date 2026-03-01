import pool from '../../../config/db.js';

export const listUsers = async (brokerId, { limit = 100 } = {}) => {
    if (!brokerId) throw new Error('brokerId is required for user queries');
    const safeLimit = Math.min(Math.max(1, Math.floor(Number(limit) || 100)), 200);
    const result = await pool.query(
        'SELECT id, broker_id, name, cpf, email, username, created_at FROM users WHERE broker_id = $1 ORDER BY created_at DESC LIMIT $2',
        [brokerId, safeLimit]
    );
    return result.rows;
};

export const findUserById = async (id, brokerId) => {
    const result = await pool.query(
        'SELECT id, broker_id, name, cpf, email, username, created_at FROM users WHERE id = $1 AND broker_id = $2',
        [id, brokerId]
    );
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query(
        'SELECT id, broker_id, name, cpf, email, password, username, created_at FROM users WHERE email = $1',
        [email]
    );
    return result.rows[0];
};

export const findUserByCpf = async (cpf, brokerId) => {
    const result = await pool.query(
        'SELECT id, broker_id, name, cpf, email, username, created_at FROM users WHERE cpf = $1 AND broker_id = $2',
        [cpf, brokerId]
    );
    return result.rows[0];
};

export const findUserByCpfExcludingId = async (cpf, id, brokerId) => {
    const result = await pool.query('SELECT id FROM users WHERE cpf = $1 AND id != $2 AND broker_id = $3', [cpf, id, brokerId]);
    return result.rows[0];
};

export const findUserByEmailExcludingId = async (email, id) => {
    const result = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    return result.rows[0];
};

export const createUser = async ({ brokerId, name, cpf, email, password, username }) => {
    const result = await pool.query(
        'INSERT INTO users (broker_id, name, cpf, email, password, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [brokerId, name, cpf, email, password, username]
    );
    return result.rows[0];
};

export const updateUser = async ({ id, brokerId, name, cpf, email }) => {
    await pool.query('UPDATE users SET name=$1, cpf=$2, email=$3 WHERE id=$4 AND broker_id=$5', [name, cpf, email, id, brokerId]);
};

export const updateUserWithPassword = async ({ id, brokerId, name, cpf, email, password }) => {
    await pool.query(
        'UPDATE users SET name=$1, cpf=$2, email=$3, password=$4 WHERE id=$5 AND broker_id=$6',
        [name, cpf, email, password, id, brokerId]
    );
};

export const deleteUser = async (id, brokerId) => {
    await pool.query('DELETE FROM users WHERE id = $1 AND broker_id = $2', [id, brokerId]);
};

export const getUserPasswordById = async (id, brokerId) => {
    const result = await pool.query('SELECT password FROM users WHERE id = $1 AND broker_id = $2', [id, brokerId]);
    return result.rows[0];
};

export const updateUserPassword = async ({ id, brokerId, password }) => {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2 AND broker_id = $3', [password, id, brokerId]);
};

export const findUserByIdMinimal = async (id) => {
    const result = await pool.query(
        'SELECT id, broker_id, email FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const countUsersByBroker = async (brokerId) => {
    const result = await pool.query(
        'SELECT COUNT(*)::int AS count FROM users WHERE broker_id = $1',
        [brokerId]
    );
    return result.rows[0]?.count ?? 0;
};
