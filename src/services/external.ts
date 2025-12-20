
export interface CepResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood?: string;
  street?: string;
  service: string;
}

export const externalService = {
  fetchAddressByCep: async (cep: string): Promise<CepResponse | null> => {
    try {
      // Remove non-numeric characters
      const cleanCep = cep.replace(/\D/g, '');
      
      if (cleanCep.length !== 8) {
        return null;
      }

      const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);
      
      if (!response.ok) {
        throw new Error('CEP not found');
      }

      const data = await response.json();
      return data as CepResponse;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      return null;
    }
  }
};
