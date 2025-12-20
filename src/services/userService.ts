import { User } from '../types';
import { api } from './api';

export const userService = {
    async getUsers(): Promise<User[]> {
        return api.get('/api/users');
    },

    async getUserById(id: number): Promise<User | undefined> {
        return api.get(`/api/users/${id}`);
    },

    async createUser(data: { name: string; cpf: string; email: string; password?: string }): Promise<void> {
        await api.post('/api/register', data);
    },

    async updateUser(id: number, data: { name: string; cpf: string; email: string; password?: string }): Promise<void> {
        await api.put(`/api/users/${id}`, data);
    },

    async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        await api.put(`/api/users/${id}/password`, { currentPassword, newPassword });
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(`/api/users/${id}`);
    }
};
