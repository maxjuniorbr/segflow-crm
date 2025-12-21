import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Document, Client, DocumentStatusValue, InsuranceTypeValue } from '../../../types';
import { Card, Button, SearchInput, Select, Badge, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { actionMessages } from '../../../utils/actionMessages';

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
  const [loadClientsError, setLoadClientsError] = useState('');
  const [loadDocumentsError, setLoadDocumentsError] = useState('');

  const statusFilterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'Proposta', label: 'Proposta' },
    { value: 'Apólice', label: 'Apólice' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await storageService.getClients();
        setClients(clientsData);
        setLoadClientsError('');
      } catch (error) {
        console.error("Error loading clients:", error);
        setLoadClientsError(actionMessages.loadError('clientes'));
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
        setLoadDocumentsError('');
      } catch (error) {
        console.error("Error loading documents:", error);
        setLoadDocumentsError(actionMessages.loadError('propostas e apólices'));
      } finally {
        setDocumentsLoading(false);
        setRefreshing(false);
        initialLoadRef.current = false;
      }
    };
    fetchDocuments();
  }, [debouncedSearch, statusFilter]);

  const initialLoading = (documentsLoading && initialLoadRef.current) || clientsLoading;

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Propostas e apólices"
        subtitle="Gerencie propostas e apólices de seguros."
        action={(
          <Link to="/documents/new">
            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Nova proposta ou apólice
            </Button>
          </Link>
        )}
      />

      {(loadClientsError || loadDocumentsError) && (
        <Alert variant="error">{loadClientsError || loadDocumentsError}</Alert>
      )}

      <Card>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1 sm:flex-[2]">
            <SearchInput
              id="search-documents"
              name="search-documents"
              label="Buscar"
              placeholder={searchMessages.documents.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={searchMessages.documents.ariaLabel}
            />
          </div>
          <div className="sm:w-56">
            <Select
              id="status-filter"
              name="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | DocumentStatusValue)}
              options={statusFilterOptions}
              aria-label="Filtrar por status"
              label="Status"
            />
          </div>
        </div>

        {refreshing && !initialLoading && (
          <div className="flex items-center justify-end text-sm text-neutral-500 mb-3">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Atualizando resultados...
          </div>
        )}

        {initialLoading ? (
          <LoadingState label="Carregando propostas e apólices..." className="min-h-[220px]" />
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title={emptyStateMessages.documents.title}
            description={emptyStateMessages.documents.description(!!searchTerm)}
          />
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {documents.map((d) => {
                const client = clients.find(c => c.id === d.clientId);
                return (
                  <MobileListCard
                    key={d.id}
                    onClick={() => navigate(`/documents/edit/${d.id}`, { state: { from: '/documents' } })}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge status={d.status} />
                        <p className="mt-2 text-sm font-semibold text-neutral-900 truncate">
                          {client?.name || 'Cliente Removido'}
                        </p>
                        <p className="text-xs text-neutral-600">
                          {client?.personType === 'Jurídica' ? (client?.cnpj || '-') : (client?.cpf || '-')}
                        </p>
                      </div>
                      <div className="text-xs text-neutral-500 text-right">
                        <p>{d.startDate ? d.startDate.split('T')[0].split('-').reverse().join('/') : '-'}</p>
                        <p>até {d.endDate ? d.endDate.split('T')[0].split('-').reverse().join('/') : '-'}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-neutral-700">
                      {getDocumentTypeLabel(d.type)} - {d.company}
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {d.documentNumber || 'Número não informado'}
                    </div>
                  </MobileListCard>
                );
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Status</TableHeaderCell>
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Seguro</TableHeaderCell>
                  <TableHeaderCell>Vigência</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((d) => {
                  const client = clients.find(c => c.id === d.clientId);
                  return (
                    <TableRow
                      key={d.id}
                      className="cursor-pointer"
                      hover
                      onClick={() => navigate(`/documents/edit/${d.id}`, { state: { from: '/documents' } })}
                    >
                      <TableCell>
                        <Badge status={d.status} />
                      </TableCell>
                      <TableCell className="text-neutral-900">
                        <div className="text-sm font-medium text-neutral-900 max-w-[200px] truncate" title={client?.name || 'Cliente Removido'}>
                          {client?.name || 'Cliente Removido'}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {client?.personType === 'Jurídica' ? (client?.cnpj || '-') : (client?.cpf || '-')}
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-900">
                        <div className="text-sm text-neutral-900">{getDocumentTypeLabel(d.type)} - {d.company}</div>
                        <div className="text-sm text-neutral-500">{d.documentNumber || '-'}</div>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {d.startDate ? d.startDate.split('T')[0].split('-').reverse().join('/') : '-'} <br />até {d.endDate ? d.endDate.split('T')[0].split('-').reverse().join('/') : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          </>
        )}
      </Card>
    </div>
  );
};
