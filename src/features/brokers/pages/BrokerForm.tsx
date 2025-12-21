import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Broker } from '../../../types';
import { Card, Input, Button, Alert, PageHeader, LoadingState } from '../../../shared/components/UIComponents';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { maskCNPJ, maskPhone } from '../../../utils/formatters';
import { confirmMessages } from '../../../utils/confirmMessages';
import { actionMessages } from '../../../utils/actionMessages';

export const BrokerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const emptyBroker: Broker = {
    id: '',
    corporateName: '',
    tradeName: '',
    cnpj: '',
    susepCode: '',
    contactName: '',
    email: '',
    phone: '',
    mobile: ''
  };

  const [formData, setFormData] = useState<Broker>(emptyBroker);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const loadBroker = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await storageService.getBrokerById(id);
        if (data) {
          setFormData({
            ...data,
            cnpj: data.cnpj || '',
            susepCode: data.susepCode || '',
            contactName: data.contactName || '',
            phone: data.phone || '',
            mobile: data.mobile || ''
          });
        }
    } catch (err) {
      setError(actionMessages.loadError('corretora'));
    } finally {
      setLoading(false);
    }
    };
    loadBroker();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'cnpj') value = maskCNPJ(value);
    if (name === 'phone' || name === 'mobile') value = maskPhone(value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await storageService.saveBroker(formData, isNew);
      showToast(isNew ? actionMessages.createSuccess('Corretora') : actionMessages.updateSuccess('Corretora'), 'success');
      navigate('/settings/brokers');
    } catch (err: any) {
      const message = err?.message || actionMessages.saveError('corretora');
      setError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteBroker(id);
      showToast(actionMessages.deleteSuccess('Corretora'), 'success');
      navigate('/settings/brokers');
    } catch (err) {
      showToast(actionMessages.deleteError('corretora'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <LoadingState label="Carregando corretora..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-0">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir corretora"
        message={confirmMessages.deleteDefault('esta corretora')}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <PageHeader
        title={isNew ? 'Nova corretora' : 'Editar corretora'}
        subtitle={isNew ? 'Preencha os campos para cadastrar uma nova corretora.' : 'Atualize as informações da corretora.'}
        leading={(
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500"
            aria-label="Voltar"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        action={!isNew ? (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} type="button" className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        ) : undefined}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Card title="Informações da corretora">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Razão Social"
              name="corporateName"
              value={formData.corporateName}
              onChange={handleChange}
              required
            />
            <Input
              label="Nome Fantasia"
              name="tradeName"
              value={formData.tradeName}
              onChange={handleChange}
              required
            />
            <Input
              label="CNPJ"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              required
              maxLength={18}
            />
            <Input
              label="Código SUSEP"
              name="susepCode"
              value={formData.susepCode || ''}
              onChange={handleChange}
              maxLength={20}
            />
          </div>
        </Card>

        <Card title="Contato">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Nome do Contato"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              label="E-mail"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={15}
            />
            <Input
              label="Celular"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength={15}
            />
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-neutral-200 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
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
