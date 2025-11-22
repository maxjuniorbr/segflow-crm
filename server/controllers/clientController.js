import pool from '../config/db.js';

const handleError = (res, err, context) => {
    console.error(`Error in ${context}:`, err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Erro ao processar requisição'
        : err.message;
    res.status(500).json({ error: message });
};
import { Client } from '../src/domain/entities/Client.js';

export const getClients = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM clients ORDER BY createdat DESC
        `);

        const clients = result.rows.map(row => Client.fromDatabase(row));

        res.json(clients);
    } catch (err) {
        handleError(res, err, 'getClients');
    }
};

export const getClientById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM clients WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        const client = Client.fromDatabase(result.rows[0]);

        res.json(client);
    } catch (err) {
        handleError(res, err, 'getClientById');
    }
};

export const createClient = async (req, res) => {
    let { id, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes } = req.body;

    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    // Convert empty strings to null for optional fields
    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;
    if (!cpf || cpf === '') cpf = null;
    if (!cnpj || cnpj === '') cnpj = null;
    if (!rg || rg === '') rg = null;
    if (!rgIssuer || rgIssuer === '') rgIssuer = null;
    if (!email || email === '') email = null;
    if (!phone || phone === '') phone = null;
    if (!notes || notes === '') notes = null;

    // Convert address object to JSON string for PostgreSQL
    const addressJson = address ? JSON.stringify(address) : null;

    try {
        // Check for duplicate CPF
        if (cpf && cpf.trim() !== '') {
            const cpfCheck = await pool.query(
                'SELECT id FROM clients WHERE cpf = $1',
                [cpf]
            );
            if (cpfCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['cpf'], message: 'CPF já cadastrado' }]
                });
            }
        }

        // Check for duplicate CNPJ
        if (cnpj && cnpj.trim() !== '') {
            const cnpjCheck = await pool.query(
                'SELECT id FROM clients WHERE cnpj = $1',
                [cnpj]
            );
            if (cnpjCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }]
                });
            }
        }

        await pool.query(
            `INSERT INTO clients (id, name, persontype, cpf, cnpj, rg, rgdispatchdate, rgissuer, birthdate, maritalstatus, email, phone, address, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [id, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes]
        );
        res.status(201).json({ message: 'Cliente criado' });
    } catch (err) {
        handleError(res, err, 'createClient');
    }
};

export const updateClient = async (req, res) => {
    let { name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes } = req.body;

    // Set defaults
    if (!personType) personType = 'Física';
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    // Convert empty strings to null for optional fields
    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;
    if (!cpf || cpf === '') cpf = null;
    if (!cnpj || cnpj === '') cnpj = null;
    if (!rg || rg === '') rg = null;
    if (!rgIssuer || rgIssuer === '') rgIssuer = null;
    if (!email || email === '') email = null;
    if (!phone || phone === '') phone = null;
    if (!notes || notes === '') notes = null;

    // Convert address object to JSON string for PostgreSQL
    const addressJson = address ? JSON.stringify(address) : null;

    try {
        // Check for duplicate CPF (excluding current client)
        if (cpf && cpf.trim() !== '') {
            const cpfCheck = await pool.query(
                'SELECT id FROM clients WHERE cpf = $1 AND id != $2',
                [cpf, req.params.id]
            );
            if (cpfCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['cpf'], message: 'CPF já cadastrado' }]
                });
            }
        }

        // Check for duplicate CNPJ (excluding current client)
        if (cnpj && cnpj.trim() !== '') {
            const cnpjCheck = await pool.query(
                'SELECT id FROM clients WHERE cnpj = $1 AND id != $2',
                [cnpj, req.params.id]
            );
            if (cnpjCheck.rows.length > 0) {
                return res.status(400).json({
                    error: [{ path: ['cnpj'], message: 'CNPJ já cadastrado' }]
                });
            }
        }

        await pool.query(
            `UPDATE clients SET name=$1, persontype=$2, cpf=$3, cnpj=$4, rg=$5, rgdispatchdate=$6, rgissuer=$7, birthdate=$8, maritalstatus=$9, email=$10, phone=$11, address=$12, notes=$13 WHERE id=$14`,
            [name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes, req.params.id]
        );
        res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (err) {
        handleError(res, err, 'updateClient');
    }
};

export const deleteClient = async (req, res) => {
    try {
        // Check for active proposals
        const proposalsCheck = await pool.query(
            "SELECT count(*) as count FROM documents WHERE clientid = $1 AND status != 'Cancelado'",
            [req.params.id]
        );

        if (proposalsCheck.rows[0].count > 0) {
            return res.status(400).json({ error: 'Não é possível excluir cliente com propostas ativas.' });
        }

        await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        res.json({ message: 'Cliente excluído' });
    } catch (err) {
        handleError(res, err, 'deleteClient');
    }
};
