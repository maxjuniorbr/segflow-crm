import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Client, Document } from '../types';
import { Card, Input, Button, Select, Alert } from '../components/UIComponents';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ClientAutocomplete } from '../components/ClientAutocomplete';
import { ChevronLeft, Save, Trash2, Paperclip, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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

  const emptyDocument: Omit<Document, 'id'> = {
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
        setError("Erro ao carregar dados.");
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
      setError("A data de início não pode ser posterior à data de fim.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    try {
      const document: Document = {
        id: id || Math.random().toString(36).substr(2, 9),
        ...formData
      };
      await storageService.saveDocument(document, !id);

      // Feedback via Toast
      showToast(id ? 'Documento atualizado com sucesso!' : 'Documento criado com sucesso!', 'success');

      // Redirecionamento inteligente baseado na origem
      const originPath = location.state?.from ||
        (formData.clientId ? `/clients/${formData.clientId}` : '/documents');

      navigate(originPath);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erro ao salvar documento");
      showToast("Erro ao salvar documento.", "error");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteDocument(id);
      showToast("Documento excluído com sucesso!", "success");
      navigate('/documents');
    } catch (error) {
      showToast("Erro ao excluir documento.", "error");
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir Documento"
        message="Tem certeza que deseja excluir este documento permanentemente? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{id ? 'Editar Proposta/Apólice' : 'Nova Proposta/Apólice'}</h1>
        </div>
        {id && (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} type="button" className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error">{error}</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Client Selection */}
            <div className="sm:col-span-2">
              <ClientAutocomplete
                clients={clients}
                value={formData.clientId}
                onChange={(clientId) => setFormData(prev => ({ ...prev, clientId }))}
                required
                disabled={!!preselectedClientId && !id}
              />
            </div>

            {/* Basic Info */}
            <Select
              label="Tipo de Seguro *"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={typeOptions}
              required
            />
            <Select
              label="Status *"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
              required
            />

            <Select
              label="Seguradora *"
              name="company"
              value={formData.company}
              onChange={handleChange}
              options={companyOptions}
              required
            />

            <Input label="Número Proposta/Apólice *" name="documentNumber" value={formData.documentNumber} onChange={handleChange} required />

            {/* Vigência */}
            <div className="sm:col-span-2 pt-2">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 border-b border-slate-100 pb-1">Vigência</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" label="Início *" name="startDate" value={formData.startDate} onChange={handleChange} required />
                <Input type="date" label="Fim *" name="endDate" value={formData.endDate} onChange={handleChange} required />
              </div>
            </div>

            {/* Anexo */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Anexar Apólice (PDF/Imagem)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md hover:bg-slate-50 transition-colors">
                <div className="space-y-1 text-center">
                  {formData.attachmentName ? (
                    <div className="flex items-center justify-center text-blue-600">
                      <Paperclip className="w-6 h-6 mr-2" />
                      <span className="font-medium">{formData.attachmentName}</span>
                      <button type="button" onClick={() => setFormData({ ...formData, attachmentName: '' })} className="ml-2 text-red-500 text-sm hover:underline">(Remover)</button>
                    </div>
                  ) : (
                    <>
                      <Paperclip className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span>Upload de arquivo</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/*" />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PDF, PNG, JPG até 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
              <textarea
                name="notes"
                rows={3}
                className="bg-white text-slate-900 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-slate-300 rounded-md p-2 border"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" isLoading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Documento
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
