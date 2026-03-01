import { getRowValue } from './entityMapper.js';

/**
 * User Entity
 * Represents a user in the system with authentication credentials
 */
export class User {
    constructor({
        id,
        brokerId,
        name,
        cpf,
        email,
        username,
        password,
        createdAt = new Date()
    }) {
        this.id = id;
        this.brokerId = brokerId;
        this.name = name;
        this.cpf = cpf;
        this.email = email;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
    }

    static fromDatabase(row) {
        return new User({
            id: getRowValue(row, ['id']),
            brokerId: getRowValue(row, ['brokerId', 'brokerid', 'broker_id']),
            name: getRowValue(row, ['name']),
            cpf: getRowValue(row, ['cpf']),
            email: getRowValue(row, ['email']),
            username: getRowValue(row, ['username']),
            password: getRowValue(row, ['password']),
            createdAt: getRowValue(row, ['createdAt', 'createdat', 'created_at'])
        });
    }

    toJSON() {
        return {
            id: this.id,
            brokerId: this.brokerId,
            name: this.name,
            cpf: this.cpf,
            email: this.email,
            username: this.username,
            createdAt: this.createdAt
        };
    }
}
