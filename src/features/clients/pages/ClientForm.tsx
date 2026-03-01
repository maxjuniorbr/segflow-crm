import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { externalService } from '../../../services/external';
import { Client, ClientFormData } from '../../../types';
import { Card, Input, Button, Select, Alert, DateInput, TextArea, PageHeader, LoadingState, InputWithButton, HelperText } from '../../../shared/components/UIComponents';
import { ChevronLeft, Save, Search } from 'lucide-react';
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '../../../utils/formatters';
import { isValidCPF, isValidCNPJ, isValidEmail } from '../../../utils/validators';
import { useToast } from '../../../contexts/ToastContext';
import { validationMessages } from '../../../utils/validationMessages';
import { actionMessages } from '../../../utils/actionMessages';
import { scrollToFirstError } from '../../../utils/domUtils';
import { uiMessages } from '../../../utils/uiMessages';

const validatePersonFields = (data: ClientFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (data.personType === 'Física') {
    if (!data.cpf.trim()) {
      errors.cpf = validationMessages.required(uiMessages.labels.cpf);
    } else if (!isValidCPF(data.cpf)) {
      errors.cpf = validationMessages.cpfInvalidDetails;
    }
    if (!data.birthDate) {
      errors.birthDate = validationMessages.required(uiMessages.labels.birthDate);
    }
  }

  if (data.personType === 'Jurídica') {
    if (!data.cnpj.trim()) {
      errors.cnpj = validationMessages.required(uiMessages.labels.cnpj);
    } else if (!isValidCNPJ(data.cnpj)) {
      errors.cnpj = validationMessages.cnpjInvalidDetails;
    }
  }

  return errors;
};

const validateAddressFields = (address: ClientFormData['address']): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!address.zipCode.trim()) errors['addr.zipCode'] = validationMessages.required(uiMessages.labels.zipCode);
  if (!address.street.trim()) errors['addr.street'] = validationMessages.required(uiMessages.labels.street);
  if (!address.number.trim()) errors['addr.number'] = validationMessages.required(uiMessages.labels.number);
  if (!address.neighborhood.trim()) errors['addr.neighborhood'] = validationMessages.required(uiMessages.labels.neighborhood);
  if (!address.city.trim()) errors['addr.city'] = validationMessages.required(uiMessages.labels.city);
  if (!address.state.trim()) errors['addr.state'] = validationMessages.required(uiMessages.labels.state);
  return errors;
};

const EMPTY_CLIENT: ClientFormData = {
  name: '',
  personType: 'Física',
  cpf: '',
  cnpj: '',
  rg: '',
  rgDispatchDate: '',
  rgIssuer: '',
  birthDate: '',
  maritalStatus: 'Solteiro(a)',
  email: '',
  phone: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  },
  notes: ''
};

