import { uiBaseMessages } from './uiBaseMessages';
import { uiNavigationMessages } from './uiNavigationMessages';
import { uiPageMessages } from './uiPageMessages';

export const dashboardMessages = {
    title: uiNavigationMessages.navigation.dashboard,
    stats: {
        totalClients: 'Total de Clientes',
        activeProposals: 'Apólices ativas',
        pendingProposals: 'Propostas pendentes',
        expiringSoon: 'Vencendo em 30 dias'
    },
    sections: {
        upcomingExpirations: 'Vencimentos próximos',
        quickActions: uiBaseMessages.sections.quickActions
    },
    emptyStates: {
        noExpirations: 'Nenhuma apólice a vencer.'
    },
    actions: {
        newClient: uiPageMessages.pages.clients.actions.new,
        newDocument: uiPageMessages.pages.documents.actions.new
    },
    errors: {
        loadError: 'Erro ao carregar dados do dashboard.'
    }
};
