import pool from '../config/db.js';
import { randomUUID } from 'crypto';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};

export const getDocuments = async (req, res) => {
    const { clientId, status, search, limit, offset } = req.query;

    const values = [];
    const conditions = [];

    let query = `
        SELECT 
            d.id, 
            d.clientid as "clientId", 
            d.type, 
            d.company, 
            d.documentnumber as "documentNumber", 
            d.startdate as "startDate", 
            d.enddate as "endDate", 
            d.status, 
            d.attachmentname as "attachmentName", 
            d.notes,
            d.createdat as "createdAt"
        FROM documents d
        LEFT JOIN clients c ON c.id = d.clientid
    `;

    if (clientId) {
        values.push(clientId);
        conditions.push(`d.clientid = $${values.length}`);
    }

    if (status) {
        values.push(status);
        conditions.push(`d.status = $${values.length}`);
    }

    if (search) {
        const normalized = search.toLowerCase();
        values.push(`%${normalized}%`);
        const param = `$${values.length}`;
        conditions.push(`(
            LOWER(d.documentnumber) LIKE ${param}
            OR LOWER(d.company) LIKE ${param}
            OR LOWER(d.status) LIKE ${param}
            OR LOWER(COALESCE(c.name, '')) LIKE ${param}
        )`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY d.createdat DESC';

    if (limit) {
        const limitNumber = parseInt(limit, 10);
        if (!isNaN(limitNumber) && limitNumber > 0) {
            values.push(limitNumber);
            query += ` LIMIT $${values.length}`;
        }
    }

    if (offset) {
        const offsetNumber = parseInt(offset, 10);
        if (!isNaN(offsetNumber) && offsetNumber >= 0) {
            values.push(offsetNumber);
            query += ` OFFSET $${values.length}`;
        }
    }

    try {
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        handleError(res, err, 'getDocuments');
    }
};

export const getDocumentById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                clientid as "clientId", 
                type, 
                company, 
                documentnumber as "documentNumber", 
                startdate as "startDate", 
                enddate as "endDate", 
                status, 
                attachmentname as "attachmentName", 
                notes,
                createdat as "createdAt"
            FROM documents
            WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Documento não encontrado' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        handleError(res, err, 'getDocumentById');
    }
};

export const createDocument = async (req, res) => {
    let { id, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = req.body;
    const documentId = id || randomUUID();

    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (!attachmentName || attachmentName === '') attachmentName = null;
    if (!notes || notes === '') notes = null;

    try {
        await pool.query(
            `INSERT INTO documents (id, clientid, type, company, documentnumber, startdate, enddate, status, attachmentname, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [documentId, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes]
        );
        res.status(201).json({ message: 'Documento criado', id: documentId });
    } catch (err) {
        handleError(res, err, 'createDocument');
    }
};

export const updateDocument = async (req, res) => {
    let { clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = req.body;

    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (!attachmentName || attachmentName === '') attachmentName = null;
    if (!notes || notes === '') notes = null;

    try {
        await pool.query(
            `UPDATE documents SET clientid=$1, type=$2, company=$3, documentnumber=$4, startdate=$5, enddate=$6, status=$7, attachmentname=$8, notes=$9 WHERE id=$10`,
            [clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes, req.params.id]
        );
        res.json({ message: 'Documento atualizado' });
    } catch (err) {
        handleError(res, err, 'updateDocument');
    }
};

export const deleteDocument = async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
        res.json({ message: 'Documento excluído' });
    } catch (err) {
        handleError(res, err, 'deleteDocument');
    }
};
