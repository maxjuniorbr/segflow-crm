
export enum DocumentStatus {
  PROPOSAL = 'Proposta',
  POLICY = 'Apólice',
  ENDORSEMENT = 'Endosso',
  CANCELED = 'Cancelado',
  EXPIRED = 'Vencido'
}

export enum InsuranceType {
  AUTO = 'Auto',
  LIFE = 'Life',
  RESIDENTIAL = 'Residential',
  CORPORATE = 'Corporate',
  HEALTH = 'Health',
  TRAVEL = 'Travel'
}

export type DocumentStatusValue = 'Proposta' | 'Apólice' | 'Endosso' | 'Cancelado' | 'Vencido';
export type InsuranceTypeValue = 'Auto' | 'Life' | 'Residential' | 'Corporate' | 'Health' | 'Travel';
export type PersonType = 'Física' | 'Jurídica';
export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  nextCursor?: string | null;
};

export interface Client {
  id: string;
  name: string;
  personType: PersonType;
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
  type: InsuranceTypeValue;
  company: string;
  documentNumber: string;
  startDate: string;
  endDate: string;
  status: DocumentStatusValue;
  attachmentName?: string;
  notes?: string;
  createdAt?: string;
}

export type DocumentListItem = Document & {
  clientName?: string | null;
  clientPersonType?: PersonType | null;
  clientCpf?: string | null;
  clientCnpj?: string | null;
};

export interface User {
  id?: number;
  name: string;
  cpf: string;
  email: string;
  username: string;
  isAuthenticated?: boolean;
}

export interface Broker {
  id: string;
  corporateName: string;
  tradeName: string;
  cnpj: string;
  susepCode?: string | null;
  contactName: string;
  email: string;
  phone: string;
  mobile: string;
  createdAt?: string;
}

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  cpf: string;
  email: string;
  password: string;
  username?: string;
};

export type UserFormData = {
  name: string;
  cpf: string;
  email: string;
  password?: string;
};

export type ClientFormData = Omit<Client, 'id' | 'createdAt'>;
export type DocumentFormData = Omit<Document, 'id' | 'createdAt'>;
export type BrokerFormData = Omit<Broker, 'id' | 'createdAt'>;

export interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  pendingProposals: number;
  expiringSoon: number;
  upcomingExpirations: Array<{
    id: string;
    clientName: string;
    type: string;
    company: string;
    endDate: string;
  }>;
}
