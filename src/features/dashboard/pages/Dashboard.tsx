import React, { useEffect, useState } from 'react';
import { storageService } from '../../../services/storage';
import { DashboardStats } from '../../../types';
import { Card, LoadingState, Alert, Button, SectionTitle, HelperText, PageHeader } from '../../../shared/components/UIComponents';
import { Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dashboardMessages } from '../../../utils/dashboardMessages';
import { uiMessages } from '../../../utils/uiMessages';
import { formatDate } from '../../../utils/formatters';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activePolicies: 0,
    pendingProposals: 0,
    expiringSoon: 0,
    upcomingExpirations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await storageService.getDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(dashboardMessages.errors.loadError);
        console.error("Error loading dashboard data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingState label={uiMessages.common.loading} />;
  if (error) return <Alert variant="error">{error}</Alert>;


  const statCards = [
    { title: dashboardMessages.stats.totalClients, value: stats.totalClients, icon: Users, bgColor: 'bg-brand-500/10', textColor: 'text-brand-500', borderColor: 'border-l-brand-500' },
    { title: dashboardMessages.stats.activeProposals, value: stats.activePolicies, icon: CheckCircle, bgColor: 'bg-success-500/10', textColor: 'text-success-500', borderColor: 'border-l-success-500' },
    { title: dashboardMessages.stats.pendingProposals, value: stats.pendingProposals, icon: FileText, bgColor: 'bg-warning-500/10', textColor: 'text-warning-500', borderColor: 'border-l-warning-500' },
    { title: dashboardMessages.stats.expiringSoon, value: stats.expiringSoon, icon: AlertCircle, bgColor: 'bg-danger-500/10', textColor: 'text-danger-500', borderColor: 'border-l-danger-500' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title={dashboardMessages.title} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={`border-l-4 ${stat.borderColor} h-full`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionTitle className="mb-4">{dashboardMessages.sections.upcomingExpirations}</SectionTitle>
          {stats.upcomingExpirations.length === 0 ? (
            <HelperText>{dashboardMessages.emptyStates.noExpirations}</HelperText>
          ) : (
            <div className="space-y-3">
              {stats.upcomingExpirations.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-sm transition hover:border-brand-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{doc.clientName}</p>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 truncate">{doc.type} - {doc.company}</p>
                    <p className="mt-2 text-xs text-muted">
                      {doc.endDate ? uiMessages.documents.expiresIn(formatDate(doc.endDate)) : '-'}
                    </p>
                  </div>
                  <Link
                    to={`/documents/edit/${doc.id}`}
                    className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline whitespace-nowrap"
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
            <Button className="w-full" onClick={() => navigate('/clients/new')}>{dashboardMessages.actions.newClient}</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/documents/new')}>{dashboardMessages.actions.newDocument}</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
