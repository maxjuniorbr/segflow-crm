
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

export type DocumentStatusValue = 'Proposta' | 'Apólice' | 'Cancelado';
export type InsuranceTypeValue = 'Auto' | 'Life' | 'Residential' | 'Corporate' | 'Health' | 'Travel';
export type PersonType = 'Física' | 'Jurídica';
export type FormErrors<T> = Partial<Record<keyof T, string>>;

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
