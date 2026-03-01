import { Client, Document, User, Broker, DocumentStatusValue, DashboardStats, PersonType, PaginatedResponse, DocumentListItem } from '../types';
import { api, ApiError } from './api';

export const storageService = {
  async init() {
    return;
  },

  async registerBroker(data: {
    corporateName: string;
    tradeName: string;
    cnpj: string;
    susepCode?: string | null;
    phone?: string | null;
    mobile?: string | null;
    email: string;
    contactName: string;
    cpf: string;
    password: string;
  }) {
    await api.post('/api/register-broker', data, { suppressToast: true });
  },

  validateUser: async (email: string, password: string): Promise<User | null> => {
    try {
      const data = await api.post('/api/login', { email, password }, { redirectOnAuthError: false, suppressToast: true });
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
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Erro ao encerrar sessão', error);
    }
  },

  async getClients(filters?: { search?: string; personType?: PersonType; limit?: number; offset?: number; cursor?: string | null }): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.personType) params.append('personType', filters.personType);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.cursor) params.append('cursor', filters.cursor);

    const query = params.toString();
    return api.get(`/api/clients${query ? `?${query}` : ''}`);
  },

  getClientById: async (id: string): Promise<Client | undefined> => {
    return api.get(`/api/clients/${id}`);
  },

  async saveClient(client: Client, isNew: boolean = false): Promise<Client> {
    const { id: _id, createdAt: _ca, ...rest } = client;
    const payload = isNew ? rest : client;

    if (!isNew && client.id) {
      return api.put(`/api/clients/${client.id}`, payload, { suppressToast: true });
    }
    return api.post('/api/clients', payload, { suppressToast: true });
  },

  deleteClient: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/clients/${id}`, { suppressToast: true });
      return true;
    } catch (error) {
      throw error; // Propagate error (e.g. "active proposals")
    }
  },

  // --- Proposals ---



  async getDocuments(filters?: { clientId?: string; status?: DocumentStatusValue; search?: string; limit?: number; offset?: number; cursor?: string | null }): Promise<PaginatedResponse<DocumentListItem>> {
    const params = new URLSearchParams();
    if (filters?.clientId) params.append('clientId', filters.clientId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));
    if (filters?.cursor) params.append('cursor', filters.cursor);

    const query = params.toString();
    return api.get(`/api/documents${query ? `?${query}` : ''}`);
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    return api.get(`/api/documents/${id}`);
  },

  async saveDocument(doc: Document, isNew: boolean = false): Promise<Document> {
    const { id: _id, createdAt: _ca, ...rest } = doc;
    const payload = isNew ? rest : doc;

    if (!isNew && doc.id) {
      return api.put(`/api/documents/${doc.id}`, payload, { suppressToast: true });
    }
    return api.post('/api/documents', payload, { suppressToast: true });
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/documents/${id}`, { suppressToast: true });
    } catch (error) {
      console.error('Erro ao excluir documento', error);
      throw error;
    }
  },

  getDocumentsByClientId: async (clientId: string): Promise<Document[]> => {
    const params = new URLSearchParams({ clientId, limit: '200' });
    const response = await api.get(`/api/documents?${params.toString()}`);
    return response.items ?? [];
  },

  async getBrokers(): Promise<Broker[]> {
    return api.get('/api/brokers');
  },

  async getBrokerById(id: string): Promise<Broker | undefined> {
    return api.get(`/api/brokers/${id}`);
  },

  async saveBroker(broker: Broker, isNew: boolean): Promise<Broker> {
    const { id: _id, createdAt: _ca, ...rest } = broker;
    const payload = isNew ? rest : broker;

    if (!isNew && broker.id) {
      return api.put(`/api/brokers/${broker.id}`, payload, { suppressToast: true });
    }
    return api.post('/api/brokers', payload, { suppressToast: true });
  },

  async deleteBroker(id: string): Promise<void> {
    try {
      await api.delete(`/api/brokers/${id}`, { suppressToast: true });
    } catch (error) {
      console.error('Erro ao excluir corretora', error);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return api.get('/api/dashboard/stats');
  }
};
