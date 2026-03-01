export const searchMessages = {
  clients: {
    placeholder: 'Buscar por nome, documento ou email',
    ariaLabel: 'Buscar clientes'
  },
  users: {
    placeholder: 'Buscar por nome, CPF ou email',
    ariaLabel: 'Buscar usuários'
  },
  documents: {
    placeholder: 'Buscar por cliente, número ou seguradora',
    ariaLabel: 'Buscar propostas e apólices'
  },
  brokers: {
    placeholder: 'Buscar por nome, CNPJ, contato',
    ariaLabel: 'Buscar corretoras'
  },
  validation: {
    minLength: (min: number) => `Digite pelo menos ${min} caracteres para buscar`,
    typeMore: (remaining: number) => `Digite mais ${remaining} caractere${remaining > 1 ? 's' : ''} para buscar.`
  },
  noResults: (item: string) => `Nenhum ${item} encontrado`
};
