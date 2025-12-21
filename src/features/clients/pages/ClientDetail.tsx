import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Client, Document } from '../../../types';
import { Card, Button, Badge, LoadingState, Tag, EmptyState, SectionTitle, PageHeader } from '../../../shared/components/UIComponents';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { useToast } from '../../../contexts/ToastContext';
import { ChevronLeft, Edit, Trash2, Mail, Phone, MapPin, Calendar, FileText, Plus } from 'lucide-react';
import { confirmMessages } from '../../../utils/confirmMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { emptyStateMessages } from '../../../utils/emptyStateMessages';
import { uiMessages } from '../../../utils/uiMessages';

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
  const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] = useState(false);
  const [documentToDeleteId, setDocumentToDeleteId] = useState<string | null>(null);

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
      showToast(actionMessages.deleteSuccess('Cliente'), 'success');
      navigate('/clients');
    } catch (error) {
      showToast(actionMessages.deleteErrorWithHint('cliente', 'Verifique se existem propostas ativas.'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDeleteId) return;
    try {
      await storageService.deleteDocument(documentToDeleteId);
      setDocuments(documents.filter(d => d.id !== documentToDeleteId));
      showToast(actionMessages.deleteSuccess('Documento'), 'success');
    } catch (error) {
      showToast(actionMessages.deleteError('documento'), 'error');
    } finally {
      setShowDeleteDocumentDialog(false);
      setDocumentToDeleteId(null);
    }
  };

  if (loading) return <LoadingState label={uiMessages.placeholders.loading} />;
  if (!client) {
    return (
      <EmptyState
        title={emptyStateMessages.clientNotFound.title}
        description={emptyStateMessages.clientNotFound.description}
        className="py-10"
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir cliente"
        message={confirmMessages.deleteWithNote(client.name, 'Todas as propostas associadas também serão excluídas.')}
        confirmText={uiMessages.common.delete}
        cancelText={uiMessages.common.cancel}
        variant="danger"
      />
      <ConfirmDialog
        isOpen={showDeleteDocumentDialog}
        onConfirm={handleDeleteDocument}
        onCancel={() => {
          setShowDeleteDocumentDialog(false);
          setDocumentToDeleteId(null);
        }}
        title="Excluir proposta ou apólice"
        message={confirmMessages.deleteDefault('esta proposta ou apólice')}
        confirmText={uiMessages.common.delete}
        cancelText={uiMessages.common.cancel}
        variant="danger"
      />

      <PageHeader
        title={client.name}
        subtitle={(
          <Tag variant={client.personType === 'Física' ? 'info' : 'warning'}>
            {client.personType === 'Física' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </Tag>
        )}
        leading={(
          <button
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"
            aria-label="Voltar"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        action={(
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Link to={`/clients/edit/${client.id}`} className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" /> {uiMessages.common.edit}
              </Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex-1 sm:flex-none w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" /> {uiMessages.common.delete}
            </Button>
          </div>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <SectionTitle className="mb-4">{uiMessages.sections.personalInfo}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.personType === 'Física' ? (
                <>
                  <div>
                    <p className="text-sm text-neutral-500">CPF</p>
                    <p className="font-medium">{client.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">RG</p>
                    <p className="font-medium">{client.rg} - {client.rgIssuer}</p>
                    <p className="text-xs text-neutral-500">Expedição: {client.rgDispatchDate ? client.rgDispatchDate.split('T')[0].split('-').reverse().join('/') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Data de Nascimento</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-neutral-400" />
                      {client.birthDate ? client.birthDate.split('T')[0].split('-').reverse().join('/') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Estado Civil</p>
                    <p className="font-medium">{client.maritalStatus}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-neutral-500">{uiMessages.labels.cnpj}</p>
                  <p className="font-medium">{client.cnpj}</p>
                </div>
              )}
            </div>

            <SectionTitle className="mt-8 mb-4">{uiMessages.sections.contact}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-w-0">
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium flex items-center" title={client.email}>
                  <Mail className="w-4 h-4 mr-2 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-neutral-500">Telefone</p>
                <p className="font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </p>
              </div>
            </div>

            <SectionTitle className="mt-8 mb-4">{uiMessages.sections.address}</SectionTitle>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-2 text-neutral-400 mt-0.5" />
              <div>
                {client.address ? (
                  <>
                    <p className="font-medium">
                      {client.address.street}, {client.address.number} {client.address.complement && `- ${client.address.complement}`}
                    </p>
                    <p className="text-neutral-600">
                      {client.address.neighborhood} - {client.address.city}/{client.address.state}
                    </p>
                    <p className="text-neutral-500 text-sm">CEP: {client.address.zipCode}</p>
                  </>
                ) : (
                  <p className="text-neutral-500">Endereço não cadastrado</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle>{uiMessages.sections.documents}</SectionTitle>
              <Link to={`/documents/new?clientId=${client.id}`} state={{ from: `/clients/${client.id}` }}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" /> {uiMessages.documents.new}
                </Button>
              </Link>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-10 w-10" />}
                title={emptyStateMessages.clientDocuments.title}
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge status={doc.status} />
                        <span className="font-medium text-neutral-900">{getDocumentTypeLabel(doc.type)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">{doc.company} - {doc.documentNumber}</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {uiMessages.documents.validity(client.birthDate ? client.birthDate.split('T')[0].split('-').reverse().join('/') : '-', doc.endDate ? doc.endDate.split('T')[0].split('-').reverse().join('/') : '-')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/documents/edit/${doc.id}`}
                        className="text-brand-600 hover:text-brand-800 text-sm font-medium"
                        state={{ from: `/clients/${client.id}` }}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setDocumentToDeleteId(doc.id);
                          setShowDeleteDocumentDialog(true);
                        }}
                        className="text-danger-500 hover:text-danger-700 text-sm font-medium cursor-pointer"
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

        <div className="space-y-4 sm:space-y-6">
          <Card>
            <SectionTitle className="text-sm uppercase tracking-wider mb-3">{uiMessages.sections.notes}</SectionTitle>
            <p className="text-sm text-neutral-600 whitespace-pre-wrap">
              {client.notes || uiMessages.placeholders.noNotes}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
