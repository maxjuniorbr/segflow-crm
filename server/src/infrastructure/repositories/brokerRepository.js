import pool from '../../../config/db.js';

const BROKER_COLUMNS = 'id, corporate_name, trade_name, cnpj, susep_code, contact_name, email, phone, mobile, created_at';

export const listBrokers = async (brokerId) => {
    if (!brokerId) throw new Error('brokerId is required for broker queries');
    const result = await pool.query(
        `SELECT ${BROKER_COLUMNS} FROM brokers WHERE id = $1 ORDER BY created_at DESC LIMIT 100`,
        [brokerId]
    );
    return result.rows;
};

export const findBrokerById = async (id) => {
    const result = await pool.query(`SELECT ${BROKER_COLUMNS} FROM brokers WHERE id = $1`, [id]);
    return result.rows[0];
};

export const findBrokerByCnpj = async (cnpj) => {
    const result = await pool.query('SELECT id FROM brokers WHERE cnpj = $1', [cnpj]);
    return result.rows[0];
};

export const findBrokerBySusep = async (susepCode) => {
    const result = await pool.query('SELECT id FROM brokers WHERE susep_code = $1', [susepCode]);
    return result.rows[0];
};

export const findBrokerByCnpjExcludingId = async (cnpj, id) => {
    const result = await pool.query('SELECT id FROM brokers WHERE cnpj = $1 AND id != $2', [cnpj, id]);
    return result.rows[0];
};

export const findBrokerBySusepExcludingId = async (susepCode, id) => {
    const result = await pool.query('SELECT id FROM brokers WHERE susep_code = $1 AND id != $2', [susepCode, id]);
    return result.rows[0];
};

export const createBroker = async ({
    id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile
}) => {
    await pool.query(
        `INSERT INTO brokers (id, corporate_name, trade_name, cnpj, susep_code, contact_name, email, phone, mobile)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile]
    );
};

export const updateBroker = async ({
    id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile
}) => {
    await pool.query(
        `UPDATE brokers SET corporate_name=$1, trade_name=$2, cnpj=$3, susep_code=$4, contact_name=$5, email=$6, phone=$7, mobile=$8 WHERE id=$9`,
        [corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile, id]
    );
};

export const deleteBroker = async (id) => {
    await pool.query('DELETE FROM brokers WHERE id = $1', [id]);
};