export const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const streetInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState(EMPTY_CLIENT);
  const [clientMeta, setClientMeta] = useState<{ createdAt?: string }>({});

  const [lockedFields, setLockedFields] = useState({
    street: true,
    neighborhood: true,
    city: true,
    state: true
  });

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Number.isNaN(age) ? '' : age.toString();
  };

  useEffect(() => {
    let cancelled = false;
    if (id) {
      setLoading(true);
      storageService.getClientById(id).then(client => {
        if (cancelled) return;
        if (client) {
          const { id: _clientId, createdAt, ...rest } = client;
          if (!rest.personType) rest.personType = 'Física';
          if (!rest.maritalStatus) rest.maritalStatus = 'Solteiro(a)';

          rest.cpf = rest.cpf || '';
          rest.cnpj = rest.cnpj || '';
          rest.rg = rest.rg || '';
          rest.rgIssuer = rest.rgIssuer || '';
          rest.email = rest.email || '';
          rest.phone = rest.phone || '';
          rest.notes = rest.notes || '';

          rest.birthDate = rest.birthDate ? rest.birthDate.substring(0, 10) : '';
          rest.rgDispatchDate = rest.rgDispatchDate ? rest.rgDispatchDate.substring(0, 10) : '';

          setFormData(rest);
          setClientMeta({ createdAt: createdAt || new Date().toISOString() });
          setCalculatedAge(calculateAge(rest.birthDate || ''));
        }
        setLoading(false);
      }).catch(err => {
        if (cancelled) return;
        console.error(err);
        setError(actionMessages.loadError('dados do cliente'));
        setLoading(false);
      });
    }
    return () => {
      cancelled = true;
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === 'cpf') value = maskCPF(value);
    if (name === 'cnpj') value = maskCNPJ(value);
    if (name === 'phone') value = maskPhone(value);
    if (name === 'addr.zipCode') value = maskCEP(value);

    if (name === 'birthDate') {
      setCalculatedAge(calculateAge(value));
    }

    if (name.startsWith('addr.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    if (name === 'personType') {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.cpf;
        delete next.cnpj;
        return next;
      });
    }
  };

  const handleCpfBlur = () => {
    if (formData.cpf && formData.cpf.trim() !== '') {
      if (isValidCPF(formData.cpf)) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.cpf;
          return next;
        });
      } else {
        setFieldErrors(prev => ({ ...prev, cpf: validationMessages.cpfInvalidDetails }));
      }
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj && formData.cnpj.trim() !== '') {
      if (isValidCNPJ(formData.cnpj)) {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.cnpj;
          return next;
        });
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

  const fetchAddress = async () => {
    const cep = formData.address.zipCode.replaceAll(/\D/g, '');
    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const addressData = await externalService.fetchAddressByCep(cep);

        if (addressData) {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: addressData.street || '',
              neighborhood: addressData.neighborhood || '',
              city: addressData.city || '',
              state: addressData.state || '',
            }
          }));

          const hasStreet = !!addressData.street;
          const hasNeighborhood = !!addressData.neighborhood;

          setLockedFields({
            city: true,
            state: true,
            street: hasStreet,
            neighborhood: hasNeighborhood
          });

          focusTimerRef.current = setTimeout(() => {
            if (hasStreet) {
              numberInputRef.current?.focus();
            } else {
              streetInputRef.current?.focus();
            }
          }, 100);

        } else {
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: '',
              neighborhood: '',
              city: '',
              state: '',
            }
          }));
          setLockedFields({ street: false, neighborhood: false, city: false, state: false });
          streetInputRef.current?.focus();
        }
      } catch {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: '',
            neighborhood: '',
            city: '',
            state: '',
          }
        }));
        setLockedFields({ street: false, neighborhood: false, city: false, state: false });
        streetInputRef.current?.focus();
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCepBlur = () => {
    fetchAddress();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = validationMessages.required(uiMessages.labels.fullName);
    Object.assign(errors, validatePersonFields(formData));
    if (!formData.email.trim()) {
      errors.email = validationMessages.required(uiMessages.labels.email);
    } else if (!isValidEmail(formData.email)) {
      errors.email = validationMessages.invalid(uiMessages.labels.email);
    }
    if (!formData.phone.trim()) errors.phone = validationMessages.required(uiMessages.labels.phoneMobile);
    Object.assign(errors, validateAddressFields(formData.address));
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSaving(false);
      requestAnimationFrame(() => scrollToFirstError());
      return;
    }

    try {
      const clientToSave: Client = {
        id: id || '',
        createdAt: id ? clientMeta.createdAt || new Date().toISOString() : new Date().toISOString(),
        ...formData
      };
      await storageService.saveClient(clientToSave, !id);

      showToast(id ? actionMessages.updateSuccess('Cliente') : actionMessages.createSuccess('Cliente'), 'success');

      navigate(id ? `/clients/${id}` : '/clients');
    } catch (error) {
      console.error("Error saving client:", error);
      setError(error instanceof Error ? error.message : actionMessages.saveError('cliente'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const maritalStatusOptions = [
    { value: 'Solteiro(a)', label: 'Solteiro(a)' },
    { value: 'Casado(a)', label: 'Casado(a)' },
    { value: 'Divorciado(a)', label: 'Divorciado(a)' },
    { value: 'Viúvo(a)', label: 'Viúvo(a)' },
    { value: 'União Estável', label: 'União Estável' },
  ];

  if (loading) return <LoadingState label={actionMessages.loading('cliente')} />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto pb-24 sm:pb-0">
      <PageHeader
        title={id ? uiMessages.pages.clients.form.editTitle : uiMessages.pages.clients.form.newTitle}
        subtitle={uiMessages.pages.clients.form.subtitle}
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
      />

      {error && (
        <Alert variant="error">
          {error}
          {error.includes('email') && (
            <p className="mt-2 text-sm">{validationMessages.emailAlreadyExistsHint}</p>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

        <Card title={uiMessages.sections.personType}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Select
                label={uiMessages.labels.personType}
                name="personType"
                value={formData.personType}
                onChange={handleChange}
                options={[
                  { value: 'Física', label: uiMessages.labels.personTypeIndividual },
                  { value: 'Jurídica', label: uiMessages.labels.personTypeCompany }
                ]}
                required
              />
            </div>
          </div>
        </Card>

        <Card title={uiMessages.sections.documentation}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input label={uiMessages.labels.fullName} name="name" value={formData.name} onChange={handleChange} required maxLength={200} error={fieldErrors.name} />
            </div>

            {formData.personType === 'Física' ? (
              <>
                <div className="sm:col-span-3">
                  <Input label={uiMessages.labels.cpf} name="cpf" value={formData.cpf || ''} onChange={handleChange} onBlur={handleCpfBlur} required maxLength={14} error={fieldErrors.cpf} />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label={uiMessages.labels.maritalStatus}
                    name="maritalStatus"
                    value={formData.maritalStatus || 'Solteiro(a)'}
                    onChange={handleChange}
                    options={maritalStatusOptions}
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <Input label={uiMessages.labels.rg} name="rg" value={formData.rg || ''} onChange={handleChange} maxLength={20} />
                </div>
                <div className="sm:col-span-3">
                  <Input label={uiMessages.labels.rgIssuer} name="rgIssuer" value={formData.rgIssuer || ''} onChange={handleChange} placeholder={uiMessages.placeholders.exampleSsp} maxLength={20} />
                </div>
                <div className="sm:col-span-3">
                  <DateInput label={uiMessages.labels.rgDispatchDate} name="rgDispatchDate" value={formData.rgDispatchDate || ''} onChange={handleChange} />
                </div>
                <div className="sm:col-span-3"></div>

                <div className="sm:col-span-3">
                  <DateInput label={uiMessages.labels.birthDate} name="birthDate" value={formData.birthDate || ''} onChange={handleChange} required error={fieldErrors.birthDate} />
                </div>
                <div className="sm:col-span-2">
                  <Input label={uiMessages.labels.age} name="age" id="age" value={calculatedAge} readOnly className="bg-background" />
                </div>
              </>
            ) : (
              <div className="sm:col-span-6">
                <Input label={uiMessages.labels.cnpj} name="cnpj" value={formData.cnpj || ''} onChange={handleChange} onBlur={handleCnpjBlur} required maxLength={18} error={fieldErrors.cnpj} />
              </div>
            )}
          </div>
        </Card>

        <Card title={uiMessages.sections.contacts}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input type="email" label={uiMessages.labels.email} name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} required maxLength={254} error={fieldErrors.email} />
            </div>
            <div className="sm:col-span-6">
              <Input type="tel" label={uiMessages.labels.phoneMobile} name="phone" value={formData.phone} onChange={handleChange} required maxLength={15} error={fieldErrors.phone} />
            </div>
          </div>
        </Card>

        <Card title={uiMessages.sections.address}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <InputWithButton
                id="zipCode"
                name="addr.zipCode"
                label={uiMessages.labels.zipCode}
                value={formData.address.zipCode}
                onChange={handleChange}
                onBlur={handleCepBlur}
                required
                maxLength={9}
                error={fieldErrors['addr.zipCode']}
                buttonIcon={<Search className="h-4 w-4" />}
                buttonAriaLabel={uiMessages.addressMessages.searchByZipCode}
                buttonLoading={cepLoading}
                onButtonClick={fetchAddress}
              />
              {cepLoading && (
                <HelperText className="mt-1 text-xs text-brand-600">{uiMessages.addressMessages.fetchingAddress}</HelperText>
              )}
            </div>

            <div className="sm:col-span-6">
              <Input
                label={uiMessages.labels.street}
                name="addr.street"
                value={formData.address.street}
                onChange={handleChange}
                required
                readOnly={lockedFields.street}
                ref={streetInputRef}
                maxLength={200}
                error={fieldErrors['addr.street']}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label={uiMessages.labels.number}
                name="addr.number"
                value={formData.address.number}
                onChange={handleChange}
                required
                ref={numberInputRef}
                maxLength={20}
                error={fieldErrors['addr.number']}
              />
            </div>

            <div className="sm:col-span-4">
              <Input label={uiMessages.labels.complement} name="addr.complement" value={formData.address.complement || ''} onChange={handleChange} maxLength={100} />
            </div>

            <div className="sm:col-span-4">
              <Input
                label={uiMessages.labels.neighborhood}
                name="addr.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                required
                readOnly={lockedFields.neighborhood}
                maxLength={100}
                error={fieldErrors['addr.neighborhood']}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label={uiMessages.labels.city}
                name="addr.city"
                value={formData.address.city}
                onChange={handleChange}
                required
                readOnly={lockedFields.city}
                maxLength={100}
                error={fieldErrors['addr.city']}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label={uiMessages.labels.state}
                name="addr.state"
                value={formData.address.state}
                onChange={handleChange}
                required
                readOnly={lockedFields.state}
                maxLength={2}
                error={fieldErrors['addr.state']}
              />
            </div>
          </div>
        </Card>

        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <TextArea
            id="notes"
            rows={3}
            name="notes"
            label={uiMessages.labels.notesAdditional}
            value={formData.notes}
            onChange={handleChange}
            maxLength={1000}
          />
        </div>

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
