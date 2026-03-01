import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Broker } from '../../../types';
import { Card, Button, SearchInput, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableRowButton, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Building2 } from 'lucide-react';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { uiMessages } from '../../../utils/uiMessages';

export const BrokerList: React.FC = () => {
  const navigate = useNavigate();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loadError, setLoadError] = useState('');
  const canCreateBroker = !loadError && brokers.length === 0;

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    const fetchBrokers = async () => {
      setLoading(true);
      try {
        const data = await storageService.getBrokers();
        if (!cancelled) {
          setBrokers(data);
          setLoadError('');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar corretoras:', error);
          setBrokers([]);
          setLoadError(actionMessages.loadError('corretoras'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchBrokers();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => brokers.filter(broker => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      broker.tradeName.toLowerCase().includes(term) ||
      broker.corporateName.toLowerCase().includes(term) ||
      broker.cnpj?.toLowerCase().includes(term) ||
      broker.contactName?.toLowerCase().includes(term) ||
      broker.email?.toLowerCase().includes(term)
    );
  }), [brokers, debouncedSearch]);

  if (loading) {
    return <LoadingState label={actionMessages.loading('corretoras')} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={uiMessages.pages.brokers.title}
        subtitle={uiMessages.pages.brokers.subtitle}
        action={canCreateBroker ? (
          <Button className="w-full sm:w-auto whitespace-nowrap" onClick={() => navigate('/settings/brokers/new')}>
            <Building2 className="w-4 h-4 mr-2" />
            {uiMessages.pages.brokers.actions.new}
          </Button>
        ) : undefined}
      />

      {loadError && (
        <Alert variant="error">{loadError}</Alert>
      )}

      <Card>
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
          <div className="flex-1">
            <SearchInput
              id="search-brokers"
              name="search-brokers"
              label={uiMessages.common.search}
              placeholder={searchMessages.brokers.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={searchMessages.brokers.ariaLabel}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-12 w-12" />}
            title={emptyStateMessages.brokers.title}
            description={emptyStateMessages.brokers.description(!!searchTerm)}
          />
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {filtered.map((broker) => (
                <MobileListCard
                  key={broker.id}
                  onClick={() => navigate(`/settings/brokers/${broker.id}`)}
                  aria-label={broker.tradeName}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{broker.tradeName}</p>
                      <p className="mt-1 text-xs text-muted truncate">{broker.corporateName}</p>
                    </div>
                    <div className="text-xs text-muted text-right">
                      <p>{broker.cnpj || '-'}</p>
                      <p>{uiMessages.labels.susep}: {broker.susepCode || '-'}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 truncate">
                    {broker.contactName || uiMessages.placeholders.contactNotInformed}
                  </div>
                  <div className="mt-1 text-xs text-muted truncate">{broker.email || '-'}</div>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>{uiMessages.tableHeaders.brokers.tradeName}</TableHeaderCell>
                  <TableHeaderCell>{uiMessages.tableHeaders.brokers.corporateName}</TableHeaderCell>
                  <TableHeaderCell>{uiMessages.tableHeaders.brokers.cnpj}</TableHeaderCell>
                  <TableHeaderCell>{uiMessages.tableHeaders.brokers.susepCode}</TableHeaderCell>
                  <TableHeaderCell>{uiMessages.tableHeaders.brokers.contact}</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((broker) => (
                  <TableRowButton
                    key={broker.id}
                    onClick={() => navigate(`/settings/brokers/${broker.id}`)}
                    aria-label={broker.tradeName}
                  >
                    <TableCell className="text-foreground">
                      <div className="text-sm font-medium text-foreground">{broker.tradeName}</div>
                      <div className="text-xs text-muted">{broker.createdAt ? new Date(broker.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
                    </TableCell>
                    <TableCell className="text-foreground">{broker.corporateName}</TableCell>
                    <TableCell className="text-foreground">{broker.cnpj || '-'}</TableCell>
                    <TableCell className="text-foreground">{broker.susepCode || '-'}</TableCell>
                    <TableCell className="text-foreground">
                      <div className="text-sm font-medium text-foreground">{broker.contactName || '-'}</div>
                      <div className="text-sm text-muted">{broker.email}</div>
                    </TableCell>
                  </TableRowButton>
                ))}
              </TableBody>
            </Table>
          </div>
          </>
        )}
      </Card>
    </div>
  );
};
