import { uiBaseMessages } from './uiBaseMessages';
import { uiNavigationMessages } from './uiNavigationMessages';

const newUserLabel = 'Novo usuário';
const newClientLabel = 'Novo cliente';
const newDocumentLabel = 'Nova proposta ou apólice';
const newBrokerLabel = 'Nova corretora';
const changePasswordLabel = 'Alterar senha';

export const uiPageMessages = {
    pages: {
        users: {
            title: uiNavigationMessages.navigation.users,
            subtitle: 'Gerencie os usuários do sistema.',
            actions: {
                new: newUserLabel
            },
            form: {
                editTitle: 'Editar usuário',
                newTitle: newUserLabel,
                editSubtitle: 'Atualize os dados do usuário.',
                newSubtitle: 'Preencha os dados do usuário.',
                passwordHelp: 'Gerencie a senha de acesso.',
                securityTitle: 'Segurança',
                initialPasswordLabel: 'Senha Inicial',
                changePasswordTitle: changePasswordLabel,
                changePasswordAction: changePasswordLabel,
                changePasswordHelper: 'A nova senha deve ter no mínimo 10 caracteres, combinando maiúsculas, minúsculas e números.',
                currentPasswordLabel: 'Senha atual',
                newPasswordLabel: 'Nova senha',
                confirmNewPasswordLabel: 'Confirmar nova senha'
            }
        },
        clients: {
            title: uiNavigationMessages.navigation.clients,
            subtitle: 'Gerencie sua base de clientes.',
            actions: {
                new: newClientLabel
            },
            form: {
                editTitle: 'Editar cliente',
                newTitle: 'Cadastrar cliente',
                subtitle: 'Preencha as informações abaixo para registrar um novo segurado.'
            }
        },
        documents: {
            title: uiNavigationMessages.navigation.documents,
            subtitle: 'Gerencie propostas e apólices de seguros.',
            actions: {
                new: newDocumentLabel
            },
            form: {
                editTitle: 'Editar proposta ou apólice',
                newTitle: newDocumentLabel,
                editSubtitle: 'Atualize as informações da proposta ou apólice.',
                newSubtitle: 'Preencha as informações para cadastrar uma nova proposta ou apólice.'
            }
        },
        brokers: {
            title: uiNavigationMessages.navigation.brokers,
            subtitle: 'Gerencie as corretoras parceiras do SegFlow.',
            actions: {
                new: newBrokerLabel
            },
            form: {
                editTitle: 'Editar corretora',
                newTitle: newBrokerLabel,
                editSubtitle: 'Atualize as informações da corretora.',
                newSubtitle: 'Preencha os campos para cadastrar uma nova corretora.'
            }
        }
    },
    tableHeaders: {
        users: {
            nameCpf: 'Nome / CPF'
        },
        clients: {
            client: uiBaseMessages.labels.client,
            contact: uiBaseMessages.labels.contact,
            location: uiBaseMessages.labels.location
        },
        brokers: {
            tradeName: uiBaseMessages.labels.tradeName,
            corporateName: uiBaseMessages.labels.corporateName,
            cnpj: uiBaseMessages.labels.cnpj,
            susepCode: uiBaseMessages.labels.susepCode,
            contact: uiBaseMessages.labels.contact
        },
        documents: {
            status: uiBaseMessages.labels.status,
            client: uiBaseMessages.labels.client,
            insurance: uiBaseMessages.labels.insurance,
            validity: uiBaseMessages.labels.validity
        }
    },
    confirmTitles: {
        deleteUser: 'Excluir usuário',
        deleteClient: 'Excluir cliente',
        deleteDocument: 'Excluir documento',
        deleteBroker: 'Excluir corretora',
        deletePolicy: 'Excluir proposta ou apólice'
    },
    documents: {
        viewDetails: 'Ver detalhes',
        expiresIn: (date: string) => `Vence em: ${date}`,
        validity: (start: string, end: string) => `Vigência: ${start} até ${end}`
    }
};
