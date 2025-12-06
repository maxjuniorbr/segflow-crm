import { Client, Document, User, Broker } from '../types';
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
      if (data && data.user) {
        return {
          ...data.user,
          isAuthenticated: true
        };
      }
      return null;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Logout failed', error);
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
      const payload: any = { ...client };
      if (isNew) {
        delete payload.id;
        delete payload.createdAt;
      }

      if (!isNew && client.id) {
        const response = await api.put(`/api/clients/${client.id}`, payload);
        return response;
      } else {
        const response = await api.post('/api/clients', payload);
        return response;
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



  async getDocuments(filters?: { clientId?: string; status?: string; search?: string; limit?: number; offset?: number }): Promise<Document[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.clientId) params.append('clientId', filters.clientId);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.limit) params.append('limit', String(filters.limit));
      if (filters?.offset) params.append('offset', String(filters.offset));

      const query = params.toString();
      return await api.get(`/api/documents${query ? `?${query}` : ''}`);
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
      const payload: any = { ...doc };
      if (isNew) {
        delete payload.id;
        delete payload.createdAt;
      }

      if (!isNew && doc.id) {
        const response = await api.put(`/api/documents/${doc.id}`, payload);
        return response;
      } else {
        const response = await api.post('/api/documents', payload);
        return response;
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
      const params = new URLSearchParams({ clientId, limit: '200' });
      return await api.get(`/api/documents?${params.toString()}`);
    } catch (error) {
      console.error('Error fetching client documents:', error);
      return [];
    }
  },

  async getBrokers(): Promise<Broker[]> {
    try {
      return await api.get('/api/brokers');
    } catch (error) {
      console.error('Error fetching brokers:', error);
      return [];
    }
  },

  async getBrokerById(id: string): Promise<Broker | undefined> {
    try {
      return await api.get(`/api/brokers/${id}`);
    } catch (error) {
      console.error('Error fetching broker:', error);
      return undefined;
    }
  },

  async saveBroker(broker: Broker, isNew: boolean): Promise<Broker> {
    try {
      const payload: any = { ...broker };
      if (isNew) {
        delete payload.id;
        delete payload.createdAt;
      }

      if (!isNew && broker.id) {
        return await api.put(`/api/brokers/${broker.id}`, payload);
      }
      return await api.post('/api/brokers', payload);
    } catch (error) {
      console.error('Error saving broker:', error);
      throw error;
    }
  },

  async deleteBroker(id: string): Promise<void> {
    try {
      await api.delete(`/api/brokers/${id}`);
    } catch (error) {
      console.error('Error deleting broker:', error);
      throw error;
    }
  }
};
