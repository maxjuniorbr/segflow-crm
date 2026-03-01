export const buildClientRow = (overrides = {}) => ({
    id: 'cli-1',
    name: 'João',
    person_type: 'Física',
    cpf: '123',
    cnpj: null,
    rg: '12',
    rg_dispatch_date: null,
    rg_issuer: null,
    birth_date: '1990-01-01',
    marital_status: 'Solteiro(a)',
    email: 'joao@example.com',
    phone: '11999999999',
    address: JSON.stringify({ city: 'SP' }),
    notes: null,
    created_at: '2024-01-01',
    ...overrides
});

export const buildUserRow = (overrides = {}) => ({
    id: 1,
    name: 'Admin',
    cpf: '11122233344',
    email: 'admin@example.com',
    username: 'admin',
    password: 'hash',
    created_at: '2024-01-01',
    ...overrides
});

export const buildBrokerRow = (overrides = {}) => ({
    id: 'bro-1',
    corporate_name: 'Razão Social',
    trade_name: 'Nome Fantasia',
    cnpj: '12345678000190',
    susep_code: '12345',
    contact_name: 'Contato',
    email: 'corretora@example.com',
    phone: '1130002000',
    mobile: '11999999999',
    created_at: '2024-01-02',
    ...overrides
});

export const buildBrokerRegistrationPayload = (overrides = {}) => ({
    corporateName: 'Test Corretora',
    tradeName: 'Test',
    cnpj: '11222333000181',
    susepCode: '10.000001',
    phone: '11999990000',
    mobile: '11999990001',
    email: 'novo@example.com',
    contactName: 'Novo User',
    cpf: '52998224725',
    password: 'SenhaForte123',
    ...overrides
});
