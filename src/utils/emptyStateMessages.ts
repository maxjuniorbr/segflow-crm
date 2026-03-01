import { uiBaseMessages } from './uiBaseMessages';

const searchFiltersHint = 'Use os filtros acima e clique em Buscar.';

export const emptyStateMessages = {
  clients: {
    title: 'Nenhum cliente encontrado',
    description: (hasSearch: boolean) =>
      hasSearch ? 'Ajuste sua busca para encontrar clientes.' : 'Comece adicionando um novo cliente.',
    initialTitle: 'Busque por clientes',
    initialDescription: searchFiltersHint
  },
  users: {
    title: 'Nenhum usuário encontrado',
    description: (hasSearch: boolean) =>
      hasSearch ? 'Ajuste sua busca para encontrar usuários.' : 'Aguarde cadastros de novos usuários.'
  },
  documents: {
    title: 'Nenhuma proposta ou apólice encontrada',
    description: (hasSearch: boolean) =>
      hasSearch ? 'Ajuste sua busca para encontrar propostas e apólices.' : 'Comece criando uma nova proposta ou apólice.',
    initialTitle: 'Busque por propostas ou apólices',
    initialDescription: searchFiltersHint
  },
  brokers: {
    title: 'Nenhuma corretora encontrada',
    description: (hasSearch: boolean) =>
      hasSearch ? 'Ajuste sua busca para encontrar corretoras.' : 'Cadastre uma nova corretora para começar.'
  },
  clientDocuments: {
    title: 'Nenhuma proposta cadastrada para este cliente.'
  },
  clientNotFound: {
    title: uiBaseMessages.labels.clientNotFound,
    description: 'Verifique se o cliente ainda existe ou volte para a lista.'
  },
  clientLoadError: {
    title: 'Erro ao carregar',
    description: 'Não foi possível carregar os dados do cliente. Verifique sua conexão e tente novamente.'
  }
};
