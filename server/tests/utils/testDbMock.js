import pool from '../../config/db.js';

const state = {
    users: [],
    clients: [],
    documents: [],
    brokers: [],
};

let userIdSeq = 1;

const clone = (data) => JSON.parse(JSON.stringify(data));
const normalize = (text) => text.replace(/\s+/g, ' ').trim().toUpperCase();

export const resetTestDb = () => {
    state.users = [];
    state.clients = [];
    state.documents = [];
    state.brokers = [];
    userIdSeq = 1;
};

const findUserByEmail = (email) => state.users.filter(user => user.email === email);
const findUserByCpf = (cpf) => state.users.filter(user => user.cpf === cpf);

const selectClientByField = (field, value) => state.clients.filter(client => client[field] === value);
const selectBrokerByField = (field, value, excludeId) => state.brokers.filter(broker => broker[field] === value && (!excludeId || broker.id !== excludeId));

const insertClient = (params) => {
    const [id, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes] = params;
    const parsedAddress = addressJson ? (typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson) : null;
    const newClient = {
        id,
        name,
        persontype: personType,
        cpf,
        cnpj,
        rg,
        rgdispatchdate: rgDispatchDate,
        rgissuer: rgIssuer,
        birthdate: birthDate,
        maritalstatus: maritalStatus,
        email,
        phone,
        address: parsedAddress,
        notes,
        createdat: new Date().toISOString()
    };
    state.clients.push(newClient);
    return { rows: [], rowCount: 1 };
};

const insertUser = (params) => {
    const [name, cpf, email, password, username] = params;
    const newUser = {
        id: userIdSeq++,
        name,
        cpf,
        email,
        password,
        username,
        created_at: new Date().toISOString()
    };
    state.users.push(newUser);
    return { rows: [], rowCount: 1 };
};

const deleteUsersByEmail = (email) => {
    const before = state.users.length;
    state.users = state.users.filter(user => user.email !== email);
    return { rows: [], rowCount: before - state.users.length };
};

const deleteClientsByLike = (prefix) => {
    const before = state.clients.length;
    state.clients = state.clients.filter(client => !client.id.startsWith(prefix));
    return { rows: [], rowCount: before - state.clients.length };
};

const deleteClientById = (id) => {
    const before = state.clients.length;
    state.clients = state.clients.filter(client => client.id !== id);
    return { rows: [], rowCount: before - state.clients.length };
};

const selectClientsOrdered = () => {
    const rows = [...state.clients].sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
    return { rows: rows.map(clone), rowCount: rows.length };
};

const selectClientById = (id) => {
    const rows = state.clients.filter(client => client.id === id);
    return { rows: rows.map(clone), rowCount: rows.length };
};

const buildRows = (rows) => ({ rows: rows.map(clone), rowCount: rows.length });

const insertBroker = (params) => {
    const [id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile] = params;
    const newBroker = {
        id,
        corporatename: corporateName,
        tradename: tradeName,
        cnpj,
        susepcode: susepCode,
        contactname: contactName,
        email,
        phone,
        mobile,
        createdat: new Date().toISOString()
    };
    state.brokers.push(newBroker);
    return { rows: [], rowCount: 1 };
};

const updateBroker = (params) => {
    const [corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile, id] = params;
    const broker = state.brokers.find(b => b.id === id);
    if (broker) {
        broker.corporatename = corporateName;
        broker.tradename = tradeName;
        broker.cnpj = cnpj;
        broker.susepcode = susepCode;
        broker.contactname = contactName;
        broker.email = email;
        broker.phone = phone;
        broker.mobile = mobile;
    }
    return { rows: [], rowCount: broker ? 1 : 0 };
};

const selectBrokerById = (id) => {
    const rows = state.brokers.filter(broker => broker.id === id);
    return { rows: rows.map(clone), rowCount: rows.length };
};

const selectBrokersOrdered = () => {
    const rows = [...state.brokers].sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime());
    return { rows: rows.map(clone), rowCount: rows.length };
};

const handleQuery = (sql, params) => {
    if (sql.startsWith('SELECT * FROM USERS WHERE EMAIL = $1')) {
        return buildRows(findUserByEmail(params[0]));
    }

    if (sql.startsWith('SELECT * FROM USERS WHERE CPF = $1')) {
        return buildRows(findUserByCpf(params[0]));
    }

    if (sql.startsWith('SELECT PASSWORD FROM USERS WHERE ID = $1')) {
        const user = state.users.find(u => u.id === params[0]);
        return buildRows(user ? [{ password: user.password }] : []);
    }

    if (sql.startsWith('DELETE FROM USERS WHERE EMAIL = $1')) {
        return deleteUsersByEmail(params[0]);
    }

    if (sql.startsWith('INSERT INTO USERS')) {
        return insertUser(params);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CPF = $1')) {
        const rows = selectClientByField('cpf', params[0]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CNPJ = $1')) {
        const rows = selectClientByField('cnpj', params[0]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('INSERT INTO CLIENTS')) {
        return insertClient(params);
    }

    if (sql.startsWith('SELECT * FROM CLIENTS ORDER BY CREATEDAT DESC')) {
        return selectClientsOrdered();
    }

    if (sql.startsWith('SELECT * FROM CLIENTS WHERE ID = $1')) {
        return selectClientById(params[0]);
    }

    if (sql.startsWith("DELETE FROM CLIENTS WHERE ID LIKE 'TEST-")) {
        return deleteClientsByLike('test-');
    }

    if (sql.startsWith('DELETE FROM CLIENTS WHERE ID = $1')) {
        return deleteClientById(params[0]);
    }

    if (sql.startsWith('SELECT * FROM BROKERS ORDER BY CREATEDAT DESC')) {
        return selectBrokersOrdered();
    }

    if (sql.startsWith('SELECT * FROM BROKERS WHERE ID = $1')) {
        return selectBrokerById(params[0]);
    }

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE CNPJ = $1 AND ID != $2')) {
        const rows = selectBrokerByField('cnpj', params[0], params[1]).map(broker => ({ id: broker.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE CNPJ = $1')) {
        const rows = selectBrokerByField('cnpj', params[0]).map(broker => ({ id: broker.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE SUSEPCODE = $1 AND ID != $2')) {
        const rows = selectBrokerByField('susepcode', params[0], params[1]).map(broker => ({ id: broker.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE SUSEPCODE = $1')) {
        const rows = selectBrokerByField('susepcode', params[0]).map(broker => ({ id: broker.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('INSERT INTO BROKERS')) {
        return insertBroker(params);
    }

    if (sql.startsWith('UPDATE BROKERS SET')) {
        return updateBroker(params);
    }

    if (sql.startsWith('DELETE FROM BROKERS WHERE ID = $1')) {
        const before = state.brokers.length;
        state.brokers = state.brokers.filter(broker => broker.id !== params[0]);
        return { rows: [], rowCount: before - state.brokers.length };
    }

    throw new Error(`Test DB mock does not support query: ${sql}`);
};

export const setupTestDb = () => {
    if (pool.__isTestMock) {
        resetTestDb();
        return;
    }

    pool.__isTestMock = true;
    const originalQuery = pool.query.bind(pool);

    pool.query = async (text, params = []) => {
        if (process.env.NODE_ENV !== 'test') {
            return originalQuery(text, params);
        }
        const normalized = normalize(text);
        return handleQuery(normalized, params);
    };

    pool.end = async () => {
        resetTestDb();
    };

    resetTestDb();
};
