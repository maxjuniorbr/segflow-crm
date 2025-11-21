import pool from '../config/db.js';

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
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

export const createDocument = async (req, res) => {
    const { id, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = req.body;
    try {
        await pool.query(
            `INSERT INTO documents (id, clientid, type, company, documentnumber, startdate, enddate, status, attachmentname, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [id, clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes]
        );
        res.status(201).json({ message: 'Documento criado' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create document' });
    }
};

export const updateDocument = async (req, res) => {
    const { clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes } = req.body;
    try {
        await pool.query(
            `UPDATE documents SET clientid=$1, type=$2, company=$3, documentnumber=$4, startdate=$5, enddate=$6, status=$7, attachmentname=$8, notes=$9 WHERE id=$10`,
            [clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes, req.params.id]
        );
        res.json({ message: 'Documento atualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update document' });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);
        res.json({ message: 'Documento excluído' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete document' });
    }
};
