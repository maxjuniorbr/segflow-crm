import pool from '../../../config/db.js';

export const listClients = async () => {
    const result = await pool.query('SELECT * FROM clients ORDER BY createdat DESC');
    return result.rows;
};

export const findClientById = async (id) => {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    return result.rows[0];
};

export const findClientByCpf = async (cpf) => {
    const result = await pool.query('SELECT id FROM clients WHERE cpf = $1', [cpf]);
    return result.rows[0];
};

export const findClientByCnpj = async (cnpj) => {
    const result = await pool.query('SELECT id FROM clients WHERE cnpj = $1', [cnpj]);
    return result.rows[0];
};

export const findClientByCpfExcludingId = async (cpf, id) => {
    const result = await pool.query('SELECT id FROM clients WHERE cpf = $1 AND id != $2', [cpf, id]);
    return result.rows[0];
};

export const findClientByCnpjExcludingId = async (cnpj, id) => {
    const result = await pool.query('SELECT id FROM clients WHERE cnpj = $1 AND id != $2', [cnpj, id]);
    return result.rows[0];
};

export const createClient = async ({
    id,
    name,
    personType,
    cpf,
    cnpj,
    rg,
    rgDispatchDate,
    rgIssuer,
    birthDate,
    maritalStatus,
    email,
    phone,
    address,
    notes
}) => {
    await pool.query(
        `INSERT INTO clients (id, name, persontype, cpf, cnpj, rg, rgdispatchdate, rgissuer, birthdate, maritalstatus, email, phone, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [id, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes]
    );
};

export const updateClient = async ({
    id,
    name,
    personType,
    cpf,
    cnpj,
    rg,
    rgDispatchDate,
    rgIssuer,
    birthDate,
    maritalStatus,
    email,
    phone,
    address,
    notes
}) => {
    await pool.query(
        `UPDATE clients SET name=$1, persontype=$2, cpf=$3, cnpj=$4, rg=$5, rgdispatchdate=$6, rgissuer=$7, birthdate=$8, maritalstatus=$9, email=$10, phone=$11, address=$12, notes=$13 WHERE id=$14`,
        [name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes, id]
    );
};

export const deleteClient = async (id) => {
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
};

export const countActiveDocumentsForClient = async (id) => {
    const result = await pool.query(
        "SELECT count(*) as count FROM documents WHERE clientid = $1 AND status != 'Cancelado'",
        [id]
    );
    return result.rows[0];
};
