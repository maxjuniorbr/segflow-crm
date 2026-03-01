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
import { getDocumentTypeLabel, formatDate } from '../../../utils/formatters';

export const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteDocumentDialog, setShowDeleteDocumentDialog] = useState(false);
  const [documentToDeleteId, setDocumentToDeleteId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      setLoadError(false);
      try {
        const [c, docs] = await Promise.all([
          storageService.getClientById(id),
          storageService.getDocumentsByClientId(id),
        ]);
        if (!cancelled) {
          if (c) setClient(c);
          setDocuments(docs || []);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(true);
          console.error('Erro ao carregar dados do cliente:', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteClient(id);
      showToast(actionMessages.deleteSuccess('Cliente'), 'success');
      navigate('/clients');
    } catch {
      showToast(actionMessages.deleteErrorWithHint('cliente', 'Verifique se existem propostas ativas.'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!documentToDeleteId) return;
    try {
      await storageService.deleteDocument(documentToDeleteId);
      setDocuments(prev => prev.filter(d => d.id !== documentToDeleteId));
      showToast(actionMessages.deleteSuccess('Documento'), 'success');
    } catch {
      showToast(actionMessages.deleteError('documento'), 'error');
    } finally {
      setShowDeleteDocumentDialog(false);
      setDocumentToDeleteId(null);
    }
  };

  if (loading) return <LoadingState label={uiMessages.common.loading} />;
  if (loadError) {
    return (
      <EmptyState
        title={emptyStateMessages.clientLoadError.title}
        description={emptyStateMessages.clientLoadError.description}
        className="py-10"
      />
    );
  }
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
        title={uiMessages.confirmTitles.deleteClient}
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
        title={uiMessages.confirmTitles.deletePolicy}
        message={confirmMessages.deleteDefault('esta proposta ou apólice')}
        confirmText={uiMessages.common.delete}
        cancelText={uiMessages.common.cancel}
        variant="danger"
      />

      <PageHeader
        title={client.name}
        subtitle={(
          <Tag variant={client.personType === 'Física' ? 'info' : 'warning'}>
            {client.personType === 'Física' ? uiMessages.labels.personTypeIndividual : uiMessages.labels.personTypeCompany}
          </Tag>
        )}
        leading={(
          <button
            onClick={() => navigate('/clients')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-muted transition-colors"
            aria-label={uiMessages.common.back}
            title={uiMessages.common.back}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        action={(
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none w-full sm:w-auto" onClick={() => navigate(`/clients/edit/${client.id}`)}>
              <Edit className="w-4 h-4 mr-2" /> {uiMessages.common.edit}
            </Button>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="flex-1 sm:flex-none w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" /> {uiMessages.common.delete}
            </Button>
          </div>
        )}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <SectionTitle as="h2" className="mb-4">{uiMessages.sections.personalInfo}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {client.personType === 'Física' ? (
                <>
                  <div>
                    <p className="text-sm text-muted">{uiMessages.labels.cpf}</p>
                    <p className="font-medium">{client.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">{uiMessages.labels.rg}</p>
                    <p className="font-medium">{client.rg} - {client.rgIssuer}</p>
                    <p className="text-xs text-muted">{uiMessages.labels.rgDispatchDate}: {client.rgDispatchDate ? formatDate(client.rgDispatchDate) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">{uiMessages.labels.birthDate}</p>
                    <p className="font-medium flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted" />
                      {client.birthDate ? formatDate(client.birthDate) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">{uiMessages.labels.maritalStatus}</p>
                    <p className="font-medium">{client.maritalStatus}</p>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted">{uiMessages.labels.cnpj}</p>
                  <p className="font-medium">{client.cnpj}</p>
                </div>
              )}
            </div>

            <SectionTitle as="h2" className="mt-8 mb-4">{uiMessages.sections.contact}</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-w-0">
                <p className="text-sm text-muted">{uiMessages.labels.email}</p>
                <p className="font-medium flex items-center" title={client.email}>
                  <Mail className="w-4 h-4 mr-2 text-muted flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted">{uiMessages.labels.phone}</p>
                <p className="font-medium flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted flex-shrink-0" />
                  <span className="truncate">{client.phone}</span>
                </p>
              </div>
            </div>

            <SectionTitle as="h2" className="mt-8 mb-4">{uiMessages.sections.address}</SectionTitle>
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-2 text-muted mt-0.5" />
              <div>
                {client.address ? (
                  <>
                    <p className="font-medium">
                      {client.address.street}, {client.address.number} {client.address.complement && `- ${client.address.complement}`}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {client.address.neighborhood} - {client.address.city}/{client.address.state}
                    </p>
                    <p className="text-muted text-sm">{uiMessages.labels.zipCode}: {client.address.zipCode}</p>
                  </>
                ) : (
                  <p className="text-muted">{uiMessages.placeholders.addressNotProvided}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <SectionTitle as="h2">{uiMessages.sections.documents}</SectionTitle>
              <Button size="sm" onClick={() => navigate(`/documents/new?clientId=${client.id}`, { state: { from: `/clients/${client.id}` } })}>
                <Plus className="w-4 h-4 mr-1" /> {uiMessages.pages.documents.actions.new}
              </Button>
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
                  <div key={doc.id} className="border border-border rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge status={doc.status} />
                        <span className="font-medium text-foreground">{getDocumentTypeLabel(doc.type)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{doc.company} - {doc.documentNumber}</p>
                      <p className="text-xs text-muted mt-1">
                        {uiMessages.documents.validity(doc.startDate ? formatDate(doc.startDate) : '-', doc.endDate ? formatDate(doc.endDate) : '-')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/documents/edit/${doc.id}`}
                        className="text-brand-600 hover:text-brand-800 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        state={{ from: `/clients/${client.id}` }}
                        aria-label={uiMessages.common.edit}
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setDocumentToDeleteId(doc.id);
                          setShowDeleteDocumentDialog(true);
                        }}
                        className="text-danger-500 hover:text-danger-700 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-danger-50 dark:hover:bg-danger-900/20 cursor-pointer"
                        title={uiMessages.confirmTitles.deleteDocument}
                        aria-label={uiMessages.common.delete}
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
            <SectionTitle as="h2" className="mb-3">{uiMessages.sections.notes}</SectionTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {client.notes || uiMessages.placeholders.noNotes}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
