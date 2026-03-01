import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { DocumentListItem, DocumentStatusValue, InsuranceTypeValue } from '../../../types';
import { Card, Button, SearchInput, Select, Badge, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableRowButton, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Plus, FileText, Search } from 'lucide-react';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { uiMessages } from '../../../utils/uiMessages';
import { getDocumentTypeLabel, formatDate } from '../../../utils/formatters';

export const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DocumentStatusValue>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldRestoreSearch, setShouldRestoreSearch] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, nextCursor: null as string | null });

  useEffect(() => {
    let savedSearch: string | null = null;
    let savedStatus: string | null = null;
    let savedHasSearched: string | null = null;
    try {
      savedSearch = sessionStorage.getItem('documentList.searchTerm');
      savedStatus = sessionStorage.getItem('documentList.statusFilter');
      savedHasSearched = sessionStorage.getItem('documentList.hasSearched');
    } catch { /* sessionStorage unavailable */ }

    if (savedSearch) setSearchTerm(savedSearch);
    if (savedStatus) setStatusFilter(savedStatus as 'all' | DocumentStatusValue);
    if (savedHasSearched === 'true') {
      setHasSearched(true);
      setShouldRestoreSearch(true);
    }
  }, []);

  const statusFilterOptions = [
    { value: 'all', label: uiMessages.common.all },
    { value: uiMessages.statuses.proposal, label: uiMessages.statuses.proposal },
    { value: uiMessages.statuses.policy, label: uiMessages.statuses.policy },
    { value: uiMessages.statuses.endorsement, label: uiMessages.statuses.endorsement },
    { value: uiMessages.statuses.canceled, label: uiMessages.statuses.canceled },
    { value: uiMessages.statuses.expired, label: uiMessages.statuses.expired }
  ];

  const executeSearch = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);
    setPagination(prev => ({ ...prev, offset: 0, nextCursor: null }));

    try {
      sessionStorage.setItem('documentList.searchTerm', searchTerm);
      sessionStorage.setItem('documentList.statusFilter', statusFilter);
      sessionStorage.setItem('documentList.hasSearched', 'true');
    } catch { /* sessionStorage unavailable */ }

    try {
      const filters: { search?: string; status?: DocumentStatusValue; limit?: number } = { limit: pagination.limit };
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const docsData = await storageService.getDocuments(filters);
      setDocuments(docsData.items);
      setPagination({ total: docsData.total, limit: docsData.limit, offset: docsData.offset, nextCursor: docsData.nextCursor ?? null });
      setLoadError('');
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoadError(actionMessages.loadError('propostas e apólices'));
      setDocuments([]);
      setPagination(prev => ({ ...prev, total: 0, offset: 0, nextCursor: null }));
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, pagination.limit]);

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
      const filters: { search?: string; status?: DocumentStatusValue; limit?: number; cursor?: string | null } = {
        limit: pagination.limit,
        cursor: pagination.nextCursor
      };
      if (searchTerm) filters.search = searchTerm;
      if (statusFilter !== 'all') filters.status = statusFilter;

      const docsData = await storageService.getDocuments(filters);
      setDocuments(prev => [...prev, ...docsData.items]);
      setPagination({ total: docsData.total, limit: docsData.limit, offset: docsData.offset, nextCursor: docsData.nextCursor ?? null });
    } catch (error) {
      console.error('Error loading more documents:', error);
      setLoadError(actionMessages.loadError('propostas e apólices'));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={uiMessages.pages.documents.title}
        subtitle={uiMessages.pages.documents.subtitle}
        action={(
          <Button className="w-full sm:w-auto whitespace-nowrap" onClick={() => navigate('/documents/new')}>
            <Plus className="w-4 h-4 mr-2" />
            {uiMessages.pages.documents.actions.new}
          </Button>
        )}
      />

      {loadError && (
        <Alert variant="error">{loadError}</Alert>
      )}

      <Card>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1 sm:flex-[2]">
            <SearchInput
              id="search-documents"
              name="search-documents"
              label={uiMessages.common.search}
              placeholder={searchMessages.documents.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
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
              aria-label={uiMessages.filters.status}
              label={uiMessages.labels.status}
            />
          </div>
          <div className="sm:w-auto">
            <Button onClick={executeSearch} disabled={loading} className="w-full sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {uiMessages.common.search}
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingState label={actionMessages.loading('propostas e apólices')} className="min-h-[220px]" />
        ) : !hasSearched ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title={emptyStateMessages.documents.initialTitle}
            description={emptyStateMessages.documents.initialDescription}
          />
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
                return (
                  <MobileListCard
                    key={d.id}
                    onClick={() => navigate(`/documents/edit/${d.id}`, { state: { from: '/documents' } })}
                    aria-label={d.clientName || uiMessages.labels.clientRemoved}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge status={d.status} />
                        <p className="mt-2 text-sm font-semibold text-foreground truncate">
                          {d.clientName || uiMessages.labels.clientRemoved}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          {d.clientPersonType === 'Jurídica' ? (d.clientCnpj || '-') : (d.clientCpf || '-')}
                        </p>
                      </div>
                      <div className="text-xs text-muted text-right">
                        <p>{d.startDate ? formatDate(d.startDate) : '-'}</p>
                        <p>{uiMessages.common.until} {d.endDate ? formatDate(d.endDate) : '-'}</p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
                      {getDocumentTypeLabel(d.type)} - {d.company}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {d.documentNumber || uiMessages.placeholders.documentNumberNotInformed}
                    </div>
                  </MobileListCard>
                );
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>{uiMessages.tableHeaders.documents.status}</TableHeaderCell>
                    <TableHeaderCell>{uiMessages.tableHeaders.documents.client}</TableHeaderCell>
                    <TableHeaderCell>{uiMessages.tableHeaders.documents.insurance}</TableHeaderCell>
                    <TableHeaderCell>{uiMessages.tableHeaders.documents.validity}</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents.map((d) => {
                    return (
                      <TableRowButton
                        key={d.id}
                        onClick={() => navigate(`/documents/edit/${d.id}`, { state: { from: '/documents' } })}
                        aria-label={d.clientName || uiMessages.labels.clientRemoved}
                      >
                        <TableCell>
                          <Badge status={d.status} />
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm font-medium text-foreground max-w-[200px] truncate" title={d.clientName || uiMessages.labels.clientRemoved}>
                            {d.clientName || uiMessages.labels.clientRemoved}
                          </div>
                          <div className="text-sm text-muted">
                            {d.clientPersonType === 'Jurídica' ? (d.clientCnpj || '-') : (d.clientCpf || '-')}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm text-foreground">{getDocumentTypeLabel(d.type)} - {d.company}</div>
                          <div className="text-sm text-muted">{d.documentNumber || uiMessages.placeholders.documentNumberNotInformed}</div>
                        </TableCell>
                        <TableCell className="text-xs text-muted">
                          {d.startDate ? formatDate(d.startDate) : '-'} <br />{uiMessages.common.until} {d.endDate ? formatDate(d.endDate) : '-'}
                        </TableCell>
                      </TableRowButton>
                    );
                  })}
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
        )}
      </Card>
    </div>
  );
};
