import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Broker } from '../../../types';
import { Card, Button, SearchInput, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Building2 } from 'lucide-react';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { actionMessages } from '../../../utils/actionMessages';

export const BrokerList: React.FC = () => {
  const navigate = useNavigate();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const fetchBrokers = async () => {
      setLoading(true);
      try {
        const data = await storageService.getBrokers();
        setBrokers(data);
        setLoadError('');
      } catch (error) {
        console.error('Erro ao carregar corretoras:', error);
        setBrokers([]);
        setLoadError(actionMessages.loadError('corretoras'));
      } finally {
        setLoading(false);
      }
    };
    fetchBrokers();
  }, []);

  const filtered = brokers.filter(broker => {
    if (!debouncedSearch) return true;
    const term = debouncedSearch.toLowerCase();
    return (
      broker.tradeName.toLowerCase().includes(term) ||
      broker.corporateName.toLowerCase().includes(term) ||
      broker.cnpj?.toLowerCase().includes(term) ||
      broker.contactName?.toLowerCase().includes(term) ||
      broker.email?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return <LoadingState label="Carregando corretoras..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Corretoras"
        subtitle="Gerencie as corretoras parceiras do SegFlow."
        action={(
          <Link to="/settings/brokers/new">
            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Building2 className="w-4 h-4 mr-2" />
              Nova corretora
            </Button>
          </Link>
        )}
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
              label="Buscar"
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
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{broker.tradeName}</p>
                      <p className="mt-1 text-xs text-neutral-500 truncate">{broker.corporateName}</p>
                    </div>
                    <div className="text-xs text-neutral-500 text-right">
                      <p>{broker.cnpj || '-'}</p>
                      <p>SUSEP: {broker.susepCode || '-'}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-neutral-700 truncate">
                    {broker.contactName || 'Contato não informado'}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500 truncate">{broker.email || '-'}</div>
                </MobileListCard>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Nome Fantasia</TableHeaderCell>
                  <TableHeaderCell>Razão Social</TableHeaderCell>
                  <TableHeaderCell>CNPJ</TableHeaderCell>
                  <TableHeaderCell>Código SUSEP</TableHeaderCell>
                  <TableHeaderCell>Contato</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((broker) => (
                  <TableRow
                    key={broker.id}
                    className="cursor-pointer"
                    hover
                    onClick={() => navigate(`/settings/brokers/${broker.id}`)}
                  >
                    <TableCell className="text-neutral-900">
                      <div className="text-sm font-medium text-neutral-900">{broker.tradeName}</div>
                      <div className="text-xs text-neutral-500">{broker.createdAt ? new Date(broker.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
                    </TableCell>
                    <TableCell className="text-neutral-900">{broker.corporateName}</TableCell>
                    <TableCell className="text-neutral-900">{broker.cnpj || '-'}</TableCell>
                    <TableCell className="text-neutral-900">{broker.susepCode || '-'}</TableCell>
                    <TableCell className="text-neutral-900">
                      <div className="text-sm font-medium text-neutral-900">{broker.contactName || '-'}</div>
                      <div className="text-sm text-neutral-500">{broker.email}</div>
                    </TableCell>
                  </TableRow>
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
