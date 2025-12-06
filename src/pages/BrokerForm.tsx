import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Broker } from '../types';
import { Card, Input, Button, Alert } from '../components/UIComponents';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ChevronLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { maskCNPJ, maskPhone } from '../utils/formatters';

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
        setError('Erro ao carregar corretora.');
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
      showToast(isNew ? 'Corretora cadastrada com sucesso!' : 'Corretora atualizada com sucesso!', 'success');
      navigate('/settings/brokers');
    } catch (err: any) {
      const message = err?.message || 'Erro ao salvar corretora.';
      setError(message);
      showToast('Erro ao salvar corretora.', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await storageService.deleteBroker(id);
      showToast('Corretora excluída com sucesso!', 'success');
      navigate('/settings/brokers');
    } catch (err) {
      showToast('Erro ao excluir corretora.', 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 sm:pb-0">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title="Excluir Corretora"
        message="Tem certeza que deseja excluir esta corretora? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Nova Corretora' : 'Editar Corretora'}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isNew ? 'Preencha os campos para cadastrar uma nova corretora.' : 'Atualize as informações da corretora.'}
            </p>
          </div>
        </div>
        {!isNew && (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} type="button" className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card title="Informações da Corretora">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Razão Social *"
              name="corporateName"
              value={formData.corporateName}
              onChange={handleChange}
              required
            />
            <Input
              label="Nome Fantasia *"
              name="tradeName"
              value={formData.tradeName}
              onChange={handleChange}
              required
            />
            <Input
              label="CNPJ *"
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
              label="Nome do Contato *"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
            <Input
              type="email"
              label="E-mail *"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Telefone *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              maxLength={15}
            />
            <Input
              label="Celular *"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              maxLength={15}
            />
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Corretora
          </Button>
        </div>
      </form>
    </div>
  );
};
