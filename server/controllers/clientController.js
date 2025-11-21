import pool from '../config/db.js';

export const getClients = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                cpf, 
                rg, 
                rgdispatchdate as "rgDispatchDate", 
                rgissuer as "rgIssuer", 
                birthdate as "birthDate", 
                maritalstatus as "maritalStatus", 
                email, 
                phone, 
                address, 
                createdat as "createdAt",
                notes
            FROM clients
            ORDER BY createdat DESC
        `);

        // Parse address JSON field if it exists
        const clients = result.rows.map(client => ({
            ...client,
            address: typeof client.address === 'string' ? JSON.parse(client.address) : client.address
        }));

        res.json(clients);
    } catch (err) {
        console.error('getClients error:', err);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
};

export const getClientById = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                cpf, 
                rg, 
                rgdispatchdate as "rgDispatchDate", 
                rgissuer as "rgIssuer", 
                birthdate as "birthDate", 
                maritalstatus as "maritalStatus", 
                email, 
                phone, 
                address, 
                createdat as "createdAt",
                notes
            FROM clients 
            WHERE id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado' });
        }

        const client = {
            ...result.rows[0],
            address: typeof result.rows[0].address === 'string'
                ? JSON.parse(result.rows[0].address)
                : result.rows[0].address
        };

        res.json(client);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch client' });
    }
};

export const createClient = async (req, res) => {
    let { id, name, cpf, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes } = req.body;

    // Set defaults
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    // Convert empty strings to null for optional date fields
    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;

    // Convert address object to JSON string for PostgreSQL
    const addressJson = address ? JSON.stringify(address) : null;

    try {
        await pool.query(
            `INSERT INTO clients (id, name, cpf, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [id, name, cpf, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes]
        );
        res.status(201).json({ message: 'Cliente criado' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create client' });
    }
};

export const updateClient = async (req, res) => {
    let { name, cpf, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes } = req.body;

    // Set defaults
    if (!maritalStatus) maritalStatus = 'Solteiro(a)';

    // Convert empty strings to null for optional date fields
    if (rgDispatchDate === '') rgDispatchDate = null;
    if (birthDate === '') birthDate = null;

    // Convert address object to JSON string for PostgreSQL
    const addressJson = address ? JSON.stringify(address) : null;

    try {
        await pool.query(
            `UPDATE clients SET name=$1, cpf=$2, rg=$3, rgDispatchDate=$4, rgIssuer=$5, birthDate=$6, maritalStatus=$7, email=$8, phone=$9, address=$10, notes=$11 WHERE id=$12`,
            [name, cpf, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes, req.params.id]
        );
        res.json({ message: 'Cliente atualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update client' });
    }
};

export const deleteClient = async (req, res) => {
    try {
        // Check for active proposals
        const proposalsCheck = await pool.query(
            "SELECT count(*) as count FROM documents WHERE clientId = $1 AND status != 'Cancelado'",
            [req.params.id]
        );

        if (proposalsCheck.rows[0].count > 0) {
            return res.status(400).json({ error: 'Não é possível excluir cliente com propostas ativas.' });
        }

        await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
        res.json({ message: 'Cliente excluído' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
