import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};

export const register = async (req, res) => {
    const { name, cpf, email, password } = req.body;
    try {
        const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        const cpfClean = cpf.replace(/[^\d]/g, '');
        const cpfCheck = await pool.query('SELECT * FROM users WHERE cpf = $1', [cpfClean]);
        if (cpfCheck.rows.length > 0) {
            return res.status(400).json({ error: 'CPF já cadastrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const username = email.split('@')[0];

        await pool.query(
            'INSERT INTO users (name, cpf, email, password, username) VALUES ($1, $2, $3, $4, $5)',
            [name, cpfClean, email, hashedPassword, username]
        );

        res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (err) {
        handleError(res, err, 'register');
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }

        const user = result.rows[0];

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({
            token,
            user: {
                name: user.name,
                cpf: user.cpf,
                email: user.email,
                username: user.username,
                isAuthenticated: true
            }
        });
    } catch (err) {
        handleError(res, err, 'login');
    }
};

export const validate = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ valid: false, error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({
            valid: true,
            user: {
                id: decoded.id,
                email: decoded.email
            }
        });
    } catch (err) {
        res.status(401).json({ valid: false, error: 'Token inválido ou expirado' });
    }
};
