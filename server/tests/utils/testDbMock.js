import pool from '../../config/db.js';

const state = {
    users: [],
    clients: [],
    documents: [],
    brokers: [],
    refreshTokens: [],
};

let userIdSeq = 1;

const clone = (data) => JSON.parse(JSON.stringify(data));
const normalize = (text) => text.replace(/\s+/g, ' ').trim().toUpperCase();

export const resetTestDb = () => {
    state.users = [];
    state.clients = [];
    state.documents = [];
    state.brokers = [];
    state.refreshTokens = [];
    userIdSeq = 1;
};

const findUserByEmail = (email) => state.users.filter(user => user.email === email);
const findUserByCpf = (cpf) => state.users.filter(user => user.cpf === cpf);
const matchesId = (value, target) => String(value) === String(target);
const selectUserById = (id, brokerId) =>
    state.users.filter(user => matchesId(user.id, id) && (!brokerId || user.broker_id === brokerId));

const selectClientByField = (field, value, brokerId) =>
    state.clients.filter(client => client[field] === value && (!brokerId || client.broker_id === brokerId));
const selectBrokerByField = (field, value, excludeId) => state.brokers.filter(broker => broker[field] === value && (!excludeId || broker.id !== excludeId));

const insertClient = (params) => {
    const [id, brokerId, name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, addressJson, notes] = params;
    const parsedAddress = addressJson ? (typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson) : null;
    const newClient = {
        id,
        broker_id: brokerId,
        name,
        person_type: personType,
        cpf,
        cnpj,
        rg,
        rg_dispatch_date: rgDispatchDate,
        rg_issuer: rgIssuer,
        birth_date: birthDate,
        marital_status: maritalStatus,
        email,
        phone,
        address: parsedAddress,
        notes,
        created_at: new Date().toISOString()
    };
    state.clients.push(newClient);
    return { rows: [], rowCount: 1 };
};

const insertUser = (params) => {
    const [brokerId, name, cpf, email, password, username] = params;
    const newUser = {
        id: userIdSeq++,
        broker_id: brokerId,
        name,
        cpf,
        email,
        password,
        username,
        created_at: new Date().toISOString()
    };
    state.users.push(newUser);
    return { rows: [{ id: newUser.id }], rowCount: 1 };
};

const deleteUsersByEmail = (email) => {
    const before = state.users.length;
    state.users = state.users.filter(user => user.email !== email);
    return { rows: [], rowCount: before - state.users.length };
};

