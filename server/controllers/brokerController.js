import pool from '../config/db.js';
import { randomUUID } from 'crypto';
import { Broker } from '../src/domain/entities/Broker.js';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};

const sanitizeCnpj = (cnpj) => cnpj ? cnpj.replace(/[^\d]/g, '') : null;

export const getBrokers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM brokers ORDER BY createdat DESC
        `);
        const brokers = result.rows.map(row => Broker.fromDatabase(row).toJSON());
        res.json(brokers);
    } catch (err) {
        handleError(res, err, 'getBrokers');
    }
};

export const getBrokerById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM brokers WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Corretora não encontrada' });
        }

        const broker = Broker.fromDatabase(result.rows[0]).toJSON();
        res.json(broker);
    } catch (err) {
        handleError(res, err, 'getBrokerById');
    }
};

export const createBroker = async (req, res) => {
    let { id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile } = req.body;
    const brokerId = id || randomUUID();
    const cnpjClean = sanitizeCnpj(cnpj);
    susepCode = susepCode ? susepCode.trim() : null;

    try {
        const cnpjCheck = await pool.query(
            'SELECT id FROM brokers WHERE cnpj = $1',
            [cnpjClean]
        );
        if (cnpjCheck.rows.length > 0) {
            return res.status(400).json({
                error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }]
            });
        }

        if (susepCode && susepCode.trim() !== '') {
            const susepCheck = await pool.query(
                'SELECT id FROM brokers WHERE susepcode = $1',
                [susepCode]
            );
            if (susepCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }]
                });
            }
        }

        await pool.query(
            `INSERT INTO brokers (id, corporatename, tradename, cnpj, susepcode, contactname, email, phone, mobile)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [brokerId, corporateName, tradeName, cnpjClean, susepCode, contactName, email, phone, mobile]
        );

        res.status(201).json({ message: 'Corretora criada', id: brokerId });
    } catch (err) {
        handleError(res, err, 'createBroker');
    }
};

export const updateBroker = async (req, res) => {
    let { corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile } = req.body;
    const brokerId = req.params.id;
    const cnpjClean = sanitizeCnpj(cnpj);
    susepCode = susepCode ? susepCode.trim() : null;

    try {
        const cnpjCheck = await pool.query(
            'SELECT id FROM brokers WHERE cnpj = $1 AND id != $2',
            [cnpjClean, brokerId]
        );
        if (cnpjCheck.rows.length > 0) {
            return res.status(400).json({
                error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }]
            });
        }

        if (susepCode && susepCode.trim() !== '') {
            const susepCheck = await pool.query(
                'SELECT id FROM brokers WHERE susepcode = $1 AND id != $2',
                [susepCode, brokerId]
            );
            if (susepCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['susepCode'], message: 'Código SUSEP já cadastrado' }]
                });
            }
        }

        await pool.query(
            `UPDATE brokers SET corporatename=$1, tradename=$2, cnpj=$3, susepcode=$4, contactname=$5, email=$6, phone=$7, mobile=$8 WHERE id=$9`,
            [corporateName, tradeName, cnpjClean, susepCode, contactName, email, phone, mobile, brokerId]
        );

        res.json({ message: 'Corretora atualizada com sucesso' });
    } catch (err) {
        handleError(res, err, 'updateBroker');
    }
};

export const deleteBroker = async (req, res) => {
    try {
        await pool.query('DELETE FROM brokers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Corretora excluída' });
    } catch (err) {
        handleError(res, err, 'deleteBroker');
    }
};
