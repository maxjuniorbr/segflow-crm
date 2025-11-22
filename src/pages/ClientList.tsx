import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Client } from '../types';
import { Card, Button, Input } from '../components/UIComponents';
import { Search, Plus, ChevronRight, User as UserIcon } from 'lucide-react';

export const ClientList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [personTypeFilter, setPersonTypeFilter] = useState<'all' | 'Física' | 'Jurídica'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await storageService.getClients();
        const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setClients(sorted);
        setFilteredClients(sorted);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie sua base de clientes.</p>
        </div>
        <Link to="/clients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <Card>
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search-clients"
              name="search-clients"
              className="bg-white block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Buscar por nome, documento ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            id="person-type-filter"
            name="person-type-filter"
            value={personTypeFilter}
            onChange={(e) => setPersonTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">Todos</option>
            <option value="Física">Pessoa Física</option>
            <option value="Jurídica">Pessoa Jurídica</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner border-t-2 border-b-2 border-indigo-600 h-8 w-8 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando um novo cliente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome / Documento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 font-medium">{client.name?.charAt(0) || '?'}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={client.name}>
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.personType === 'Jurídica' ? client.cnpj : client.cpf}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-[200px] truncate" title={client.email}>{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.address?.city}, {client.address?.state}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};