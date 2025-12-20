import pool from '../../../config/db.js';

export const listBrokers = async () => {
    const result = await pool.query('SELECT * FROM brokers ORDER BY createdat DESC');
    return result.rows;
};

export const findBrokerById = async (id) => {
    const result = await pool.query('SELECT * FROM brokers WHERE id = $1', [id]);
    return result.rows[0];
};

export const findBrokerByCnpj = async (cnpj) => {
    const result = await pool.query('SELECT id FROM brokers WHERE cnpj = $1', [cnpj]);
    return result.rows[0];
};

export const findBrokerBySusep = async (susepCode) => {
    const result = await pool.query('SELECT id FROM brokers WHERE susepcode = $1', [susepCode]);
    return result.rows[0];
};

export const findBrokerByCnpjExcludingId = async (cnpj, id) => {
    const result = await pool.query('SELECT id FROM brokers WHERE cnpj = $1 AND id != $2', [cnpj, id]);
    return result.rows[0];
};

export const findBrokerBySusepExcludingId = async (susepCode, id) => {
    const result = await pool.query('SELECT id FROM brokers WHERE susepcode = $1 AND id != $2', [susepCode, id]);
    return result.rows[0];
};

export const createBroker = async ({
    id,
    corporateName,
    tradeName,
    cnpj,
    susepCode,
    contactName,
    email,
    phone,
    mobile
}) => {
    await pool.query(
        `INSERT INTO brokers (id, corporatename, tradename, cnpj, susepcode, contactname, email, phone, mobile)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile]
    );
};

export const updateBroker = async ({
    id,
    corporateName,
    tradeName,
    cnpj,
    susepCode,
    contactName,
    email,
    phone,
    mobile
}) => {
    await pool.query(
        `UPDATE brokers SET corporatename=$1, tradename=$2, cnpj=$3, susepcode=$4, contactname=$5, email=$6, phone=$7, mobile=$8 WHERE id=$9`,
        [corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile, id]
    );
};

export const deleteBroker = async (id) => {
    await pool.query('DELETE FROM brokers WHERE id = $1', [id]);
};
