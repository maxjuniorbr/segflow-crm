import React, { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { Client, Document } from '../types';
import { Card } from '../components/UIComponents';
import { Users, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  const statCards = [
    { title: 'Total de Clientes', value: stats.totalClients, icon: Users, color: 'bg-blue-500' },
    { title: 'Apólices Ativas', value: stats.activeProposals, icon: CheckCircle, color: 'bg-green-500' },
    { title: 'Propostas Pendentes', value: stats.pendingProposals, icon: FileText, color: 'bg-yellow-500' },
    { title: 'A Vencer (30 dias)', value: stats.expiringSoon, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500 h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
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
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Próximos Vencimentos</h3>
          {recentDocuments.length === 0 ? (
            <p className="text-slate-500">Nenhuma apólice a vencer em breve.</p>
          ) : (
            <div className="space-y-4">
              {recentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{doc.clientName}</p>
                    <p className="text-sm text-slate-600">{doc.type} - {doc.company}</p>
                    <p className="text-sm text-slate-500">
                      Vence em: {doc.endDate ? new Date(doc.endDate).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                  <Link
                    to={`/documents/edit/${doc.id}`}
                    className="text-sm text-blue-600 hover:underline"
                    state={{ from: '/documents' }}
                  >
                    Ver
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Link to="/clients/new" className="block w-full p-3 text-center bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium transition-colors">
              Novo Cliente
            </Link>
            <Link to="/documents/new" className="block w-full p-3 text-center bg-slate-50 text-slate-700 rounded-md hover:bg-slate-100 font-medium transition-colors">
              Nova Proposta
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
