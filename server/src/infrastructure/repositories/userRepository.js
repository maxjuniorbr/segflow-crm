import pool from '../../../config/db.js';

export const listUsers = async () => {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
};

export const findUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const findUserByEmail = async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

export const findUserByCpf = async (cpf) => {
    const result = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpf]);
    return result.rows[0];
};

export const findUserByCpfExcludingId = async (cpf, id) => {
    const result = await pool.query('SELECT id FROM users WHERE cpf = $1 AND id != $2', [cpf, id]);
    return result.rows[0];
};

export const findUserByEmailExcludingId = async (email, id) => {
    const result = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
    return result.rows[0];
};

export const createUser = async ({ name, cpf, email, password, username }) => {
    await pool.query(
        'INSERT INTO users (name, cpf, email, password, username) VALUES ($1, $2, $3, $4, $5)',
        [name, cpf, email, password, username]
    );
};

export const updateUser = async ({ id, name, cpf, email }) => {
    await pool.query('UPDATE users SET name=$1, cpf=$2, email=$3 WHERE id=$4', [name, cpf, email, id]);
};

export const updateUserWithPassword = async ({ id, name, cpf, email, password }) => {
    await pool.query(
        'UPDATE users SET name=$1, cpf=$2, email=$3, password=$4 WHERE id=$5',
        [name, cpf, email, password, id]
    );
};

export const deleteUser = async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

export const getUserPasswordById = async (id) => {
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const updateUserPassword = async ({ id, password }) => {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [password, id]);
};
