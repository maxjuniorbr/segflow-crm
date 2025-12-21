export const uiMessages = {
    common: {
        back: 'Voltar',
        edit: 'Editar',
        delete: 'Excluir',
        cancel: 'Cancelar',
        save: 'Salvar',
        loading: 'Carregando...',
        actions: 'Ações',
        close: 'Fechar'
    },
    labels: {
        client: 'Cliente',
        name: 'Nome',
        email: 'Email',
        phone: 'Telefone',
        address: 'Endereço',
        cpf: 'CPF',
        cnpj: 'CNPJ',
        rg: 'RG',
        birthDate: 'Data de Nascimento',
        maritalStatus: 'Estado Civil',
        notes: 'Observações'
    },
    sections: {
        personalInfo: 'Informações pessoais',
        contact: 'Contato',
        address: 'Endereço',
        documents: 'Propostas e apólices',
        notes: 'Observações',
        quickActions: 'Ações rápidas'
    },
    placeholders: {
        notInformed: 'Não informado',
        noNotes: 'Nenhuma observação registrada.',
        loading: 'Carregando...'
    },
    documents: {
        new: 'Nova proposta ou apólice',
        viewDetails: 'Ver detalhes',
        expiresIn: (date: string) => `Vence em: ${date}`,
        validity: (start: string, end: string) => `Vigência: ${start} até ${end}`
    }
};
