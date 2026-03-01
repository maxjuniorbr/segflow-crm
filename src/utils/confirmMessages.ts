export const confirmMessages = {
  deleteDefault: (item: string) => `Tem certeza que deseja excluir ${item}? Esta ação não pode ser desfeita.`,
  deleteWithNote: (item: string, note: string) =>
    `Tem certeza que deseja excluir ${item}? ${note} Esta ação não pode ser desfeita.`
};
