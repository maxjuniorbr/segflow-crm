import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const passwordPolicy = {
    minLength: 8,
    pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
};

export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const authenticatedUserId = req.user?.id;
    const requestedUserId = Number(req.params.id);

    if (!authenticatedUserId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (Number(authenticatedUserId) !== requestedUserId) {
        return res.status(403).json({ error: 'Você só pode alterar sua própria senha' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({ error: 'A nova senha deve ser diferente da atual' });
    }

    if (newPassword.length < passwordPolicy.minLength || !passwordPolicy.pattern.test(newPassword)) {
        return res.status(400).json({
            error: 'Nova senha deve ter ao menos 8 caracteres, incluindo letras e números'
        });
    }

    try {
        const result = await pool.query('SELECT password FROM users WHERE id = $1', [authenticatedUserId]);

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

        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, authenticatedUserId]);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (err) {
        console.error(`Error in changePassword:`, err);
        const message = process.env.NODE_ENV === 'production'
            ? 'Erro ao alterar senha'
            : err.message;
        res.status(500).json({ error: message });
    }
};
