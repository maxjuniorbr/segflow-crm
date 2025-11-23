import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { User } from '../src/domain/entities/User.js';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};

export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users ORDER BY created_at DESC
        `);

        const users = result.rows.map(row => User.fromDatabase(row));
        const publicUsers = users.map(user => user.toJSON());

        res.json(publicUsers);
    } catch (err) {
        handleError(res, err, 'getUsers');
    }
};

export const getUserById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = User.fromDatabase(result.rows[0]);

        res.json(user.toJSON());
    } catch (err) {
        handleError(res, err, 'getUserById');
    }
};

export const updateUser = async (req, res) => {
    let { name, cpf, email, password } = req.body;

    const cpfClean = cpf ? cpf.replace(/[^\d]/g, '') : null;

    try {
        if (cpfClean) {
            const cpfCheck = await pool.query(
                'SELECT id FROM users WHERE cpf = $1 AND id != $2',
                [cpfClean, req.params.id]
            );
            if (cpfCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['cpf'], message: 'CPF já cadastrado' }]
                });
            }
        }

        if (email) {
            const emailCheck = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, req.params.id]
            );
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['email'], message: 'Email já cadastrado' }]
                });
            }
        }

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await pool.query(
                `UPDATE users SET name=$1, cpf=$2, email=$3, password=$4 WHERE id=$5`,
                [name, cpfClean, email, hashedPassword, req.params.id]
            );
        } else {
            await pool.query(
                `UPDATE users SET name=$1, cpf=$2, email=$3 WHERE id=$4`,
                [name, cpfClean, email, req.params.id]
            );
        }

        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (err) {
        handleError(res, err, 'updateUser');
    }
};

export const deleteUser = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'Usuário excluído' });
    } catch (err) {
        handleError(res, err, 'deleteUser');
    }
};
