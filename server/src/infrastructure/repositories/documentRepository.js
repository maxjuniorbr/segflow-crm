import pool from '../../../config/db.js';

const buildDocumentFilters = ({ brokerId, clientId, status, search }) => {
    if (!brokerId) {
        throw new Error('brokerId is required for document queries');
    }

    const values = [];
    const conditions = [];

    values.push(brokerId);
    conditions.push(`d.broker_id = $${values.length}`);

    if (clientId) {
        values.push(clientId);
        conditions.push(`d.client_id = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`d.status = $${values.length}`);
    }

    if (search) {
        const normalized = search.toLowerCase().replaceAll(/[%_\\]/g, '\\$&');
        values.push(`%${normalized}%`);
        const param = `$${values.length}`;
        conditions.push(`(
            LOWER(d.document_number) LIKE ${param}
            OR LOWER(d.company) LIKE ${param}
            OR LOWER(d.status) LIKE ${param}
            OR LOWER(c.name) LIKE ${param}
        )`);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    return { values, whereClause };
};

const appendCursorCondition = (query, values, cursor, hasWhereClause) => {
    values.push(cursor.createdAt);
    const createdAtParam = `$${values.length}`;
    values.push(cursor.id);
    const idParam = `$${values.length}`;
    const conjunction = hasWhereClause ? ' AND' : ' WHERE';
    return query + `${conjunction} (d.created_at < ${createdAtParam} OR (d.created_at = ${createdAtParam} AND d.id < ${idParam}))`;
};

const appendLimit = (query, values, limit) => {
    if (limit == null) return query;
    const n = Number.parseInt(limit, 10);
    if (Number.isNaN(n) || n <= 0) return query;
    values.push(n);
    return query + ` LIMIT $${values.length}`;
};

const appendOffset = (query, values, offset) => {
    if (offset == null) return query;
    const n = Number.parseInt(offset, 10);
    if (Number.isNaN(n) || n < 0) return query;
    values.push(n);
    return query + ` OFFSET $${values.length}`;
};

export const listDocuments = async ({ brokerId, clientId, status, search, limit, offset, cursor }) => {
    const { values, whereClause } = buildDocumentFilters({ brokerId, clientId, status, search });
    const queryValues = [...values];
    const hasCursor = Boolean(cursor?.createdAt && cursor?.id);
    const countExpr = hasCursor ? '' : ',\n            COUNT(*) OVER() AS total_count';
    let query = `
        SELECT 
            d.id, 
            d.client_id as "clientId", 
            d.type, 
            d.company, 
            d.document_number as "documentNumber", 
            d.start_date as "startDate", 
            d.end_date as "endDate", 
            d.status, 
            d.attachment_name as "attachmentName", 
            d.notes,
            d.created_at as "createdAt",
            c.name as "clientName",
            c.person_type as "clientPersonType",
            c.cpf as "clientCpf",
            c.cnpj as "clientCnpj"${countExpr}
        FROM documents d
        JOIN clients c ON c.id = d.client_id
        ${whereClause}
    `;

    if (hasCursor) {
        query = appendCursorCondition(query, queryValues, cursor, Boolean(whereClause));
    }

    query += ' ORDER BY d.created_at DESC, d.id DESC';
    query = appendLimit(query, queryValues, limit);

    if (!hasCursor) {
        query = appendOffset(query, queryValues, offset);
    }

    const result = await pool.query(query, queryValues);
    const total = hasCursor ? 0 : (Number.parseInt(result.rows[0]?.total_count, 10) || 0);
    return { rows: result.rows, total };
};

export const findDocumentById = async (id, brokerId) => {
    const result = await pool.query(
        `SELECT d.id, d.client_id AS "clientId", d.type, d.company, d.document_number AS "documentNumber", d.start_date AS "startDate", d.end_date AS "endDate", d.status, d.attachment_name AS "attachmentName", d.notes, d.created_at AS "createdAt"
         FROM documents d
         WHERE d.id = $1 AND d.broker_id = $2`,
        [id, brokerId]
    );
    return result.rows[0];
};

export const createDocument = async ({
    id, clientId, brokerId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes
}) => {
    const result = await pool.query(
        `INSERT INTO documents (id, client_id, broker_id, type, company, document_number, start_date, end_date, status, attachment_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, clientId, brokerId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes]
    );
    return result.rowCount;
};

export const updateDocument = async ({
    id, brokerId, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes
}) => {
    await pool.query(
        `UPDATE documents
         SET client_id=$1, type=$2, company=$3, document_number=$4, start_date=$5, end_date=$6, status=$7, attachment_name=$8, notes=$9
         WHERE id=$10 AND broker_id=$11`,
        [clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes, id, brokerId]
    );
};

export const deleteDocument = async (id, brokerId) => {
    await pool.query(
        'DELETE FROM documents WHERE id = $1 AND broker_id = $2',
        [id, brokerId]
    );
};
