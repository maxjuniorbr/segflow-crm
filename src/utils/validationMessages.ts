export const validationMessages = {
  required: (field: string) => `${field} é obrigatório.`,
  invalid: (field: string) => `${field} inválido.`,
  passwordMismatch: 'As senhas não conferem.',
  passwordMinLength: (count: number) => `A senha deve ter no mínimo ${count} caracteres.`,
  passwordMinLengthStrong: (count: number) =>
    `A nova senha deve ter no mínimo ${count} caracteres, combinando letras e números.`,
  dateRange: 'A data de início não pode ser posterior à data de fim.',
  cpfInvalidDetails: 'CPF inválido. Verifique os números digitados.',
  cnpjInvalidDetails: 'CNPJ inválido. Verifique os números digitados.',
  emailAlreadyExistsHint: 'Verifique se o email já não está cadastrado.',
  passwordRequiredNewUser: 'Senha é obrigatória para novos usuários.',
  confirmPasswordRequired: 'Confirmação de senha é obrigatória.',
  currentPasswordRequired: 'Senha atual é obrigatória.',
  newPasswordRequired: 'Nova senha é obrigatória.'
};
