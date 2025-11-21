import { Client, Document, User } from '../types';
import { api } from './api';

export const storageService = {
  // --- Init / Seeding ---
  initialize: () => {
    // No client-side seeding needed anymore, handled by backend
  },

  // --- Auth/Users ---
  registerUser: async (user: { email: string, password: string }): Promise<void> => {
    await api.post('/register', user);
  },

  validateUser: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await api.post('/login', { email, password });
      // Backend retorna { token, user: { email, username, isAuthenticated } }
      // Precisamos mesclar o token com o objeto user
      if (response.token && response.user) {
        return {
          ...response.user,
          token: response.token
        };
      }
      return response;
    } catch (error) {
      console.error("Login failed", error);
      return null;
    }
  },

  // --- Clients ---

  getClients: async (): Promise<Client[]> => {
    return api.get('/clients');
  },

  getClientById: async (id: string): Promise<Client | undefined> => {
    try {
      return await api.get(`/clients/${id}`);
    } catch (e) {
      return undefined;
    }
  },

  saveClient: async (client: Client): Promise<void> => {
    // Check if update or create based on ID existence

    try {
      // Try to fetch the client first to determine if it's an update or create
      let exists = false;
      try {
        await api.get(`/clients/${client.id}`);
        exists = true;
      } catch (e) {
        exists = false;
      }

      if (exists) {
        await api.put(`/clients/${client.id}`, client);
      } else {
        await api.post('/clients', client);
      }
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  },

  deleteClient: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/clients/${id}`);
      return true;
    } catch (error) {
      throw error; // Propagate error (e.g. "active proposals")
    }
  },

  // --- Proposals ---



  // --- Documents ---
  getDocuments: async (): Promise<Document[]> => {
    try {
      return await api.get('/documents');
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  getDocumentById: async (id: string): Promise<Document | undefined> => {
    try {
      const documents = await api.get('/documents');
      return documents.find((d: Document) => d.id === id);
    } catch (error) {
      console.error('Error fetching document:', error);
      return undefined;
    }
  },

  saveDocument: async (document: Document): Promise<void> => {
    try {
      // Check if exists (simple check, ideally backend handles upsert or we check ID)
      const all = await api.get('/documents');
      const exists = all.some((d: Document) => d.id === document.id);

      if (exists) {
        await api.put(`/documents/${document.id}`, document);
      } else {
        await api.post('/documents', document);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },

  deleteDocument: async (id: string): Promise<void> => {
    try {
      await api.delete(`/documents/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  getDocumentsByClientId: async (clientId: string): Promise<Document[]> => {
    try {
      const all = await api.get('/documents');
      return all.filter((d: Document) => d.clientId === clientId);
    } catch (error) {
      console.error('Error fetching client documents:', error);
      return [];
    }
  }
};
