import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Client, Document } from '../types';
import { Card, Button } from '../components/UIComponents';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { ChevronLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, FileText, Plus } from 'lucide-react';

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

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      const c = await storageService.getClientById(id);
      if (c) {
        setClient(c);
        const docs = await storageService.getDocumentsByClientId(id);
        setDocuments(docs);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteClient(id);
      navigate('/clients');
    } catch (error) {
      showToast("Erro ao excluir cliente. Verifique se existem propostas ativas.", "error");
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta proposta/apólice?')) {
      try {
        await storageService.deleteDocument(docId);
        setDocuments(documents.filter(d => d.id !== docId));
        showToast("Documento excluído com sucesso!", "success");
      } catch (error) {
        showToast("Erro ao excluir documento.", "error");
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!client) return <div className="p-8 text-center">Cliente não encontrado</div>;

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir ${client.name}? Todas as propostas associadas também serão excluídas. Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate('/clients')} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
          <span className={`ml-3 px-3 py-1 text-xs font-semibold rounded-full ${client.personType === 'Física'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-purple-100 text-purple-800'
            }`}>
            {client.personType === 'Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </span>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link to={`/clients/edit/${client.id}`} className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full sm:w-auto">
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex-1 sm:flex-none w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.personType === 'Física' ? (
                <>
                  <div>
                    <p className="text-sm text-slate-500">CPF</p>
                    <p className="font-medium">{client.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">RG</p>
                    <p className="font-medium">{client.rg} - {client.rgIssuer}</p>
                    <p className="text-xs text-slate-400">Expedição: {client.rgDispatchDate ? client.rgDispatchDate.split('T')[0].split('-').reverse().join('/') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Data de Nascimento</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {client.birthDate ? client.birthDate.split('T')[0].split('-').reverse().join('/') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Estado Civil</p>
                    <p className="font-medium">{client.maritalStatus}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-slate-500">CNPJ</p>
                  <p className="font-medium">{client.cnpj}</p>
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {client.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Telefone</p>
                <p className="font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" />
                  {client.phone}
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-slate-900 mt-8 mb-4">Endereço</h3>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-2 text-slate-400 mt-0.5" />
              <div>
                {client.address ? (
                  <>
                    <p className="font-medium">
                      {client.address.street}, {client.address.number} {client.address.complement && `- ${client.address.complement}`}
                    </p>
                    <p className="text-slate-600">
                      {client.address.neighborhood} - {client.address.city}/{client.address.state}
                    </p>
                    <p className="text-slate-500 text-sm">CEP: {client.address.zipCode}</p>
                  </>
                ) : (
                  <p className="text-slate-500">Endereço não cadastrado</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Propostas/Apólices</h3>
              <Link to={`/documents/new?clientId=${client.id}`} state={{ from: `/clients/${client.id}` }}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Nova
                </Button>
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p>Nenhuma proposta cadastrada para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full 
                          ${doc.status === 'Apólice' ? 'bg-green-100 text-green-800' :
                            doc.status === 'Cancelado' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {doc.status}
                        </span>
                        <span className="font-medium text-slate-900">{getDocumentTypeLabel(doc.type)}</span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{doc.company} - {doc.documentNumber}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Vigência: {doc.startDate ? doc.startDate.split('T')[0].split('-').reverse().join('/') : '-'} até {doc.endDate ? doc.endDate.split('T')[0].split('-').reverse().join('/') : '-'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link to={`/documents/edit/${doc.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        title="Excluir documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Info (Notes, etc) */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">Observações</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {client.notes || "Nenhuma observação registrada."}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
