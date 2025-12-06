import { describe, it, expect } from 'vitest';
import { Broker } from '../../src/domain/entities/Broker.js';

describe('Broker entity', () => {
    it('maps database row to entity', () => {
        const row = {
            id: 'bro-1',
            corporatename: 'Razão',
            tradename: 'Fantasia',
            cnpj: '12345678000190',
            susepcode: '123',
            contactname: 'Contato',
            email: 'email@example.com',
            phone: '11',
            mobile: '11',
            createdat: '2025-01-01T00:00:00.000Z'
        };

        const broker = Broker.fromDatabase(row);
        expect(broker.tradeName).toBe('Fantasia');
        expect(broker.createdAt).toBe(row.createdat);
    });

    it('serializes to JSON', () => {
        const broker = new Broker({
            id: 'bro-2',
            corporateName: 'Razão',
            tradeName: 'Fantasia',
            cnpj: '12345678000190',
            susepCode: '123',
            contactName: 'Contato',
            email: 'email@example.com',
            phone: '11',
            mobile: '11',
            createdAt: '2025-01-02T00:00:00.000Z'
        });

        expect(broker.toJSON()).toEqual({
            id: 'bro-2',
            corporateName: 'Razão',
            tradeName: 'Fantasia',
            cnpj: '12345678000190',
            susepCode: '123',
            contactName: 'Contato',
            email: 'email@example.com',
            phone: '11',
            mobile: '11',
            createdAt: '2025-01-02T00:00:00.000Z'
        });
    });
});
