import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
    }

    try {
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isValidPassword) {
            return res.status(400).json({ error: 'Senha atual incorreta' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (err) {
        console.error(`Error in changePassword:`, err);
        const message = process.env.NODE_ENV === 'production'
            ? 'Erro ao alterar senha'
            : err.message;
        res.status(500).json({ error: message });
    }
};
