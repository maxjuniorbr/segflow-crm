/**
 * User Entity
 * Represents a user in the system with authentication credentials
 */
export class User {
    constructor(id, name, cpf, email, username, password, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.cpf = cpf;
        this.email = email;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
    }

    static fromDatabase(row) {
        return new User(row.id, row.name, row.cpf, row.email, row.username, row.password, row.created_at);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            cpf: this.cpf,
            email: this.email,
            username: this.username,
        };
    }
}
