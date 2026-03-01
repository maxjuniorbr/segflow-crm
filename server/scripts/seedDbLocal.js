import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

if (process.env.NODE_ENV === 'production') {
  console.error('This seed script should not run in production.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing in .env');
  process.exit(1);
}

const camelToSnake = (str) => str.replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);

const insertRow = async (pgClient, table, data) => {
  const entries = Object.entries(data);
  const columns = entries.map(([k]) => camelToSnake(k));
  const values = entries.map(([, v]) => v);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  await pgClient.query(
    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
    values
  );
};

const insertBatch = async (pgClient, table, rows) => {
  for (const row of rows) {
    await insertRow(pgClient, table, row);
  }
};

const addr = (zipCode, street, number, complement, neighborhood, city, state) =>
  ({ zipCode, street, number, complement, neighborhood, city, state });

const doc = (id, type, company, documentNumber, startDate, endDate, status, attachmentName, notes) =>
  ({ id, type, company, documentNumber, startDate, endDate, status, attachmentName, notes });

const adminPassword = 'lucas8bc';

const brokerSeed = [
  {
    id: 'b0000001-0000-4000-a000-000000000001',
    corporateName: 'Atlas Corretora de Seguros LTDA',
    tradeName: 'Atlas Seguros',
    cnpj: '45.173.839/0001-20',
    susepCode: '10.123456',
    contactName: 'Lucas Admin',
    email: 'lucas@atlasseguros.com.br',
    phone: '(11) 4000-1234',
    mobile: '(11) 98888-2000',
    user: {
      name: 'Lucas Admin',
      cpf: '529.982.247-25',
      email: 'lucas@atlasseguros.com.br',
      username: 'lucas'
    }
  },
  {
    id: 'b0000002-0000-4000-a000-000000000002',
    corporateName: 'Nordeste Proteção e Serviços LTDA',
    tradeName: 'Nordeste Proteção',
    cnpj: '28.903.544/0001-87',
    susepCode: '20.987654',
    contactName: 'Paula Souza',
    email: 'paula@nordesteprotecao.com.br',
    phone: '(81) 3777-9090',
    mobile: '(81) 98111-3344',
    user: {
      name: 'Paula Souza',
      cpf: '123.456.789-09',
      email: 'paula@nordesteprotecao.com.br',
      username: 'paula'
    }
  }
];

