import React, { useEffect, useState } from 'react';
import { storageService } from '../../../services/storage';
import { Client, Document } from '../../../types';
import { Card, LoadingState, Button, SectionTitle, HelperText, PageHeader } from '../../../shared/components/UIComponents';
import { Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardMessages } from '../../../utils/dashboardMessages';
import { uiMessages } from '../../../utils/uiMessages';

interface DocumentWithClient extends Document {
  clientName?: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProposals: 0,
    pendingProposals: 0,
    expiringSoon: 0
  });
  const [recentDocuments, setRecentDocuments] = useState<DocumentWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clients, documents] = await Promise.all([
          storageService.getClients(),
          storageService.getDocuments()
        ]);

        // Create a map of clientId to client name for easy lookup
        const clientMap = new Map<string, string>();
        clients.forEach(client => {
          clientMap.set(client.id, client.name);
        });

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const active = documents.filter(p => p.status === 'Apólice').length;
        const pending = documents.filter(p => p.status === 'Proposta').length;
        const expiring = documents.filter(p => {
          if (!p.endDate) return false;
          const end = new Date(p.endDate);
          return end > now && end <= thirtyDaysFromNow;
        }).length;

        setStats({
          totalClients: clients.length,
          activeProposals: active,
          pendingProposals: pending,
          expiringSoon: expiring
        });

        const upcomingExpirations = documents
          .filter(doc => {
            if (!doc.endDate || doc.status === 'Cancelado') return false;
            const end = new Date(doc.endDate);
            return end >= now;
          })
          .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
          .slice(0, 5)
          .map(doc => ({
            ...doc,
            clientName: clientMap.get(doc.clientId) || 'Cliente não encontrado'
          }));

        setRecentDocuments(upcomingExpirations);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingState label={uiMessages.placeholders.loading} />;

  const statCards = [
    { title: dashboardMessages.stats.totalClients, value: stats.totalClients, icon: Users, color: 'bg-brand-500' },
    { title: dashboardMessages.stats.activeProposals, value: stats.activeProposals, icon: CheckCircle, color: 'bg-success-500' },
    { title: dashboardMessages.stats.pendingProposals, value: stats.pendingProposals, icon: FileText, color: 'bg-warning-500' },
    { title: dashboardMessages.stats.expiringSoon, value: stats.expiringSoon, icon: AlertCircle, color: 'bg-danger-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={dashboardMessages.title} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-brand-500 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle className="mb-4">{dashboardMessages.sections.upcomingExpirations}</SectionTitle>
          {recentDocuments.length === 0 ? (
            <HelperText>{dashboardMessages.emptyStates.noExpirations}</HelperText>
          ) : (
            <div className="space-y-3">
              {recentDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-brand-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{doc.clientName}</p>
                    <p className="text-xs sm:text-sm text-neutral-600 truncate">{doc.type} - {doc.company}</p>
                    <p className="mt-2 text-xs text-neutral-500">
                      {doc.endDate ? uiMessages.documents.expiresIn(new Date(doc.endDate).toLocaleDateString('pt-BR')) : '-'}
                    </p>
                  </div>
                  <Link
                    to={`/documents/edit/${doc.id}`}
                    className="text-sm font-medium text-brand-600 hover:underline whitespace-nowrap"
                    state={{ from: '/documents' }}
                  >
                    {uiMessages.documents.viewDetails}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle className="mb-4">{dashboardMessages.sections.quickActions}</SectionTitle>
          <div className="space-y-3">
            <Link to="/clients/new" className="block">
              <Button className="w-full">{dashboardMessages.actions.newClient}</Button>
            </Link>
            <Link to="/documents/new" className="block">
              <Button variant="outline" className="w-full">{dashboardMessages.actions.newDocument}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
