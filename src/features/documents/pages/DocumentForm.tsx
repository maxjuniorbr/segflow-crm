import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Client, Document, DocumentFormData } from '../../../types';
import { Card, Input, Button, Select, Alert, DateInput, TextArea, PageHeader, LoadingState, FileDropzone } from '../../../shared/components/UIComponents';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ClientAutocomplete } from '../../clients/components/ClientAutocomplete';
import { ChevronLeft, Save, Trash2, Paperclip, Loader2 } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { validationMessages } from '../../../utils/validationMessages';
import { confirmMessages } from '../../../utils/confirmMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { uiMessages } from '../../../utils/uiMessages';

export const DocumentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState('');

  // ... (rest of state)

  const emptyDocument: DocumentFormData = {
    clientId: preselectedClientId || '',
    type: 'Auto',
    company: 'Porto Seguro',
    documentNumber: '',
    startDate: '',
    endDate: '',
    status: 'Proposta',
    notes: '',
    attachmentName: ''
  };

  const [formData, setFormData] = useState(emptyDocument);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const clientsData = await storageService.getClients();
        setClients(clientsData);

        if (id) {
          const d = await storageService.getDocumentById(id);
          if (d) {
            const { id: pid, ...rest } = d;
            setFormData({
              ...emptyDocument,
              ...rest,
              startDate: rest.startDate ? rest.startDate.split('T')[0] : '',
              endDate: rest.endDate ? rest.endDate.split('T')[0] : ''
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError(actionMessages.loadError('dados'));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let { name, value } = e.target;

    // Automação de vigência: se mudou a data de início, calcular fim automaticamente (+1 ano)
    if (name === 'startDate' && value) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      setFormData(prev => ({
        ...prev,
        [name]: value,
        endDate: endDate.toISOString().split('T')[0]
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, attachmentName: e.target.files![0].name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError(validationMessages.dateRange);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const document: Document = {
        id: id || '',
        ...formData
      };
      await storageService.saveDocument(document, !id);

      // Feedback via Toast
      showToast(id ? actionMessages.updateSuccess('Documento') : actionMessages.createSuccess('Documento'), 'success');

      // Redirecionamento inteligente baseado na origem
      const originPath = location.state?.from ||
        (formData.clientId ? `/clients/${formData.clientId}` : '/documents');

      navigate(originPath);
    } catch (e: any) {
      console.error(e);
      setError(e.message || actionMessages.saveError('documento'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteDocument(id);
      showToast(actionMessages.deleteSuccess('Documento'), 'success');
      navigate('/documents');
    } catch (error) {
      showToast(actionMessages.deleteError('documento'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  // ... (options arrays)

  const typeOptions = [
    { value: 'Auto', label: 'Automóvel' },
    { value: 'Life', label: 'Vida' },
    { value: 'Residential', label: 'Residencial' },
    { value: 'Corporate', label: 'Empresarial' },
    { value: 'Health', label: 'Saúde' },
    { value: 'Travel', label: 'Viagem' },
  ];

  const statusOptions = [
    { value: 'Proposta', label: 'Proposta' },
    { value: 'Apólice', label: 'Apólice' },
    { value: 'Cancelado', label: 'Cancelado' },
  ];

  const companyOptions = [
    { value: 'Porto Seguro', label: 'Porto Seguro' },
    { value: 'Azul Seguros', label: 'Azul Seguros' },
    { value: 'Itaú Seguros', label: 'Itaú Seguros' },
    { value: 'Allianz', label: 'Allianz' },
    { value: 'Tokio Marine', label: 'Tokio Marine' },
    { value: 'HDI Seguros', label: 'HDI Seguros' },
    { value: 'Mapfre', label: 'Mapfre' },
    { value: 'Bradesco Seguros', label: 'Bradesco Seguros' },
    { value: 'Mitsui Sumitomo', label: 'Mitsui Sumitomo' },
  ];

  if (loading) return <LoadingState label="Carregando documento..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-0">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir documento"
        message={confirmMessages.deleteDefault('este documento')}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <PageHeader
        title={id ? 'Editar proposta ou apólice' : 'Nova proposta ou apólice'}
        subtitle={id ? 'Atualize as informações da proposta ou apólice.' : 'Preencha as informações para cadastrar uma nova proposta ou apólice.'}
        leading={(
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"
            aria-label={uiMessages.common.back}
            title={uiMessages.common.back}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        action={id ? (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} type="button" className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        ) : undefined}
      />

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ClientAutocomplete
                clients={clients}
                value={formData.clientId}
                onChange={(clientId) => setFormData(prev => ({ ...prev, clientId }))}
                required
              />
            </div>

            <div>
              <Select
                label="Tipo de Seguro"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={typeOptions}
                required
              />
            </div>
            <div>
              <Select
                label="Seguradora"
                name="company"
                value={formData.company}
                onChange={handleChange}
                options={companyOptions}
                required
                autoComplete="off"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Número da Proposta ou Apólice"
                name="documentNumber"
                value={formData.documentNumber || ''}
                onChange={handleChange}
                placeholder="Opcional"
                autoComplete="off"
                maxLength={50}
              />
            </div>

            <div>
              <DateInput
                label="Início de Vigência"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <DateInput
                label="Fim de Vigência"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div>
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <FileDropzone
                id="file-upload"
                name="file-upload"
                label="Anexo (PDF/Imagem)"
                helperText="PNG, JPG, PDF até 10MB."
                selectedFileName={formData.attachmentName}
                icon={<Paperclip className="h-12 w-12" />}
                onFileChange={handleFileChange}
              />
            </div>

            <div className="sm:col-span-2">
              <TextArea
                id="notes"
                rows={3}
                name="notes"
                label="Observações"
                value={formData.notes || ''}
                onChange={handleChange}
                autoComplete="off"
                maxLength={1000}
              />
            </div>
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-neutral-200 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
};
