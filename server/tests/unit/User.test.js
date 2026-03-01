import { describe, it, expect } from 'vitest';
import { User } from '../../src/domain/entities/User.js';

describe('User Entity', () => {
    it('should create a user instance', () => {
        const user = new User({
            id: 1,
            name: 'Test User',
            cpf: '12345678900',
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashedpassword'
        });

        expect(user.id).toBe(1);
        expect(user.name).toBe('Test User');
        expect(user.cpf).toBe('12345678900');
        expect(user.email).toBe('test@example.com');
        expect(user.username).toBe('testuser');
    });

    it('should create user from database row', () => {
        const dbRow = {
            id: 1,
            name: 'Test User',
            cpf: '12345678900',
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashedpassword',
            created_at: new Date('2024-01-01'),
        };

        const user = User.fromDatabase(dbRow);

        expect(user.id).toBe(1);
        expect(user.name).toBe('Test User');
        expect(user.cpf).toBe('12345678900');
        expect(user.email).toBe('test@example.com');
        expect(user.username).toBe('testuser');
    });

    it('should convert to public JSON without password', () => {
        const user = new User({
            id: 1,
            name: 'Test User',
            cpf: '97456321558',
            email: 'test@example.com',
            username: 'testuser',
            password: 'hashedpassword'
        });
        const publicJSON = user.toJSON();

        expect(publicJSON).toEqual({
            id: 1,
            name: 'Test User',
            cpf: '97456321558',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: user.createdAt
        });
        expect(publicJSON.password).toBeUndefined();
    });

    it('should map createdAt from database', () => {
        const createdAt = new Date('2024-02-02');
        const user = User.fromDatabase({
            id: 2,
            name: 'Another User',
            cpf: '22233344455',
            email: 'another@example.com',
            username: 'another',
            password: 'hashedpassword',
            created_at: createdAt
        });

        expect(user.createdAt).toBe(createdAt);
    });
});
