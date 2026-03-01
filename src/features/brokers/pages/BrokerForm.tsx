import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { Broker, FormErrors } from '../../../types';
import { Card, Input, Button, Alert, PageHeader, LoadingState } from '../../../shared/components/UIComponents';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ChevronLeft, Save, Trash2 } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { maskCNPJ, maskPhone } from '../../../utils/formatters';
import { isValidCNPJ, isValidEmail } from '../../../utils/validators';
import { validationMessages } from '../../../utils/validationMessages';
import { confirmMessages } from '../../../utils/confirmMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { uiMessages } from '../../../utils/uiMessages';

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
  const [fieldErrors, setFieldErrors] = useState<FormErrors<Broker>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const loadBroker = async () => {
      setLoading(true);
      try {
        const data = await storageService.getBrokerById(id);
        if (!cancelled && data) {
          setFormData({
            ...data,
            cnpj: data.cnpj || '',
            susepCode: data.susepCode || '',
            contactName: data.contactName || '',
            phone: data.phone || '',
            mobile: data.mobile || ''
          });
        }
      } catch (_err) {
        if (!cancelled) setError(actionMessages.loadError('corretora'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadBroker();
    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'cnpj') value = maskCNPJ(value);
    if (name === 'phone' || name === 'mobile') value = maskPhone(value);

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (fieldErrors[name as keyof Broker]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj && formData.cnpj.trim() !== '') {
      if (isValidCNPJ(formData.cnpj)) {
        setFieldErrors(prev => ({ ...prev, cnpj: '' }));
      } else {
        setFieldErrors(prev => ({ ...prev, cnpj: validationMessages.cnpjInvalidDetails }));
      }
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      setFieldErrors(prev => ({ ...prev, email: validationMessages.invalid(uiMessages.labels.email) }));
    }
  };

  const validate = () => {
    const errors: FormErrors<Broker> = {};

    if (!formData.corporateName.trim()) {
      errors.corporateName = validationMessages.required(uiMessages.labels.corporateName);
    }

    if (!formData.tradeName.trim()) {
      errors.tradeName = validationMessages.required(uiMessages.labels.tradeName);
    }

    if (!formData.cnpj.trim()) {
      errors.cnpj = validationMessages.required(uiMessages.labels.cnpj);
    } else if (!isValidCNPJ(formData.cnpj)) {
      errors.cnpj = validationMessages.cnpjInvalidDetails;
    }

    if (!formData.contactName.trim()) {
      errors.contactName = validationMessages.required(uiMessages.labels.contactName);
    }

    if (!formData.email.trim()) {
      errors.email = validationMessages.required(uiMessages.labels.email);
    } else if (!isValidEmail(formData.email)) {
      errors.email = validationMessages.invalid(uiMessages.labels.email);
    }

    if (!formData.phone.trim()) {
      errors.phone = validationMessages.required(uiMessages.labels.phone);
    }

    if (!formData.mobile.trim()) {
      errors.mobile = validationMessages.required(uiMessages.labels.mobile);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    if (!validate()) {
      setSaving(false);
      return;
    }
    try {
      await storageService.saveBroker(formData, isNew);
      showToast(isNew ? actionMessages.createSuccess('Corretora') : actionMessages.updateSuccess('Corretora'), 'success');
      navigate('/settings/brokers');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : actionMessages.saveError('corretora');
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
    } catch (_err) {
      showToast(actionMessages.deleteError('corretora'), 'error');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <LoadingState label={actionMessages.loading('corretora')} />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-0">
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        title={uiMessages.confirmTitles.deleteBroker}
        message={confirmMessages.deleteDefault('esta corretora')}
        confirmText={uiMessages.common.delete}
        cancelText={uiMessages.common.cancel}
        variant="danger"
      />

      <PageHeader
        title={isNew ? uiMessages.pages.brokers.form.newTitle : uiMessages.pages.brokers.form.editTitle}
        subtitle={isNew ? uiMessages.pages.brokers.form.newSubtitle : uiMessages.pages.brokers.form.editSubtitle}
        leading={(
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full text-muted transition-colors"
            aria-label={uiMessages.common.back}
            title={uiMessages.common.back}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        action={isNew ? undefined : (
          <Button variant="danger" onClick={() => setShowDeleteDialog(true)} type="button" className="w-full sm:w-auto">
            <Trash2 className="w-4 h-4 mr-2" /> {uiMessages.common.delete}
          </Button>
        )}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <Card title={uiMessages.sections.brokerInfo}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label={uiMessages.labels.corporateName}
              name="corporateName"
              value={formData.corporateName}
              onChange={handleChange}
              placeholder={uiMessages.placeholders.corporateName}
              error={fieldErrors.corporateName}
              required
            />
            <Input
              label={uiMessages.labels.tradeName}
              name="tradeName"
              value={formData.tradeName}
              onChange={handleChange}
              placeholder={uiMessages.placeholders.tradeName}
              error={fieldErrors.tradeName}
              required
            />
            <Input
              label={uiMessages.labels.cnpj}
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              onBlur={handleCnpjBlur}
              placeholder={uiMessages.placeholders.cnpj}
              error={fieldErrors.cnpj}
              required
              maxLength={18}
            />
            <Input
              label={uiMessages.labels.susepCode}
              name="susepCode"
              value={formData.susepCode || ''}
              onChange={handleChange}
              placeholder={uiMessages.placeholders.susepCode}
              error={fieldErrors.susepCode}
              maxLength={20}
            />
          </div>
        </Card>

        <Card title={uiMessages.sections.contact}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label={uiMessages.labels.contactName}
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              error={fieldErrors.contactName}
              required
            />
            <Input
              type="email"
              label={uiMessages.labels.email}
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              placeholder={uiMessages.placeholders.brokerEmail}
              error={fieldErrors.email}
              required
            />
            <Input
              label={uiMessages.labels.phone}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={uiMessages.placeholders.phone}
              error={fieldErrors.phone}
              required
              maxLength={15}
            />
            <Input
              label={uiMessages.labels.mobile}
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder={uiMessages.placeholders.mobile}
              error={fieldErrors.mobile}
              required
              maxLength={15}
            />
          </div>
        </Card>

        <div className="fixed bottom-0 left-0 right-0 bg-card p-4 border-t border-border shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>{uiMessages.common.cancel}</Button>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            {uiMessages.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
};
