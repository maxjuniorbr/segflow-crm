import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Broker } from '../../../types';
import { Card, Button } from '../../../shared/components/UIComponents';
import { Loader2, Search, Building2 } from 'lucide-react';

export const BrokerList: React.FC = () => {
  const navigate = useNavigate();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

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
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corretoras</h1>
          <p className="mt-1 text-sm text-gray-500">Gerencie as corretoras parceiras do SegFlow.</p>
        </div>
        <Link to="/settings/brokers/new">
          <Button className="w-full sm:w-auto">
            <Building2 className="w-4 h-4 mr-2" />
            Nova Corretora
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
              id="search-brokers"
              name="search-brokers"
              className="bg-white block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              placeholder="Buscar por nome, CNPJ, contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">Nenhuma corretora encontrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Ajuste sua busca para encontrar corretoras.' : 'Cadastre uma nova corretora para começar.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome Fantasia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razão Social</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código SUSEP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((broker) => (
                  <tr
                    key={broker.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/settings/brokers/${broker.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{broker.tradeName}</div>
                      <div className="text-xs text-gray-500">{broker.createdAt ? new Date(broker.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.corporateName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.cnpj || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{broker.susepCode || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{broker.contactName || '-'}</div>
                      <div className="text-sm text-gray-500">{broker.email}</div>
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
