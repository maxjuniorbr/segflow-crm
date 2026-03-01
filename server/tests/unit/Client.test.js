import { describe, it, expect } from 'vitest';
import { Client } from '../../src/domain/entities/Client.js';

describe('Client Entity', () => {
    const clientData = {
        id: 'client-1',
        name: 'João Silva',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        rgDispatchDate: new Date('2010-01-15'),
        rgIssuer: 'SSP/SP',
        birthDate: new Date('1985-05-20'),
        maritalStatus: 'Casado(a)',
        email: 'joao@example.com',
        phone: '(11) 98765-4321',
        address: {
            street: 'Rua das Flores',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
        },
        notes: 'Cliente VIP',
    };

    it('should create a client instance', () => {
        const client = new Client(clientData);

        expect(client.id).toBe('client-1');
        expect(client.name).toBe('João Silva');
        expect(client.email).toBe('joao@example.com');
    });

    it('should create client from database row', () => {
        const dbRow = {
            id: 'client-1',
            name: 'João Silva',
            cpf: '123.456.789-00',
            email: 'joao@example.com',
            address: JSON.stringify(clientData.address),
            marital_status: 'Casado(a)',
            rg_dispatch_date: new Date('2010-01-15'),
        };

        const client = Client.fromDatabase(dbRow);

        expect(client.id).toBe('client-1');
        expect(client.address).toEqual(clientData.address);
        expect(client.maritalStatus).toBe('Casado(a)');
    });

    it('should convert to JSON for API response', () => {
        const client = new Client(clientData);
        const json = client.toJSON();

        expect(json.id).toBe('client-1');
        expect(json.name).toBe('João Silva');
        expect(json.address).toEqual(clientData.address);
    });

    it('should handle null/missing fields from database', () => {
        const sparseRow = { id: 'client-2', name: 'Minimal' };
        const client = Client.fromDatabase(sparseRow);

        expect(client.id).toBe('client-2');
        expect(client.name).toBe('Minimal');
        expect(client.cpf).toBeUndefined();
        expect(client.address).toBeFalsy();
        expect(client.personType).toBe('Física');
    });

    it('should parse address as object when already parsed', () => {
        const rowWithObject = { id: 'c-3', name: 'Test', address: { city: 'SP' } };
        const client = Client.fromDatabase(rowWithObject);
        expect(client.address).toEqual({ city: 'SP' });
    });
});
