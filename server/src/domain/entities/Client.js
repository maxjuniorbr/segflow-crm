import { getRowValue } from './entityMapper.js';

/**
 * Client Entity
 * Represents a customer/client in the CRM system
 */
export class Client {
    constructor({
        id,
        name,
        personType = 'Física',
        cpf,
        cnpj,
        rg,
        rgDispatchDate,
        rgIssuer,
        birthDate,
        maritalStatus,
        email,
        phone,
        address,
        notes,
        createdAt = new Date(),
    }) {
        this.id = id;
        this.name = name;
        this.personType = personType;
        this.cpf = cpf;
        this.cnpj = cnpj;
        this.rg = rg;
        this.rgDispatchDate = rgDispatchDate;
        this.rgIssuer = rgIssuer;
        this.birthDate = birthDate;
        this.maritalStatus = maritalStatus;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.notes = notes;
        this.createdAt = createdAt;
    }

    /**
     * Create a Client instance from database row
     */
    static fromDatabase(row) {
        const rawAddress = getRowValue(row, ['address']);
        const address = typeof rawAddress === 'string' ? JSON.parse(rawAddress) : rawAddress;

        return new Client({
            id: getRowValue(row, ['id']),
            name: getRowValue(row, ['name']),
            personType: getRowValue(row, ['personType', 'persontype', 'person_type']) ?? 'Física',
            cpf: getRowValue(row, ['cpf']),
            cnpj: getRowValue(row, ['cnpj']),
            rg: getRowValue(row, ['rg']),
            rgDispatchDate: getRowValue(row, ['rgDispatchDate', 'rgdispatchdate', 'rg_dispatch_date']),
            rgIssuer: getRowValue(row, ['rgIssuer', 'rgissuer', 'rg_issuer']),
            birthDate: getRowValue(row, ['birthDate', 'birthdate', 'birth_date']),
            maritalStatus: getRowValue(row, ['maritalStatus', 'maritalstatus', 'marital_status']),
            email: getRowValue(row, ['email']),
            phone: getRowValue(row, ['phone']),
            address,
            notes: getRowValue(row, ['notes']),
            createdAt: getRowValue(row, ['createdAt', 'createdat', 'created_at']),
        });
    }

    /**
     * Convert to plain object for API response
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            personType: this.personType,
            cpf: this.cpf,
            cnpj: this.cnpj,
            rg: this.rg,
            rgDispatchDate: this.rgDispatchDate,
            rgIssuer: this.rgIssuer,
            birthDate: this.birthDate,
            maritalStatus: this.maritalStatus,
            email: this.email,
            phone: this.phone,
            address: this.address,
            notes: this.notes,
            createdAt: this.createdAt,
        };
    }
}
