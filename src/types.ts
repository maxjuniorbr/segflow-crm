
export enum DocumentStatus {
  PROPOSAL = 'Proposta',
  POLICY = 'Apólice',
  CANCELED = 'Cancelado'
}

export enum InsuranceType {
  AUTO = 'Auto',
  LIFE = 'Life',
  RESIDENTIAL = 'Residential',
  CORPORATE = 'Corporate',
  HEALTH = 'Health',
  TRAVEL = 'Travel'
}

export interface Client {
  id: string;
  name: string;
  personType: 'Física' | 'Jurídica';
  cpf?: string;
  cnpj?: string;
  rg?: string;
  rgDispatchDate?: string;
  rgIssuer?: string;
  birthDate?: string;
  maritalStatus?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: string;
  notes?: string;
}

export interface Document {
  id: string;
  clientId: string;
  type: string;
  company: string;
  documentNumber: string;
  startDate: string;
  endDate: string;
  status: string;
  attachmentName?: string;
  notes?: string;
  createdAt?: string;
}

export interface User {
  id?: number;
  name: string;
  cpf: string;
  email: string;
  username: string;
  isAuthenticated: boolean;
  token?: string;
}
