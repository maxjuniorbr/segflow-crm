import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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
    address: {
      zipCode: '04094-050',
      street: 'Rua Inhambu',
      number: '920',
      complement: 'Ap 82',
      neighborhood: 'Moema',
      city: 'São Paulo',
      state: 'SP'
    },
    notes: 'Cliente com foco em renovações automotivas.',
    documents: [
      {
        id: 'd0000001-0000-4000-a000-000000000001',
        type: 'Auto',
        company: 'Porto Seguro',
        documentNumber: 'AUTO-2024-001',
        startDate: '2025-12-01',
        endDate: '2026-11-30',
        status: 'Apólice',
        attachmentName: 'auto-marina-2024.pdf',
        notes: 'Cobertura completa com carro reserva.'
      },
      {
        id: 'd0000002-0000-4000-a000-000000000002',
        type: 'Vida',
        company: 'SulAmérica',
        documentNumber: 'VIDA-2023-014',
        startDate: '2025-12-15',
        endDate: '2026-12-14',
        status: 'Proposta',
        attachmentName: 'vida-marina.pdf',
        notes: 'Aguardando assinatura digital.'
      }
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
    address: {
      zipCode: '20040-020',
      street: 'Avenida Rio Branco',
      number: '123',
      complement: 'Sala 1004',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    notes: 'Empresário do setor de tecnologia.',
    documents: [
      {
        id: 'd0000003-0000-4000-a000-000000000003',
        type: 'Residencial',
        company: 'Bradesco Seguros',
        documentNumber: 'RES-2024-045',
        startDate: '2025-11-10',
        endDate: '2026-11-09',
        status: 'Apólice',
        attachmentName: 'residencial-gustavo.pdf',
        notes: 'Apartamento na região central.'
      }
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
    address: {
      zipCode: '30130-010',
      street: 'Rua da Bahia',
      number: '600',
      complement: 'Ap 301',
      neighborhood: 'Funcionários',
      city: 'Belo Horizonte',
      state: 'MG'
    },
    notes: 'Profissional liberal e viajante frequente.',
    documents: [
      {
        id: 'd0000004-0000-4000-a000-000000000004',
        type: 'Viagem',
        company: 'Allianz',
        documentNumber: 'TRAVEL-2024-012',
        startDate: '2026-02-01',
        endDate: '2026-04-30',
        status: 'Apólice',
        attachmentName: 'viagem-clara.pdf',
        notes: 'Plano anual com cobertura global.'
      }
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
    address: {
      zipCode: '01310-200',
      street: 'Avenida Paulista',
      number: '1578',
      complement: 'Torre Norte',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    notes: 'Cliente PJ com demandas recorrentes de grandes apólices.',
    documents: [
      {
        id: 'd0000005-0000-4000-a000-000000000005',
        type: 'Patrimonial',
        company: 'Tokio Marine',
        documentNumber: 'PATR-2024-220',
        startDate: '2025-12-01',
        endDate: '2026-12-01',
        status: 'Apólice',
        attachmentName: 'patrimonial-inova.pdf',
        notes: 'Cobertura da sede administrativa.'
      },
      {
        id: 'd0000006-0000-4000-a000-000000000006',
        type: 'Responsabilidade Civil',
        company: 'HDI',
        documentNumber: 'RC-2024-031',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'Apólice',
        attachmentName: 'rc-inova.pdf',
        notes: 'Cobertura para diretores e executivos.'
      },
      {
        id: 'd0000011-0000-4000-a000-000000000011',
        type: 'Garantia',
        company: 'Junto Seguros',
        documentNumber: 'GAR-2024-001',
        startDate: '2025-11-15',
        endDate: '2026-11-14',
        status: 'Apólice',
        attachmentName: 'garantia-inova.pdf',
        notes: 'Garantia judicial para processo trabalhista.'
      }
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
    address: {
      zipCode: '40015-010',
      street: 'Rua Chile',
      number: '20',
      complement: 'Cobertura',
      neighborhood: 'Centro Histórico',
      city: 'Salvador',
      state: 'BA'
    },
    notes: 'Cliente interessada em planos familiares.',
    documents: [
      {
        id: 'd0000007-0000-4000-a000-000000000007',
        type: 'Saúde',
        company: 'Bradesco Saúde',
        documentNumber: 'SAUDE-2024-088',
        startDate: '2025-12-10',
        endDate: '2026-12-09',
        status: 'Apólice',
        attachmentName: 'saude-fernanda.pdf',
        notes: 'Plano familiar com 3 dependentes.'
      }
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
    address: {
      zipCode: '04530-000',
      street: 'Rua Joaquim Floriano',
      number: '100',
      complement: 'Ap 12',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP'
    },
    notes: 'Cliente novo vindo de indicação.',
    documents: [
      {
        id: 'd0000012-0000-4000-a000-000000000012',
        type: 'Auto',
        company: 'Azul Seguros',
        documentNumber: 'AUTO-2024-099',
        startDate: '2025-12-01',
        endDate: '2026-11-30',
        status: 'Proposta',
        attachmentName: 'auto-roberto.pdf',
        notes: 'Cotação inicial aprovada.'
      },
      {
        id: 'd0000013-0000-4000-a000-000000000013',
        type: 'Vida',
        company: 'Icatu',
        documentNumber: 'VIDA-2024-055',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        status: 'Apólice',
        attachmentName: 'vida-roberto.pdf',
        notes: 'Cobertura básica.'
      }
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
    address: {
      zipCode: '80240-030',
      street: 'Avenida Iguaçu',
      number: '1815',
      complement: 'Casa 2',
      neighborhood: 'Água Verde',
      city: 'Curitiba',
      state: 'PR'
    },
    notes: 'Possui frota com dois veículos premium.',
    documents: [
      {
        id: 'd0000008-0000-4000-a000-000000000008',
        type: 'Auto',
        company: 'Sompo',
        documentNumber: 'AUTO-2024-078',
        startDate: '2026-01-05',
        endDate: '2026-12-31',
        status: 'Apólice',
        attachmentName: 'auto-eduardo.pdf',
        notes: 'Inclui cobertura para PCD.'
      }
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
    address: {
      zipCode: '69005-070',
      street: 'Avenida Constantino Nery',
      number: '2450',
      complement: 'Galpão 3',
      neighborhood: 'São Geraldo',
      city: 'Manaus',
      state: 'AM'
    },
    notes: 'Operação de transporte refrigerado na região Norte.',
    documents: [
      {
        id: 'd0000009-0000-4000-a000-000000000009',
        type: 'Frota',
        company: 'Mapfre',
        documentNumber: 'FROTA-2024-045',
        startDate: '2025-12-20',
        endDate: '2026-12-19',
        status: 'Apólice',
        attachmentName: 'frota-nortesul.pdf',
        notes: '30 veículos cadastrados.'
      },
      {
        id: 'd0000010-0000-4000-a000-000000000010',
        type: 'Equipamentos',
        company: 'Liberty',
        documentNumber: 'EQP-2023-119',
        startDate: '2025-11-01',
        endDate: '2026-10-31',
        status: 'Apólice',
        attachmentName: 'equipamentos-nortesul.pdf',
        notes: 'Cobertura para câmaras frias.'
      }
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
    address: {
      zipCode: '70040-010',
      street: 'SBS Quadra 2',
      number: 'Bloco Q',
      complement: 'Sala 203',
      neighborhood: 'Asa Sul',
      city: 'Brasília',
      state: 'DF'
    },
    notes: 'Consultora jurídica especializada em direito digital.',
    documents: [
      {
        id: 'd0000014-0000-4000-a000-000000000014',
        type: 'Responsabilidade Civil Profissional',
        company: 'Chubb',
        documentNumber: 'RC-PAOLA-2024',
        startDate: '2026-01-10',
        endDate: '2027-01-09',
        status: 'Apólice',
        attachmentName: 'rc-paola.pdf',
        notes: 'Cobertura para consultorias remotas.'
      }
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
    address: {
      zipCode: '60115-282',
      street: 'Avenida Santos Dumont',
      number: '2828',
      complement: '7º andar',
      neighborhood: 'Aldeota',
      city: 'Fortaleza',
      state: 'CE'
    },
    notes: 'Rede de clínicas em expansão nacional.',
    documents: [
      {
        id: 'd0000015-0000-4000-a000-000000000015',
        type: 'Patrimonial',
        company: 'Zurich',
        documentNumber: 'PATR-2024-301',
        startDate: '2025-12-01',
        endDate: '2026-11-30',
        status: 'Apólice',
        attachmentName: 'patr-vitaly.pdf',
        notes: 'Inclui 4 unidades próprias.'
      },
      {
        id: 'd0000016-0000-4000-a000-000000000016',
        type: 'Cyber',
        company: 'AIG',
        documentNumber: 'CYBER-2024-044',
        startDate: '2026-02-15',
        endDate: '2027-02-14',
        status: 'Proposta',
        attachmentName: 'cyber-vitaly.pdf',
        notes: 'Em processo de análise de risco.'
      },
      {
        id: 'd0000017-0000-4000-a000-000000000017',
        type: 'Saúde',
        company: 'SulAmérica',
        documentNumber: 'SAUDE-VIT-002',
        startDate: '2026-03-01',
        endDate: '2027-02-28',
        status: 'Proposta',
        attachmentName: 'saude-vitaly-2.pdf',
        notes: 'Expansão para nova filial.'
      }
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
      await client.query(
        `INSERT INTO brokers (id, corporate_name, trade_name, cnpj, susep_code, contact_name, email, phone, mobile)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          broker.id,
          broker.corporateName,
          broker.tradeName,
          broker.cnpj,
          broker.susepCode,
          broker.contactName,
          broker.email,
          broker.phone,
          broker.mobile
        ]
      );

      await client.query(
        `INSERT INTO users (broker_id, name, cpf, email, username, password)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [broker.id, broker.user.name, broker.user.cpf, broker.user.email, broker.user.username, passwordHash]
      );
    }

    console.log('Creating clients and documents...');
    for (const clientData of clientSeed) {
      await client.query(
        `INSERT INTO clients (id, broker_id, name, person_type, cpf, cnpj, rg, rg_dispatch_date, rg_issuer, birth_date, marital_status, email, phone, address, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          clientData.id,
          clientData.brokerId,
          clientData.name,
          clientData.personType,
          clientData.cpf,
          clientData.cnpj,
          clientData.rg,
          clientData.rgDispatchDate,
          clientData.rgIssuer,
          clientData.birthDate,
          clientData.maritalStatus,
          clientData.email,
          clientData.phone,
          JSON.stringify(clientData.address),
          clientData.notes
        ]
      );

      for (const doc of clientData.documents) {
        await client.query(
          `INSERT INTO documents (id, client_id, broker_id, type, company, document_number, start_date, end_date, status, attachment_name, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            doc.id,
            clientData.id,
            clientData.brokerId,
            doc.type,
            doc.company,
            doc.documentNumber,
            doc.startDate,
            doc.endDate,
            doc.status,
            doc.attachmentName,
            doc.notes
          ]
        );
      }
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
