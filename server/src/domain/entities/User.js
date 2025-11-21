/**
 * User Entity
 * Represents a user in the system with authentication credentials
 */
export class User {
    constructor(id, email, username, password, createdAt = new Date()) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
    }

    /**
     * Create a User instance from database row
     */
    static fromDatabase(row) {
        return new User(row.id, row.email, row.username, row.password, row.created_at);
    }

    /**
     * Convert to plain object for API response (excluding password)
     */
    toPublicJSON() {
        return {
            id: this.id,
            email: this.email,
            username: this.username,
        };
    }
}
