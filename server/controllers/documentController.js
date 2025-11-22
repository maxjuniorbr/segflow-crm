import pool from '../config/db.js';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};

export const getDocuments = async (req, res) => {
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
            ORDER BY createdat DESC
        `);
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

    // Convert empty strings to null for optional fields
    if (!company || company === '') company = null;
    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (startDate === '') startDate = null;
    if (endDate === '') endDate = null;
    if (!attachmentName || attachmentName === '') attachmentName = null;
    if (!notes || notes === '') notes = null;

    try {
        await pool.query(
            `INSERT INTO documents (id, clientid, type, company, documentnumber, startdate, enddate, status, attachmentname, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes]
        );
        res.status(201).json({ message: 'Documento criado' });
    } catch (err) {
        handleError(res, err, 'createDocument');
    }
};

export const updateDocument = async (req, res) => {
    let { clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = req.body;

    // Convert empty strings to null for optional fields
    if (!company || company === '') company = null;
    if (!documentNumber || documentNumber === '') documentNumber = null;
    if (startDate === '') startDate = null;
    if (endDate === '') endDate = null;
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
