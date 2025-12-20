import { Client, Document, User, Broker, DocumentStatusValue } from '../types';
import { api, ApiError } from './api';

export const storageService = {
  async init() {
    return;
  },

  async register(user: { name: string; cpf: string; email: string; password: string; username?: string }) {
    await api.post('/api/register', user);
  },

  validateUser: async (email: string, password: string): Promise<User | null> => {
    try {
      const data = await api.post('/api/login', { email, password }, { redirectOnAuthError: false });
      if (data && data.user) {
        return {
          ...data.user,
          isAuthenticated: true
        };
      }
      return null;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        return null;
      }
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout');
    } catch (error) {
      console.error('Erro ao encerrar sessão', error);
    }
  },

  async getClients(): Promise<Client[]> {
    return api.get('/api/clients');
  },

  getClientById: async (id: string): Promise<Client | undefined> => {
    return api.get(`/api/clients/${id}`);
  },

  async saveClient(client: Client, isNew: boolean = false): Promise<Client> {
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



  async getDocuments(filters?: { clientId?: string; status?: DocumentStatusValue; search?: string; limit?: number; offset?: number }): Promise<Document[]> {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const query = params.toString();
    return api.get(`/api/documents${query ? `?${query}` : ''}`);
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    return api.get(`/api/documents/${id}`);
  },

  async saveDocument(doc: Document, isNew: boolean = false): Promise<Document> {
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
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}`);
    } catch (error) {
      console.error('Erro ao excluir documento', error);
      throw error;
    }
  },

  getDocumentsByClientId: async (clientId: string): Promise<Document[]> => {
    const params = new URLSearchParams({ clientId, limit: '200' });
    return api.get(`/api/documents?${params.toString()}`);
  },

  async getBrokers(): Promise<Broker[]> {
    return api.get('/api/brokers');
  },

  async getBrokerById(id: string): Promise<Broker | undefined> {
    return api.get(`/api/brokers/${id}`);
  },

  async saveBroker(broker: Broker, isNew: boolean): Promise<Broker> {
    const payload: any = { ...broker };
    if (isNew) {
      delete payload.id;
      delete payload.createdAt;
    }

    if (!isNew && broker.id) {
      return api.put(`/api/brokers/${broker.id}`, payload);
    }
    return api.post('/api/brokers', payload);
  },

  async deleteBroker(id: string): Promise<void> {
    try {
      await api.delete(`/api/brokers/${id}`);
    } catch (error) {
      console.error('Erro ao excluir corretora', error);
      throw error;
    }
  }
};
