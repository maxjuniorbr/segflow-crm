import pool from '../../../config/db.js';
import { sanitizeForLike, addParam, buildWhereClause, appendCursorCondition, appendLimit, appendOffset, parseTotalCount } from './queryHelpers.js';

const buildClientFilters = ({ brokerId, search, personType } = {}) => {
    if (!brokerId) {
        throw new Error('brokerId is required for client queries');
    }

    const values = [];
    const conditions = [];

    conditions.push(`broker_id = ${addParam(values, brokerId)}`);

    if (personType) {
        conditions.push(`person_type = ${addParam(values, personType)}`);
    }

    if (search) {
        const normalized = sanitizeForLike(search);
        const param = addParam(values, `%${normalized}%`);
        const searchDigits = search.replaceAll(/\D/g, '');
        if (searchDigits.length > 0) {
            const digitParam = addParam(values, `%${searchDigits}%`);
            conditions.push(`(
                LOWER(name) LIKE ${param}
                OR LOWER(email) LIKE ${param}
                OR cpf LIKE ${digitParam}
                OR cnpj LIKE ${digitParam}
            )`);
        } else {
            conditions.push(`(
                LOWER(name) LIKE ${param}
                OR LOWER(email) LIKE ${param}
            )`);
        }
    }

    return { values, whereClause: buildWhereClause(conditions) };
};

export const listClients = async ({ brokerId, search, personType, limit, offset, cursor } = {}) => {
    const { values, whereClause } = buildClientFilters({ brokerId, search, personType });
    const queryValues = [...values];
    const hasCursor = Boolean(cursor?.createdAt && cursor?.id);
    const countExpr = hasCursor ? '' : ', COUNT(*) OVER() AS total_count';
    let query = `SELECT id, broker_id, name, person_type, cpf, cnpj, rg, rg_dispatch_date, rg_issuer, birth_date, marital_status, email, phone, address, notes, created_at${countExpr} FROM clients${whereClause}`;

    if (hasCursor) {
        query = appendCursorCondition(query, queryValues, cursor, Boolean(whereClause));
    }

    query += ' ORDER BY created_at DESC, id DESC';
    query = appendLimit(query, queryValues, limit);

    if (!hasCursor) {
        query = appendOffset(query, queryValues, offset);
    }

    const result = await pool.query(query, queryValues);
    const total = hasCursor ? 0 : parseTotalCount(result);
    return { rows: result.rows, total };
};

export const findClientById = async (id, brokerId) => {
    const result = await pool.query(
        'SELECT id, broker_id, name, person_type, cpf, cnpj, rg, rg_dispatch_date, rg_issuer, birth_date, marital_status, email, phone, address, notes, created_at FROM clients WHERE id = $1 AND broker_id = $2',
        [id, brokerId]
    );
    return result.rows[0];
};

export const findClientByCpf = async (cpf, brokerId) => {
    const result = await pool.query('SELECT id FROM clients WHERE cpf = $1 AND broker_id = $2', [cpf, brokerId]);
    return result.rows[0];
};

export const findClientByCnpj = async (cnpj, brokerId) => {
    const result = await pool.query('SELECT id FROM clients WHERE cnpj = $1 AND broker_id = $2', [cnpj, brokerId]);
    return result.rows[0];
};

export const findClientByCpfExcludingId = async (cpf, id, brokerId) => {
    const result = await pool.query('SELECT id FROM clients WHERE cpf = $1 AND id != $2 AND broker_id = $3', [cpf, id, brokerId]);
    return result.rows[0];
};

export const findClientByCnpjExcludingId = async (cnpj, id, brokerId) => {
    const result = await pool.query('SELECT id FROM clients WHERE cnpj = $1 AND id != $2 AND broker_id = $3', [cnpj, id, brokerId]);
    return result.rows[0];
};

export const createClient = async ({
    id, brokerId, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes
}) => {
    await pool.query(
        `INSERT INTO clients (id, broker_id, name, person_type, cpf, cnpj, rg, rg_dispatch_date, rg_issuer, birth_date, marital_status, email, phone, address, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [id, brokerId, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes]
    );
};

export const updateClient = async ({
    id, brokerId, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes
}) => {
    await pool.query(
        `UPDATE clients SET name=$1, person_type=$2, cpf=$3, cnpj=$4, rg=$5, rg_dispatch_date=$6, rg_issuer=$7, birth_date=$8, marital_status=$9, email=$10, phone=$11, address=$12, notes=$13 WHERE id=$14 AND broker_id=$15`,
        [name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes, id, brokerId]
    );
};

export const deleteClient = async (id, brokerId) => {
    await pool.query('DELETE FROM clients WHERE id = $1 AND broker_id = $2', [id, brokerId]);
};

export const countActiveDocumentsForClient = async (id, brokerId) => {
    const result = await pool.query(
        "SELECT COUNT(*)::int as count FROM documents d JOIN clients c ON c.id = d.client_id WHERE d.client_id = $1 AND d.status != 'Cancelado' AND c.broker_id = $2",
        [id, brokerId]
    );
    return result.rows[0] || { count: 0 };
};

export const countClientsByBroker = async (brokerId) => {
    const result = await pool.query(
        'SELECT COUNT(*)::int AS count FROM clients WHERE broker_id = $1',
        [brokerId]
    );
    return result.rows[0]?.count ?? 0;
};
