import { describe, it, expect } from 'vitest';
import { User } from '../../src/domain/entities/User.js';

describe('User Entity', () => {
    it('should create a user instance', () => {
        const user = new User(1, 'Test User', '12345678900', 'test@example.com', 'testuser', 'hashedpassword');

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
        const user = new User(1, 'Test User', '12345678900', 'test@example.com', 'testuser', 'hashedpassword');
        const publicJSON = user.toPublicJSON();

        expect(publicJSON).toEqual({
            id: 1,
            name: 'Test User',
            cpf: '12345678900',
            email: 'test@example.com',
            username: 'testuser',
        });
        expect(publicJSON.password).toBeUndefined();
    });
});
