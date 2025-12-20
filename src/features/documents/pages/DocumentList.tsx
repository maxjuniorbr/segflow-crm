import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Document, Client, DocumentStatusValue, InsuranceTypeValue } from '../../../types';
import { Card, Button } from '../../../shared/components/UIComponents';
import { Plus, Search, FileText, Loader2 } from 'lucide-react';

const getDocumentTypeLabel = (type: InsuranceTypeValue) => {
  const typeMap: { [key: string]: string } = {
    'Auto': 'Automóvel',
    'Life': 'Vida',
    'Residential': 'Residencial',
    'Corporate': 'Empresarial',
    'Health': 'Saúde',
    'Travel': 'Viagem',
  };
  return typeMap[type] || type;
};

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatusValue>('all');
  const initialLoadRef = useRef(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await storageService.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!initialLoadRef.current) {
        setRefreshing(true);
      }
      try {
        const filters: { search?: string; status?: DocumentStatusValue; limit?: number } = {
          limit: 200
        };
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== 'all') filters.status = statusFilter;
        const docsData = await storageService.getDocuments(filters);
        setDocuments(docsData);
      } catch (error) {
        console.error("Error loading documents:", error);
      } finally {
        setDocumentsLoading(false);
        setRefreshing(false);
        initialLoadRef.current = false;
      }
    };
    fetchDocuments();
  }, [debouncedSearch, statusFilter]);

  const initialLoading = (documentsLoading && initialLoadRef.current) || clientsLoading;

  const getStatusBadgeClasses = (status: string) => {
    const base = 'px-3 py-1 inline-flex text-xs font-semibold rounded-full border';
    switch (status) {
      case 'Apólice':
        return `${base} bg-green-50 text-green-700 border-green-200`;
      case 'Cancelado':
        return `${base} bg-red-50 text-red-700 border-red-200`;
      default:
        return `${base} bg-yellow-50 text-yellow-700 border-yellow-200`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas/Apólices</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie propostas e apólices de seguros.</p>
        </div>
        <Link to="/documents/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search-documents"
              name="search-documents"
              className="bg-white block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Buscar por cliente, número ou seguradora..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            id="status-filter"
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatusValue)}
          >
            <option value="all">Todos</option>
            <option value="Proposta">Proposta</option>
            <option value="Apólice">Apólice</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {refreshing && !initialLoading && (
          <div className="flex items-center justify-end text-sm text-gray-500 mb-3">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Atualizando resultados...
          </div>
        )}

        {initialLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando propostas e apólices...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">Nenhuma proposta encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Ajuste sua busca para encontrar propostas.' : 'Comece criando uma nova proposta.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seguro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigência</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((d) => {
                  const client = clients.find(c => c.id === d.clientId);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/documents/edit/${d.id}`, { state: { from: '/documents' } })}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadgeClasses(d.status)}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={client?.name || 'Cliente Removido'}>
                          {client?.name || 'Cliente Removido'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {client?.personType === 'Jurídica' ? (client?.cnpj || '-') : (client?.cpf || '-')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getDocumentTypeLabel(d.type)} - {d.company}</div>
                        <div className="text-sm text-gray-500">{d.documentNumber || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {d.startDate ? d.startDate.split('T')[0].split('-').reverse().join('/') : '-'} <br />até {d.endDate ? d.endDate.split('T')[0].split('-').reverse().join('/') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