const clientSeed = [
  // ========== Clientes da Atlas (broker 1) ==========
  {
    id: 'c0000001-0000-4000-a000-000000000001',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Marina Soares',
    personType: 'Física',
    cpf: '733.953.360-05',
    cnpj: null,
    rg: '45.123.789-0',
    rgIssuer: 'SSP-SP',
    rgDispatchDate: '2007-05-12',
    birthDate: '1988-03-12',
    maritalStatus: 'Casada',
    email: 'marina.soares@example.com',
    phone: '(11) 98888-1001',
    address: addr('04094-050', 'Rua Inhambu', '920', 'Ap 82', 'Moema', 'São Paulo', 'SP'),
    notes: 'Cliente com foco em renovações automotivas.',
    documents: [
      doc('d0000001-0000-4000-a000-000000000001', 'Auto', 'Porto Seguro',
        'AUTO-2024-001', '2025-12-01', '2026-11-30',
        'Apólice', 'auto-marina-2024.pdf', 'Cobertura completa com carro reserva.'),
      doc('d0000002-0000-4000-a000-000000000002', 'Vida', 'SulAmérica',
        'VIDA-2023-014', '2025-12-15', '2026-12-14',
        'Proposta', 'vida-marina.pdf', 'Aguardando assinatura digital.')
    ]
  },
  {
    id: 'c0000002-0000-4000-a000-000000000002',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Gustavo Azevedo',
    personType: 'Física',
    cpf: '834.796.124-70',
    cnpj: null,
    rg: '23.991.110-3',
    rgIssuer: 'DETRAN-RJ',
    rgDispatchDate: '2010-04-08',
    birthDate: '1984-07-21',
    maritalStatus: 'Casado',
    email: 'gustavo.azevedo@example.com',
    phone: '(21) 97777-3322',
    address: addr('20040-020', 'Avenida Rio Branco', '123', 'Sala 1004', 'Centro', 'Rio de Janeiro', 'RJ'),
    notes: 'Empresário do setor de tecnologia.',
    documents: [
      doc('d0000003-0000-4000-a000-000000000003', 'Residencial', 'Bradesco Seguros',
        'RES-2024-045', '2025-11-10', '2026-11-09',
        'Apólice', 'residencial-gustavo.pdf', 'Apartamento na região central.')
    ]
  },
  {
    id: 'c0000003-0000-4000-a000-000000000003',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Clara Batista',
    personType: 'Física',
    cpf: '160.993.548-09',
    cnpj: null,
    rg: '47.201.456-8',
    rgIssuer: 'SSP-MG',
    rgDispatchDate: '2013-11-19',
    birthDate: '1990-02-05',
    maritalStatus: 'Solteira',
    email: 'clara.batista@example.com',
    phone: '(31) 98800-4445',
    address: addr('30130-010', 'Rua da Bahia', '600', 'Ap 301', 'Funcionários', 'Belo Horizonte', 'MG'),
    notes: 'Profissional liberal e viajante frequente.',
    documents: [
      doc('d0000004-0000-4000-a000-000000000004', 'Viagem', 'Allianz',
        'TRAVEL-2024-012', '2026-02-01', '2026-04-30',
        'Apólice', 'viagem-clara.pdf', 'Plano anual com cobertura global.')
    ]
  },
  {
    id: 'c0000004-0000-4000-a000-000000000004',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Inova Bank S.A.',
    personType: 'Jurídica',
    cpf: null,
    cnpj: '11.692.209/7096-26',
    rg: null,
    rgIssuer: null,
    rgDispatchDate: null,
    birthDate: null,
    maritalStatus: null,
    email: 'suporte@inovabank.com.br',
    phone: '(11) 3003-8080',
    address: addr('01310-200', 'Avenida Paulista', '1578', 'Torre Norte', 'Bela Vista', 'São Paulo', 'SP'),
    notes: 'Cliente PJ com demandas recorrentes de grandes apólices.',
    documents: [
      doc('d0000005-0000-4000-a000-000000000005', 'Patrimonial', 'Tokio Marine',
        'PATR-2024-220', '2025-12-01', '2026-12-01',
        'Apólice', 'patrimonial-inova.pdf', 'Cobertura da sede administrativa.'),
      doc('d0000006-0000-4000-a000-000000000006', 'Responsabilidade Civil', 'HDI',
        'RC-2024-031', '2026-01-01', '2026-12-31',
        'Apólice', 'rc-inova.pdf', 'Cobertura para diretores e executivos.'),
      doc('d0000011-0000-4000-a000-000000000011', 'Garantia', 'Junto Seguros',
        'GAR-2024-001', '2025-11-15', '2026-11-14',
        'Apólice', 'garantia-inova.pdf', 'Garantia judicial para processo trabalhista.')
    ]
  },
  {
    id: 'c0000005-0000-4000-a000-000000000005',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Fernanda Pires',
    personType: 'Física',
    cpf: '843.393.124-97',
    cnpj: null,
    rg: '31.102.778-5',
    rgIssuer: 'SSP-BA',
    rgDispatchDate: '2009-09-03',
    birthDate: '1982-12-18',
    maritalStatus: 'Divorciada',
    email: 'fernanda.pires@example.com',
    phone: '(71) 99122-6677',
    address: addr('40015-010', 'Rua Chile', '20', 'Cobertura', 'Centro Histórico', 'Salvador', 'BA'),
    notes: 'Cliente interessada em planos familiares.',
    documents: [
      doc('d0000007-0000-4000-a000-000000000007', 'Saúde', 'Bradesco Saúde',
        'SAUDE-2024-088', '2025-12-10', '2026-12-09',
        'Apólice', 'saude-fernanda.pdf', 'Plano familiar com 3 dependentes.')
    ]
  },
  {
    id: 'c0000006-0000-4000-a000-000000000006',
    brokerId: 'b0000001-0000-4000-a000-000000000001',
    name: 'Roberto Almeida',
    personType: 'Física',
    cpf: '222.333.444-55',
    cnpj: null,
    rg: '12.345.678-9',
    rgIssuer: 'SSP-SP',
    rgDispatchDate: '2000-01-01',
    birthDate: '1980-01-01',
    maritalStatus: 'Solteiro',
    email: 'roberto.almeida@example.com',
    phone: '(11) 97777-8888',
    address: addr('04530-000', 'Rua Joaquim Floriano', '100', 'Ap 12', 'Itaim Bibi', 'São Paulo', 'SP'),
    notes: 'Cliente novo vindo de indicação.',
    documents: [
      doc('d0000012-0000-4000-a000-000000000012', 'Auto', 'Azul Seguros',
        'AUTO-2024-099', '2025-12-01', '2026-11-30',
        'Proposta', 'auto-roberto.pdf', 'Cotação inicial aprovada.'),
      doc('d0000013-0000-4000-a000-000000000013', 'Vida', 'Icatu',
        'VIDA-2024-055', '2026-01-01', '2026-12-31',
        'Apólice', 'vida-roberto.pdf', 'Cobertura básica.')
    ]
  },
  // ========== Clientes da Nordeste (broker 2) ==========
  {
    id: 'c0000007-0000-4000-a000-000000000007',
    brokerId: 'b0000002-0000-4000-a000-000000000002',
    name: 'Eduardo Lima',
    personType: 'Física',
    cpf: '711.637.928-20',
    cnpj: null,
    rg: '18.550.100-2',
    rgIssuer: 'SSP-PR',
    rgDispatchDate: '2011-06-25',
    birthDate: '1979-05-02',
    maritalStatus: 'Casado',
    email: 'eduardo.lima@example.com',
    phone: '(41) 99660-0101',
    address: addr('80240-030', 'Avenida Iguaçu', '1815', 'Casa 2', 'Água Verde', 'Curitiba', 'PR'),
    notes: 'Possui frota com dois veículos premium.',
    documents: [
      doc('d0000008-0000-4000-a000-000000000008', 'Auto', 'Sompo',
        'AUTO-2024-078', '2026-01-05', '2026-12-31',
        'Apólice', 'auto-eduardo.pdf', 'Inclui cobertura para PCD.')
    ]
  },
  {
    id: 'c0000008-0000-4000-a000-000000000008',
    brokerId: 'b0000002-0000-4000-a000-000000000002',
    name: 'NorteSul Logística Ltda.',
    personType: 'Jurídica',
    cpf: null,
    cnpj: '79.497.929/0499-92',
    rg: null,
    rgIssuer: null,
    rgDispatchDate: null,
    birthDate: null,
    maritalStatus: null,
    email: 'contato@nortesullog.com.br',
    phone: '(92) 4002-0909',
    address: addr('69005-070', 'Avenida Constantino Nery', '2450', 'Galpão 3', 'São Geraldo', 'Manaus', 'AM'),
    notes: 'Operação de transporte refrigerado na região Norte.',
    documents: [
      doc('d0000009-0000-4000-a000-000000000009', 'Frota', 'Mapfre',
        'FROTA-2024-045', '2025-12-20', '2026-12-19',
        'Apólice', 'frota-nortesul.pdf', '30 veículos cadastrados.'),
      doc('d0000010-0000-4000-a000-000000000010', 'Equipamentos', 'Liberty',
        'EQP-2023-119', '2025-11-01', '2026-10-31',
        'Apólice', 'equipamentos-nortesul.pdf', 'Cobertura para câmaras frias.')
    ]
  },
  {
    id: 'c0000009-0000-4000-a000-000000000009',
    brokerId: 'b0000002-0000-4000-a000-000000000002',
    name: 'Paola Andrade',
    personType: 'Física',
    cpf: '166.907.726-80',
    cnpj: null,
    rg: '12.909.555-1',
    rgIssuer: 'SSP-DF',
    rgDispatchDate: '2015-01-09',
    birthDate: '1993-08-30',
    maritalStatus: 'Solteira',
    email: 'paola.andrade@example.com',
    phone: '(61) 98110-3030',
    address: addr('70040-010', 'SBS Quadra 2', 'Bloco Q', 'Sala 203', 'Asa Sul', 'Brasília', 'DF'),
    notes: 'Consultora jurídica especializada em direito digital.',
    documents: [
      doc('d0000014-0000-4000-a000-000000000014', 'Responsabilidade Civil Profissional', 'Chubb',
        'RC-PAOLA-2024', '2026-01-10', '2027-01-09',
        'Apólice', 'rc-paola.pdf', 'Cobertura para consultorias remotas.')
    ]
  },
  {
    id: 'c0000010-0000-4000-a000-000000000010',
    brokerId: 'b0000002-0000-4000-a000-000000000002',
    name: 'Vitaly Saúde Integrada',
    personType: 'Jurídica',
    cpf: null,
    cnpj: '38.920.338/1603-36',
    rg: null,
    rgIssuer: null,
    rgDispatchDate: null,
    birthDate: null,
    maritalStatus: null,
    email: 'financeiro@vitalysaude.com.br',
    phone: '(85) 3232-4545',
    address: addr('60115-282', 'Avenida Santos Dumont', '2828', '7º andar', 'Aldeota', 'Fortaleza', 'CE'),
    notes: 'Rede de clínicas em expansão nacional.',
    documents: [
      doc('d0000015-0000-4000-a000-000000000015', 'Patrimonial', 'Zurich',
        'PATR-2024-301', '2025-12-01', '2026-11-30',
        'Apólice', 'patr-vitaly.pdf', 'Inclui 4 unidades próprias.'),
      doc('d0000016-0000-4000-a000-000000000016', 'Cyber', 'AIG',
        'CYBER-2024-044', '2026-02-15', '2027-02-14',
        'Proposta', 'cyber-vitaly.pdf', 'Em processo de análise de risco.'),
      doc('d0000017-0000-4000-a000-000000000017', 'Saúde', 'SulAmérica',
        'SAUDE-VIT-002', '2026-03-01', '2027-02-28',
        'Proposta', 'saude-vitaly-2.pdf', 'Expansão para nova filial.')
    ]
  }
];

