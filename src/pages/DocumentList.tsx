import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Document, Client } from '../types';
import { Card, Input, Button } from '../components/UIComponents';
import { Plus, Search, FileText } from 'lucide-react';

const getDocumentTypeLabel = (type: string) => {
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [docsData, clientsData] = await Promise.all([
          storageService.getDocuments(),
          storageService.getClients()
        ]);
        setDocuments(docsData);
        setClients(clientsData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredDocuments = () => {
    let result = documents;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(d => {
        const client = clients.find(c => c.id === d.clientId);
        const clientName = client ? client.name.toLowerCase() : '';
        return (
          d.documentNumber.toLowerCase().includes(lower) ||
          d.company.toLowerCase().includes(lower) ||
          clientName.includes(lower)
        );
      });
    }
    return result;
  };

  const filteredDocuments = getFilteredDocuments();

  if (loading) return <div className="p-8 text-center">Carregando...</div>;

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
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="search-documents"
            name="search-documents"
            placeholder="Buscar por cliente, número ou seguradora..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredDocuments.length === 0 ? (
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
                {filteredDocuments.map((d) => {
                  const client = clients.find(c => c.id === d.clientId);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/documents/edit/${d.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${d.status === 'Apólice' ? 'bg-green-100 text-green-800' :
                            d.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
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
                        <div className="text-sm text-gray-500">{d.documentNumber}</div>
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
