import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        <h1 className="text-2xl font-bold text-slate-900">Propostas/Apólices</h1>
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
            <Search className="h-5 w-5 text-slate-400" />
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

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Seguro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vigência</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredDocuments.map((d) => {
                const client = clients.find(c => c.id === d.clientId);
                return (
                  <tr key={d.id} className="hover:bg-slate-50">
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
                      <div className="text-sm text-slate-900">{getDocumentTypeLabel(d.type)} - {d.company}</div>
                      <div className="text-sm text-slate-500">{d.documentNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {d.startDate ? d.startDate.split('T')[0].split('-').reverse().join('/') : '-'} <br />até {d.endDate ? d.endDate.split('T')[0].split('-').reverse().join('/') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/documents/edit/${d.id}`} className="text-blue-600 hover:text-blue-900">
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p>Nenhuma proposta encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