const tablesToTruncate = ['documents', 'refresh_tokens', 'clients', 'users', 'brokers'];

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const truncateTables = async (client) => {
  for (const table of tablesToTruncate) {
    const result = await client.query('SELECT to_regclass($1) AS regclass', [`public.${table}`]);
    if (result.rows[0]?.regclass) {
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }
  }
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Connected to database.');

    console.log('Clearing existing data...');
    await truncateTables(client);

    console.log('Creating brokers and users...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    for (const broker of brokerSeed) {
      const { user, ...brokerRow } = broker;
      await insertRow(client, 'brokers', brokerRow);
      await insertRow(client, 'users', { brokerId: broker.id, ...user, password: passwordHash });
    }

    console.log('Creating clients and documents...');
    for (const c of clientSeed) {
      const { documents, address, ...clientRow } = c;
      await insertRow(client, 'clients', { ...clientRow, address: JSON.stringify(address) });
      await insertBatch(client, 'documents',
        documents.map(d => ({ ...d, clientId: c.id, brokerId: c.brokerId }))
      );
    }

    const atlasClients = clientSeed.filter(c => c.brokerId === 'b0000001-0000-4000-a000-000000000001');
    const nordesteClients = clientSeed.filter(c => c.brokerId === 'b0000002-0000-4000-a000-000000000002');

    console.log('Seed executed successfully.');
    console.log('');
    console.log('=== Credenciais de acesso ===');
    console.log(`Atlas Seguros      -> email: lucas@atlasseguros.com.br | password: ${adminPassword}`);
    console.log(`Nordeste Proteção  -> email: paula@nordesteprotecao.com.br | password: ${adminPassword}`);
    console.log('');
    console.log(`Criados ${brokerSeed.length} corretoras, ${clientSeed.length} clientes (${atlasClients.length} Atlas, ${nordesteClients.length} Nordeste), ${clientSeed.reduce((acc, c) => acc + c.documents.length, 0)} documentos.`);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
