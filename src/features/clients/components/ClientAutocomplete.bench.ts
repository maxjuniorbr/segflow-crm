import { bench, describe } from 'vitest';
import { Client } from '../../../types';

// Mock data generator
const generateClients = (count: number): Client[] => {
    const clients: Client[] = [];
    for (let i = 0; i < count; i++) {
        clients.push({
            id: `client-${i}`,
            name: `Client Name ${i}`,
            personType: i % 2 === 0 ? 'Física' : 'Jurídica',
            cpf: i % 2 === 0 ? `123.456.789-${(i % 100).toString().padStart(2, '0')}` : undefined,
            cnpj: i % 2 !== 0 ? `12.345.678/0001-${(i % 100).toString().padStart(2, '0')}` : undefined,
            email: `client${i}@example.com`,
            phone: '123456789',
            address: {
                street: 'Street',
                number: '123',
                neighborhood: 'Neighborhood',
                city: 'City',
                state: 'ST',
                zipCode: '12345-678'
            },
            createdAt: new Date().toISOString()
        });
    }
    // Add some specific edge cases
    clients.push({
         id: 'target-1',
         name: 'John Doe',
         personType: 'Física',
         cpf: '111.222.333-44',
         email: 'john@example.com',
         phone: '111',
         address: { street: '', number: '', neighborhood: '', city: '', state: '', zipCode: '' },
         createdAt: ''
    });
    return clients;
};

const clients = generateClients(10000);
const searchTerm = "John";

// Current Logic
const searchClientsOld = (clients: Client[], searchTerm: string) => {
    if (searchTerm.length < 3) return [];

    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);

    const scoredClients = clients.map(client => {
        const nameLower = client.name.toLowerCase();
        const cpfDigits = client.cpf?.replace(/\D/g, '') || '';
        const cnpjDigits = client.cnpj?.replace(/\D/g, '') || '';
        const searchDigits = searchTerm.replace(/\D/g, '');

        let score = 0;

        if (nameLower.startsWith(searchTerm.toLowerCase())) {
            score += 100;
        }

        searchWords.forEach(word => {
            if (word.length >= 2 && nameLower.includes(word)) {
                score += 10;
            }
        });

        if (searchDigits.length >= 3) {
            if (cpfDigits.includes(searchDigits)) score += 50;
            if (cnpjDigits.includes(searchDigits)) score += 50;
        }

        return { client, score };
    })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(item => item.client);

    return scoredClients;
}

// Pre-process for New Implementation
const searchIndex = clients.map(client => ({
    client,
    nameLower: client.name.toLowerCase(),
    cpfDigits: client.cpf?.replace(/\D/g, '') || '',
    cnpjDigits: client.cnpj?.replace(/\D/g, '') || ''
}));

// New Logic
const searchClientsNew = (searchIndex: any[], searchTerm: string) => {
    if (searchTerm.length < 3) return [];

    const searchTermLower = searchTerm.toLowerCase();
    const searchWords = searchTermLower.trim().split(/\s+/);
    const searchDigits = searchTerm.replace(/\D/g, '');

    const scoredClients = searchIndex.map(item => {
        const { client, nameLower, cpfDigits, cnpjDigits } = item;

        let score = 0;

        if (nameLower.startsWith(searchTermLower)) {
            score += 100;
        }

        searchWords.forEach((word: string) => {
            if (word.length >= 2 && nameLower.includes(word)) {
                score += 10;
            }
        });

        if (searchDigits.length >= 3) {
            if (cpfDigits.includes(searchDigits)) score += 50;
            if (cnpjDigits.includes(searchDigits)) score += 50;
        }

        return { client, score };
    })
        .filter((item: any) => item.score > 0)
        .sort((a: any, b: any) => b.score - a.score)
        .map((item: any) => item.client);

    return scoredClients;
}


describe('Client Search', () => {
  bench('Old Implementation', () => {
    searchClientsOld(clients, searchTerm);
  });

  bench('New Implementation', () => {
    searchClientsNew(searchIndex, searchTerm);
  });
});
