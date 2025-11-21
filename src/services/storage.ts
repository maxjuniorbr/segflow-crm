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
    // Check if update or create
    // Ideally the ID check should be robust. Here we assume if we can fetch it, it exists, or we rely on PUT/POST logic.
    // For simplicity in this refactor, let's try to update, if 404 then create? 
    // Or better: The UI usually knows if it's editing. 
    // But to keep interface compatible:

    // Let's try to GET first (inefficient but safe for this refactor without changing UI logic)
    // Actually, the backend supports PUT /clients/:id and POST /clients.
    // We can check if the client exists in the list? No, that's heavy.
    // Let's assume if the UI passes a client that was "loaded", it's an update.
    // But `saveClient` signature doesn't tell us context.

    // Strategy: Try PUT. If backend returns 404 (or we can just use POST for new IDs).
    // Since IDs are UUIDs generated on frontend (usually), we can just use POST if it's new.
    // But wait, the backend `INSERT` might fail if ID exists.
    // Let's try to fetch it first.

    try {
      await api.get(`/clients/${client.id}`);
      // If success, it exists -> PUT
      await api.put(`/clients/${client.id}`, client);
    } catch (e) {
      // If error (404), -> POST
      await api.post('/clients', client);
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
      // For this implementation, if ID exists in list, update, else create.
      // But here we are calling API.
      // We need to know if it's create or update.
      // The form usually passes an ID.

      // Let's try to fetch it first or assume if it has an ID that matches an existing one...
      // Actually, the backend logic is: POST for create, PUT for update.
      // We can try to update, if 404 then create? Or check list.

      // Better: The UI should call create or update explicitly, but this service method is generic "save".
      // Let's check if we can find it.
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
