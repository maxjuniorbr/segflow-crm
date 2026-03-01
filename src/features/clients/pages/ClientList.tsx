import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Client, PersonType } from '../../../types';
import { Card, Button, SearchInput, Select, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableRowButton, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Plus, Users, Search } from 'lucide-react';
import { actionMessages } from '../../../utils/actionMessages';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { uiMessages } from '../../../utils/uiMessages';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [personTypeFilter, setPersonTypeFilter] = useState<'all' | PersonType>('all');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldRestoreSearch, setShouldRestoreSearch] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, nextCursor: null as string | null });

  useEffect(() => {
    try {
      const savedSearch = sessionStorage.getItem('clientList.searchTerm');
      const savedPersonType = sessionStorage.getItem('clientList.personTypeFilter');
      const savedHasSearched = sessionStorage.getItem('clientList.hasSearched');

      if (savedSearch) setSearchTerm(savedSearch);
      if (savedPersonType) setPersonTypeFilter(savedPersonType as 'all' | PersonType);
      if (savedHasSearched === 'true') {
        setHasSearched(true);
        setShouldRestoreSearch(true);
      }
    } catch { /* sessionStorage unavailable */ }
  }, []);

  const personTypeOptions = [
    { value: 'all', label: uiMessages.common.all },
    { value: 'Física', label: uiMessages.labels.personTypeIndividual },
    { value: 'Jurídica', label: uiMessages.labels.personTypeCompany }
  ];

  const executeSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    setPagination(prev => ({ ...prev, offset: 0, nextCursor: null }));

    try {
      sessionStorage.setItem('clientList.searchTerm', searchTerm);
      sessionStorage.setItem('clientList.personTypeFilter', personTypeFilter);
      sessionStorage.setItem('clientList.hasSearched', 'true');
    } catch { /* sessionStorage unavailable */ }

    try {
      const filters: { search?: string; personType?: PersonType; limit?: number } = { limit: pagination.limit };
      if (searchTerm) filters.search = searchTerm;
      if (personTypeFilter !== 'all') filters.personType = personTypeFilter;

      const data = await storageService.getClients(filters);
      setClients(data.items);
      setPagination({ total: data.total, limit: data.limit, offset: data.offset, nextCursor: data.nextCursor ?? null });
      setLoadError('');
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setLoadError(actionMessages.loadError('clientes'));
      setClients([]);
      setPagination(prev => ({ ...prev, total: 0, offset: 0, nextCursor: null }));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, personTypeFilter, pagination.limit]);

  useEffect(() => {
    if (!shouldRestoreSearch) return;
    setShouldRestoreSearch(false);
    executeSearch();
  }, [shouldRestoreSearch, executeSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !pagination.nextCursor) return;
    setLoadingMore(true);
    try {
      const filters: { search?: string; personType?: PersonType; limit?: number; cursor?: string | null } = {
        limit: pagination.limit,
        cursor: pagination.nextCursor
      };
      if (searchTerm) filters.search = searchTerm;
      if (personTypeFilter !== 'all') filters.personType = personTypeFilter;

      const data = await storageService.getClients(filters);
      setClients(prev => [...prev, ...data.items]);
      setPagination({ total: data.total, limit: data.limit, offset: data.offset, nextCursor: data.nextCursor ?? null });
    } catch (error) {
      console.error('Erro ao carregar mais clientes:', error);
      setLoadError(actionMessages.loadError('clientes'));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={uiMessages.pages.clients.title}
        subtitle={uiMessages.pages.clients.subtitle}
        action={(
          <Button className="w-full sm:w-auto whitespace-nowrap" onClick={() => navigate('/clients/new')}>
            <Plus className="w-4 h-4 mr-2" />
            {uiMessages.pages.clients.actions.new}
          </Button>
        )}
      />

      {loadError && (
        <Alert variant="error">{loadError}</Alert>
      )}

      <Card>
        <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:flex-[2]">
            <SearchInput
              id="search-clients"
              name="search-clients"
              label={uiMessages.common.search}
              placeholder={searchMessages.clients.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label={searchMessages.clients.ariaLabel}
            />
          </div>
          <div className="sm:w-56">
            <Select
              id="person-type-filter"
              name="person-type-filter"
              value={personTypeFilter}
              onChange={(e) => setPersonTypeFilter(e.target.value as 'all' | PersonType)}
              options={personTypeOptions}
              aria-label={uiMessages.filters.personType}
              label={uiMessages.labels.personType}
            />
          </div>
          <div className="sm:w-auto">
            <Button onClick={executeSearch} disabled={loading} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {uiMessages.common.search}
            </Button>
          </div>
        </div>

        {(() => {
          if (loading) return <LoadingState label={actionMessages.loading('clientes')} className="min-h-[220px]" />;
          if (!hasSearched) return (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={emptyStateMessages.clients.initialTitle}
              description={emptyStateMessages.clients.initialDescription}
            />
          );
          if (clients.length === 0) return (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={emptyStateMessages.clients.title}
              description={emptyStateMessages.clients.description(!!searchTerm)}
              action={(
                <Button className="whitespace-nowrap" onClick={() => navigate('/clients/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  {uiMessages.pages.clients.actions.new}
                </Button>
              )}
            />
          );
          return (
          <>
            <div className="space-y-3 sm:hidden">
              {clients.map(client => (
                <MobileListCard key={client.id} onClick={() => navigate(`/clients/${client.id}`)} aria-label={client.name}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
                      <span className="text-brand-700 dark:text-brand-300 font-semibold text-sm">{(client.name?.charAt(0) || '?').toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{client.name}</p>
                        <span className="text-xs text-muted">{client.personType}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                        {client.personType === 'Jurídica' ? client.cnpj : client.cpf}
                      </p>
                      <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 truncate">{client.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted">
                        <span>{client.phone}</span>
                        <span>{client.address?.city}, {client.address?.state}</span>
                      </div>
                    </div>
                  </div>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>{uiMessages.tableHeaders.clients.client}</TableHeaderCell>
                    <TableHeaderCell>{uiMessages.tableHeaders.clients.contact}</TableHeaderCell>
                    <TableHeaderCell>{uiMessages.tableHeaders.clients.location}</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.map(client => (
                    <TableRowButton
                      key={client.id}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      aria-label={client.name}
                    >
                      <TableCell className="text-foreground">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center">
                            <span className="text-brand-700 dark:text-brand-300 font-semibold text-sm">{(client.name?.charAt(0) || '?').toUpperCase()}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-foreground max-w-[250px] truncate" title={client.name}>
                              {client.name}
                            </div>
                            <div className="text-sm text-muted">
                              {client.personType === 'Jurídica' ? client.cnpj : client.cpf}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="text-sm text-foreground max-w-[200px] truncate" title={client.email}>{client.email}</div>
                        <div className="text-sm text-muted">{client.phone}</div>
                      </TableCell>
                      <TableCell className="text-muted">
                        {client.address?.city}, {client.address?.state}
                      </TableCell>
                    </TableRowButton>
                  ))}
                </TableBody>
              </Table>
            </div>
            {pagination.nextCursor && (
              <div className="mt-4 flex justify-center">
                <Button variant="outline" onClick={handleLoadMore} isLoading={loadingMore}>
                  {uiMessages.common.loadMore}
                </Button>
              </div>
            )}
          </>
          );
        })()}
      </Card>
    </div>
  );
};
