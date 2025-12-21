import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Client, PersonType } from '../../../types';
import { Card, Button, SearchInput, Select, PageHeader, LoadingState, EmptyState, MobileListCard, Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell, Alert } from '../../../shared/components/UIComponents';
import { Plus, Users } from 'lucide-react';
import { actionMessages } from '../../../utils/actionMessages';
import { searchMessages } from '../../../utils/searchMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [personTypeFilter, setPersonTypeFilter] = useState<'all' | PersonType>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const personTypeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'Física', label: 'Pessoa Física' },
    { value: 'Jurídica', label: 'Pessoa Jurídica' }
  ];

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await storageService.getClients();
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setClients(sorted);
        setFilteredClients(sorted);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        setLoadError(actionMessages.loadError('clientes'));
        setClients([]);
        setFilteredClients([]);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(client => {
      const matchesSearch =
        client.name?.toLowerCase().includes(term) ||
        client.cpf?.includes(term) ||
        client.cnpj?.includes(term) ||
        client.email?.toLowerCase().includes(term);

      const matchesType =
        personTypeFilter === 'all' || client.personType === personTypeFilter;

      return matchesSearch && matchesType;
    });
    setFilteredClients(filtered);
  }, [searchTerm, personTypeFilter, clients]);

  const isFiltering = !!searchTerm || personTypeFilter !== 'all';

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes."
        action={(
          <Link to="/clients/new">
            <Button className="w-full sm:w-auto whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Novo cliente
            </Button>
          </Link>
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
              label="Buscar"
              placeholder={searchMessages.clients.placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              aria-label="Filtrar por tipo de pessoa"
              label="Tipo de pessoa"
            />
          </div>
        </div>

        {loading ? (
          <LoadingState label="Carregando clientes..." className="min-h-[220px]" />
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title={emptyStateMessages.clients.title}
            description={emptyStateMessages.clients.description(isFiltering)}
            action={!isFiltering ? (
              <Link to="/clients/new">
                <Button className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo cliente
                </Button>
              </Link>
            ) : undefined}
          />
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {filteredClients.map(client => (
                <MobileListCard
                  key={client.id}
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-700 font-semibold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-900 truncate">{client.name}</p>
                        <span className="text-xs text-neutral-500">{client.personType}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600">
                        {client.personType === 'Jurídica' ? client.cnpj : client.cpf}
                      </p>
                      <p className="mt-2 text-sm text-neutral-700 truncate">{client.email}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
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
                  <TableHeaderCell>Cliente</TableHeaderCell>
                  <TableHeaderCell>Contato</TableHeaderCell>
                  <TableHeaderCell>Localização</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map(client => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    hover
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <TableCell className="text-neutral-900">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <span className="text-brand-700 font-semibold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900 max-w-[250px] truncate" title={client.name}>
                            {client.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {client.personType === 'Jurídica' ? client.cnpj : client.cpf}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-900">
                      <div className="text-sm text-neutral-900 max-w-[200px] truncate" title={client.email}>{client.email}</div>
                      <div className="text-sm text-neutral-500">{client.phone}</div>
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {client.address?.city}, {client.address?.state}
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
