export const actionMessages = {
  createSuccess: (item: string) => `${item} criado com sucesso!`,
  updateSuccess: (item: string) => `${item} atualizado com sucesso!`,
  saveError: (item: string) => `Erro ao salvar ${item}.`,
  loadError: (item: string) => `Erro ao carregar ${item}.`,
  deleteSuccess: (item: string) => `${item} excluído com sucesso!`,
  deleteError: (item: string) => `Erro ao excluir ${item}.`,
  deleteErrorWithHint: (item: string, hint: string) => `Erro ao excluir ${item}. ${hint}`,
  deleteBlockedSelf: (item: string) => `Você não pode excluir seu próprio ${item}.`,
  deleteBlockedAccount: 'Você não pode excluir sua própria conta.',
  passwordChangeSuccess: 'Senha alterada com sucesso!',
  passwordChangeError: 'Erro ao alterar senha.',
  passwordChangeSelfOnly: 'Você só pode alterar sua própria senha.',
  loading: (item: string) => `Carregando ${item}...`
};
