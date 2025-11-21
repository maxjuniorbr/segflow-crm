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
        return new Client({
            id: row.id,
            name: row.name,
            personType: row.persontype || row.personType || 'Física',
            cpf: row.cpf,
            cnpj: row.cnpj,
            rg: row.rg,
            rgDispatchDate: row.rgdispatchdate || row.rgDispatchDate,
            rgIssuer: row.rgissuer || row.rgIssuer,
            birthDate: row.birthdate || row.birthDate,
            maritalStatus: row.maritalstatus || row.maritalStatus,
            email: row.email,
            phone: row.phone,
            address: typeof row.address === 'string' ? JSON.parse(row.address) : row.address,
            notes: row.notes,
            createdAt: row.createdat || row.createdAt,
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