const updateUserPassword = (params) => {
    const [password, id, brokerId] = params;
    const user = state.users.find(u => matchesId(u.id, id) && u.broker_id === brokerId);
    if (user) {
        user.password = password;
    }
    return { rows: [], rowCount: user ? 1 : 0 };
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

const selectClientsOrdered = (brokerId) => {
    const rows = state.clients
        .filter(client => !brokerId || client.broker_id === brokerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: rows.map(clone), rowCount: rows.length };
};

const selectClientById = (id, brokerId) => {
    const rows = state.clients.filter(client => client.id === id && (!brokerId || client.broker_id === brokerId));
    return { rows: rows.map(clone), rowCount: rows.length };
};

const buildRows = (rows) => ({ rows: rows.map(clone), rowCount: rows.length });

const insertBroker = (params) => {
    const [id, corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile] = params;
    const newBroker = {
        id,
        corporate_name: corporateName,
        trade_name: tradeName,
        cnpj,
        susep_code: susepCode,
        contact_name: contactName,
        email,
        phone,
        mobile,
        created_at: new Date().toISOString()
    };
    state.brokers.push(newBroker);
    return { rows: [], rowCount: 1 };
};

const updateBroker = (params) => {
    const [corporateName, tradeName, cnpj, susepCode, contactName, email, phone, mobile, id] = params;
    const broker = state.brokers.find(b => b.id === id);
    if (broker) {
        broker.corporate_name = corporateName;
        broker.trade_name = tradeName;
        broker.cnpj = cnpj;
        broker.susep_code = susepCode;
        broker.contact_name = contactName;
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
    const rows = [...state.brokers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: rows.map(clone), rowCount: rows.length };
};

const handleQuery = (sql, params) => {
    if (sql.includes('FROM USERS WHERE EMAIL = $1') && !sql.includes('ID !=')) {
        const rows = findUserByEmail(params[0]);
        if (sql.includes('PASSWORD')) {
            return buildRows(rows);
        }
        return buildRows(rows.map(({ password: _, ...rest }) => rest));
    }

    if (sql.includes('FROM USERS WHERE CPF = $1') && sql.includes('BROKER_ID = $2') && !sql.includes('ID !=')) {
        const rows = findUserByCpf(params[0]).filter(u => u.broker_id === params[1]);
        if (sql.includes('PASSWORD')) {
            return buildRows(rows);
        }
        return buildRows(rows.map(({ password: _, ...rest }) => rest));
    }

    if (sql.includes('FROM USERS WHERE CPF = $1') && !sql.includes('BROKER_ID') && !sql.includes('ID !=')) {
        const rows = findUserByCpf(params[0]);
        if (sql.includes('PASSWORD')) {
            return buildRows(rows);
        }
        return buildRows(rows.map(({ password: _, ...rest }) => rest));
    }

    if (sql.startsWith('SELECT ID, BROKER_ID, EMAIL FROM USERS WHERE ID = $1')) {
        const rows = state.users
            .filter(u => matchesId(u.id, params[0]))
            .map(u => ({ id: u.id, broker_id: u.broker_id, email: u.email }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID, BROKER_ID, NAME, CPF, EMAIL, USERNAME, CREATED_AT FROM USERS WHERE ID = $1 AND BROKER_ID = $2')) {
        const rows = selectUserById(params[0], params[1]).map(({ password: _, ...rest }) => rest);
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID, BROKER_ID, NAME, CPF, EMAIL, USERNAME, CREATED_AT FROM USERS WHERE BROKER_ID = $1')) {
        const rows = state.users
            .filter(user => user.broker_id === params[0])
            .map(({ password: _, ...rest }) => rest)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT PASSWORD FROM USERS WHERE ID = $1')) {
        const user = params.length > 1
            ? state.users.find(u => matchesId(u.id, params[0]) && u.broker_id === params[1])
            : state.users.find(u => matchesId(u.id, params[0]));
        return buildRows(user ? [{ password: user.password }] : []);
    }

    if (sql.startsWith('UPDATE USERS SET PASSWORD = $1 WHERE ID = $2 AND BROKER_ID = $3')) {
        return updateUserPassword(params);
    }

    if (sql.startsWith('UPDATE USERS SET') && !sql.includes('PASSWORD = $1 WHERE')) {
        const user = state.users.find(u => matchesId(u.id, params[params.length - 2]) && u.broker_id === params[params.length - 1]);
        if (user) {
            if (sql.includes('NAME')) user.name = params[0];
            if (sql.includes('EMAIL')) user.email = params.find((_, i) => sql.includes(`EMAIL=$${i+1}`) || sql.includes(`EMAIL = $${i+1}`)) || user.email;
        }
        return { rows: [], rowCount: user ? 1 : 0 };
    }

    if (sql.startsWith('DELETE FROM USERS WHERE EMAIL = $1')) {
        return deleteUsersByEmail(params[0]);
    }

    if (sql.startsWith('INSERT INTO USERS')) {
        return insertUser(params);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CPF = $1 AND BROKER_ID = $2')) {
        const rows = selectClientByField('cpf', params[0], params[1]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CPF = $1')) {
        const rows = selectClientByField('cpf', params[0]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CNPJ = $1 AND BROKER_ID = $2')) {
        const rows = selectClientByField('cnpj', params[0], params[1]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM CLIENTS WHERE CNPJ = $1')) {
        const rows = selectClientByField('cnpj', params[0]).map(client => ({ id: client.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('INSERT INTO CLIENTS')) {
        return insertClient(params);
    }

    if (sql.includes('FROM CLIENTS') && !sql.includes('FROM DOCUMENTS') && !sql.includes('SELECT ID FROM CLIENTS') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE')) {
        if (sql.includes('WHERE ID = $1 AND BROKER_ID = $2')) {
            return selectClientById(params[0], params[1]);
        }
        if (sql.includes('WHERE ID = $1')) {
            return selectClientById(params[0]);
        }
        const brokerIdIndex = sql.includes('BROKER_ID = $1') ? 0 : null;
        const brokerId = brokerIdIndex !== null ? params[brokerIdIndex] : null;
        const personType = params.find(param => param === 'Física' || param === 'Jurídica');
        let rows = state.clients
            .filter(client => !brokerId || client.broker_id === brokerId)
            .filter(client => !personType || client.person_type === personType)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const totalCount = rows.length;
        if (sql.includes('LIMIT') && params.length >= 2) {
            const limit = params[params.length - 2];
            const offset = params[params.length - 1];
            if (Number.isFinite(Number(offset)) && Number(offset) > 0) {
                rows = rows.slice(Number(offset));
            }
            if (Number.isFinite(Number(limit)) && Number(limit) > 0) {
                rows = rows.slice(0, Number(limit));
            }
        }
        const hasCountOver = sql.includes('COUNT(*) OVER()');
        return { rows: rows.map(r => hasCountOver ? { ...clone(r), total_count: totalCount } : clone(r)), rowCount: rows.length };
    }

    if (sql.startsWith('UPDATE CLIENTS SET')) {
        const [name, personType, cpf, cnpj, rg, rgDispatchDate, rgIssuer, birthDate, maritalStatus, email, phone, address, notes, id, brokerId] = params;
        const client = state.clients.find(c => c.id === id && c.broker_id === brokerId);
        if (client) {
            Object.assign(client, {
                name, person_type: personType, cpf, cnpj, rg,
                rg_dispatch_date: rgDispatchDate, rg_issuer: rgIssuer,
                birth_date: birthDate, marital_status: maritalStatus,
                email, phone,
                address: address ? (typeof address === 'string' ? JSON.parse(address) : address) : null,
                notes
            });
        }
        return { rows: [], rowCount: client ? 1 : 0 };
    }

    if (sql.startsWith("DELETE FROM CLIENTS WHERE ID LIKE 'TEST-")) {
        return deleteClientsByLike('test-');
    }

    if (sql.startsWith('DELETE FROM CLIENTS WHERE ID = $1')) {
        return deleteClientById(params[0]);
    }

    if (sql.includes('FROM BROKERS WHERE ID = $1') && sql.includes('ORDER BY CREATED_AT DESC') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE') && !sql.includes('SELECT ID FROM')) {
        return selectBrokerById(params[0]);
    }

    if (sql.includes('FROM BROKERS') && sql.includes('ORDER BY CREATED_AT DESC') && !sql.includes('WHERE') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE') && !sql.includes('SELECT ID FROM')) {
        return selectBrokersOrdered();
    }

    if (sql.includes('FROM BROKERS WHERE ID = $1') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE') && !sql.includes('SELECT ID FROM')) {
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

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE SUSEP_CODE = $1 AND ID != $2')) {
        const rows = selectBrokerByField('susep_code', params[0], params[1]).map(broker => ({ id: broker.id }));
        return buildRows(rows);
    }

    if (sql.startsWith('SELECT ID FROM BROKERS WHERE SUSEP_CODE = $1')) {
        const rows = selectBrokerByField('susep_code', params[0]).map(broker => ({ id: broker.id }));
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

    if (sql.includes('FROM DOCUMENTS D') && sql.includes('WHERE D.ID = $1') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE')) {
        const doc = state.documents.find(d => d.id === params[0]);
        if (!doc) return buildRows([]);
        if (params[1] && doc.broker_id !== params[1]) return buildRows([]);
        return buildRows([clone(doc)]);
    }

    if (sql.includes('FROM DOCUMENTS D') && !sql.includes('WHERE D.ID = $1') && !sql.includes('INSERT') && !sql.includes('DELETE') && !sql.includes('UPDATE')) {
        let docs = [...state.documents];
        if (sql.includes('BROKER_ID = $1')) {
            const brokerId = params[0];
            docs = docs.filter(d => d.broker_id === brokerId);
        }
        const totalCount = docs.length;
        docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (sql.includes('LIMIT') && params.length >= 2) {
            const limit = params[params.length - 2];
            const offset = params[params.length - 1];
            if (Number.isFinite(Number(offset)) && Number(offset) > 0) {
                docs = docs.slice(Number(offset));
            }
            if (Number.isFinite(Number(limit)) && Number(limit) > 0) {
                docs = docs.slice(0, Number(limit));
            }
        }
        const hasCountOver = sql.includes('COUNT(*) OVER()');
        return { rows: docs.map(d => hasCountOver ? { ...clone(d), total_count: totalCount } : clone(d)), rowCount: docs.length };
    }

    if (sql.includes('COUNT(*)') && sql.includes('FROM DOCUMENTS') && !sql.includes('OVER()')) {
        let docs = [...state.documents];
        if (params.length > 0) {
            const client = state.clients.find(c => c.id === params[0]);
            if (client) {
                docs = docs.filter(d => d.client_id === params[0] && d.status !== 'Cancelado');
            }
        }
        return { rows: [{ count: docs.length }], rowCount: 1 };
    }

    if (sql.startsWith('INSERT INTO DOCUMENTS')) {
        const [id, clientId, brokerId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes] = params;
        state.documents.push({
            id, client_id: clientId, broker_id: brokerId, type, company, document_number: documentNumber,
            start_date: startDate, end_date: endDate, status, attachment_name: attachmentName,
            notes, created_at: new Date().toISOString()
        });
        return { rows: [], rowCount: 1 };
    }

    if (sql.startsWith('UPDATE DOCUMENTS')) {
        const [clientId, type, company, documentNumber, startDate, endDate, status, attachmentName, notes, id, brokerId] = params;
        const doc = state.documents.find(d => d.id === id && d.broker_id === brokerId);
        if (doc) {
            Object.assign(doc, {
                client_id: clientId, type, company,
                document_number: documentNumber,
                start_date: startDate, end_date: endDate,
                status, attachment_name: attachmentName, notes
            });
            return { rows: [], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }

    if (sql.startsWith('DELETE FROM DOCUMENTS')) {
        const docId = params[0];
        const brokerId = params[1];
        const before = state.documents.length;
        state.documents = state.documents.filter(d => !(d.id === docId && (!brokerId || d.broker_id === brokerId)));
        return { rows: [], rowCount: before - state.documents.length };
    }

    if (sql.startsWith('INSERT INTO REFRESH_TOKENS')) {
        const [userId, tokenHash, expiresAt] = params;
        state.refreshTokens.push({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt, revoked: false, created_at: new Date().toISOString() });
        return { rows: [], rowCount: 1 };
    }

    if (sql.startsWith('UPDATE REFRESH_TOKENS SET REVOKED = TRUE WHERE TOKEN_HASH = $1 AND REVOKED = FALSE')) {
        const token = state.refreshTokens.find(t => t.token_hash === params[0] && !t.revoked);
        if (token) {
            token.revoked = true;
            return { rows: [clone(token)], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }

    if (sql.startsWith('SELECT USER_ID FROM REFRESH_TOKENS WHERE TOKEN_HASH = $1 AND REVOKED = TRUE')) {
        const rows = state.refreshTokens.filter(t => t.token_hash === params[0] && t.revoked);
        return buildRows(rows.map(t => ({ user_id: t.user_id })));
    }

    if (sql.startsWith('SELECT ID, USER_ID, TOKEN_HASH, EXPIRES_AT FROM REFRESH_TOKENS WHERE TOKEN_HASH = $1')) {
        const rows = state.refreshTokens.filter(t => t.token_hash === params[0]);
        return buildRows(rows);
    }

    if (sql.startsWith('DELETE FROM REFRESH_TOKENS WHERE TOKEN_HASH = $1')) {
        const deleted = state.refreshTokens.filter(t => t.token_hash === params[0]);
        state.refreshTokens = state.refreshTokens.filter(t => t.token_hash !== params[0]);
        if (sql.includes('RETURNING')) {
            return { rows: deleted.map(clone), rowCount: deleted.length };
        }
        return { rows: [], rowCount: deleted.length };
    }

    if (sql.startsWith('DELETE FROM REFRESH_TOKENS WHERE USER_ID = $1')) {
        const before = state.refreshTokens.length;
        state.refreshTokens = state.refreshTokens.filter(t => t.user_id !== params[0]);
        return { rows: [], rowCount: before - state.refreshTokens.length };
    }

    if (sql.startsWith('DELETE FROM REFRESH_TOKENS WHERE EXPIRES_AT')) {
        const now = new Date();
        const before = state.refreshTokens.length;
        state.refreshTokens = state.refreshTokens.filter(t => new Date(t.expires_at) >= now && !t.revoked);
        return { rows: [], rowCount: before - state.refreshTokens.length };
    }

    if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
        return { rows: [], rowCount: 0 };
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

    const mockQuery = async (text, params = []) => {
        if (process.env.NODE_ENV !== 'test') {
            return originalQuery(text, params);
        }
        const normalized = normalize(text);
        return handleQuery(normalized, params);
    };

    pool.query = mockQuery;

    pool.connect = async () => ({
        query: mockQuery,
        release: () => {},
    });

    pool.end = async () => {
        resetTestDb();
    };

    resetTestDb();
};
