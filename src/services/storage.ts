import { Client, Document, User } from '../types';
import { api } from './api';

export const storageService = {
  async init() {
    return;
  },

  async register(user: { name: string; cpf: string; email: string; password: string; username?: string }) {
    try {
      await api.post('/api/register', user);
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  },

  validateUser: async (email: string, password: string): Promise<User | null> => {
    try {
      const data = await api.post('/api/login', { email, password });
      if (data && data.token && data.user) {
        return {
          ...data.user,
          token: data.token,
          isAuthenticated: true
        };
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  },

  async getClients(): Promise<Client[]> {
    return api.get('/api/clients');
  },

  getClientById: async (id: string): Promise<Client | undefined> => {
    try {
      return await api.get(`/api/clients/${id}`);
    } catch (e) {
      return undefined;
    }
  },

  async saveClient(client: Client, isNew: boolean = false): Promise<Client> {
    try {
      if (!isNew && client.id) {
        const response = await api.put(`/api/clients/${client.id}`, client);
        return response;  // ← Removido .data
      } else {
        const response = await api.post('/api/clients', client);
        return response;  // ← Removido .data
      }
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/clients/${id}`);
      return true;
    } catch (error) {
      throw error; // Propagate error (e.g. "active proposals")
    }
  },

  // --- Proposals ---



  async getDocuments(): Promise<Document[]> {
    try {
      return await api.get('/api/documents');
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    try {
      const response = await api.get(`/api/documents/${id}`);
      return response; // Assuming API returns the document directly
    } catch (error) {
      console.error('Error fetching document:', error);
      return undefined;
    }
  },

  async saveDocument(doc: Document, isNew: boolean = false): Promise<Document> {
    try {
      if (!isNew && doc.id) {
        const response = await api.put(`/api/documents/${doc.id}`, doc);
        return response;  // ← Removido .data
      } else {
        const response = await api.post('/api/documents', doc);
        return response;  // ← Removido .data
      }
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  getDocumentsByClientId: async (clientId: string): Promise<Document[]> => {
    try {
      const all = await api.get('/api/documents');
      return all.filter((d: Document) => d.clientId === clientId);
    } catch (error) {
      console.error('Error fetching client documents:', error);
      return [];
    }
  }
};
