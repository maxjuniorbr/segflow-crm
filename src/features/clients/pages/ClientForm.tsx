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

  const emptyClient: ClientFormData = {
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

  const [formData, setFormData] = useState(emptyClient);
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
    return isNaN(age) ? '' : age.toString();
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      storageService.getClientById(id).then(client => {
        if (client) {
          const { id, createdAt, ...rest } = client;
          if (!rest.personType) rest.personType = 'Física';
          if (!rest.maritalStatus) rest.maritalStatus = 'Solteiro(a)';

          // Sanitize nulls to empty strings for controlled inputs
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
        console.error(err);
        setError(actionMessages.loadError('dados do cliente'));
        setLoading(false);
      });
    }
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
      if (!isValidCPF(formData.cpf)) {
        setFieldErrors(prev => ({ ...prev, cpf: validationMessages.cpfInvalidDetails }));
      } else {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.cpf;
          return next;
        });
      }
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj && formData.cnpj.trim() !== '') {
      if (!isValidCNPJ(formData.cnpj)) {
        setFieldErrors(prev => ({ ...prev, cnpj: validationMessages.cnpjInvalidDetails }));
      } else {
        setFieldErrors(prev => {
          const next = { ...prev };
          delete next.cnpj;
          return next;
        });
      }
    }
  };

  const fetchAddress = async () => {
    const cep = formData.address.zipCode.replace(/\D/g, '');
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

          setTimeout(() => {
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
      } catch (error) {
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

    if (!formData.name.trim()) errors.name = validationMessages.required('Nome completo');

    if (formData.personType === 'Física') {
      if (!formData.cpf.trim()) {
        errors.cpf = validationMessages.required('CPF');
      } else if (!isValidCPF(formData.cpf)) {
        errors.cpf = validationMessages.cpfInvalidDetails;
      }

      if (!formData.birthDate) errors.birthDate = validationMessages.required('Data de nascimento');
    }

    if (formData.personType === 'Jurídica') {
      if (!formData.cnpj.trim()) {
        errors.cnpj = validationMessages.required('CNPJ');
      } else if (!isValidCNPJ(formData.cnpj)) {
        errors.cnpj = validationMessages.cnpjInvalidDetails;
      }
    }

    if (!formData.email.trim()) {
      errors.email = validationMessages.required('Email');
    } else if (!isValidEmail(formData.email)) {
      errors.email = validationMessages.invalid('Email');
    }

    if (!formData.phone.trim()) errors.phone = validationMessages.required('Telefone/Celular');

    if (!formData.address.zipCode.trim()) errors['addr.zipCode'] = validationMessages.required('CEP');
    if (!formData.address.street.trim()) errors['addr.street'] = validationMessages.required('Logradouro');
    if (!formData.address.number.trim()) errors['addr.number'] = validationMessages.required('Número');
    if (!formData.address.neighborhood.trim()) errors['addr.neighborhood'] = validationMessages.required('Bairro');
    if (!formData.address.city.trim()) errors['addr.city'] = validationMessages.required('Cidade');
    if (!formData.address.state.trim()) errors['addr.state'] = validationMessages.required('UF');

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
    } catch (error: any) {
      console.error("Error saving client:", error);
      setError(error.message || actionMessages.saveError('cliente'));
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

  if (loading) return <LoadingState label="Carregando cliente..." />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-0">
      <PageHeader
        title={id ? 'Editar cliente' : 'Cadastrar cliente'}
        subtitle="Preencha as informações abaixo para registrar um novo segurado."
        leading={(
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-neutral-200 rounded-full text-neutral-500 transition-colors"
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

        <Card title="Tipo de pessoa">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Select
                label="Tipo de Pessoa"
                name="personType"
                value={formData.personType}
                onChange={handleChange}
                options={[
                  { value: 'Física', label: 'Pessoa Física' },
                  { value: 'Jurídica', label: 'Pessoa Jurídica' }
                ]}
                required
              />
            </div>
          </div>
        </Card>

        <Card title="Documentação e identificação">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input label="Nome Completo" name="name" value={formData.name} onChange={handleChange} required maxLength={200} error={fieldErrors.name} />
            </div>

            {formData.personType === 'Física' ? (
              <>
                <div className="sm:col-span-3">
                  <Input label="CPF" name="cpf" value={formData.cpf || ''} onChange={handleChange} onBlur={handleCpfBlur} required maxLength={14} error={fieldErrors.cpf} />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label="Estado Civil"
                    name="maritalStatus"
                    value={formData.maritalStatus || 'Solteiro(a)'}
                    onChange={handleChange}
                    options={maritalStatusOptions}
                    required
                  />
                </div>

                <div className="sm:col-span-3">
                  <Input label="RG" name="rg" value={formData.rg || ''} onChange={handleChange} maxLength={20} />
                </div>
                <div className="sm:col-span-3">
                  <Input label="Órgão Expedidor" name="rgIssuer" value={formData.rgIssuer || ''} onChange={handleChange} placeholder="Ex.: SSP/SP" maxLength={20} />
                </div>
                <div className="sm:col-span-3">
                  <DateInput label="Data Expedição" name="rgDispatchDate" value={formData.rgDispatchDate || ''} onChange={handleChange} />
                </div>
                <div className="sm:col-span-3"></div>

                <div className="sm:col-span-3">
                  <DateInput label="Data de Nascimento" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} required error={fieldErrors.birthDate} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Idade" name="age" id="age" value={calculatedAge} readOnly className="bg-neutral-50" />
                </div>
              </>
            ) : (
              <div className="sm:col-span-6">
                <Input label="CNPJ" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} onBlur={handleCnpjBlur} required maxLength={18} error={fieldErrors.cnpj} />
              </div>
            )}
          </div>
        </Card>

        <Card title="Contatos">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input type="email" label="Email" name="email" value={formData.email} onChange={handleChange} required maxLength={254} error={fieldErrors.email} />
            </div>
            <div className="sm:col-span-6">
              <Input type="tel" label="Telefone/Celular" name="phone" value={formData.phone} onChange={handleChange} required maxLength={15} error={fieldErrors.phone} />
            </div>
          </div>
        </Card>

        <Card title="Endereço">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <InputWithButton
                id="zipCode"
                name="addr.zipCode"
                label="CEP"
                value={formData.address.zipCode}
                onChange={handleChange}
                onBlur={handleCepBlur}
                required
                maxLength={9}
                error={fieldErrors['addr.zipCode']}
                buttonIcon={<Search className="h-4 w-4" />}
                buttonAriaLabel="Buscar endereço pelo CEP"
                buttonLoading={cepLoading}
                onButtonClick={fetchAddress}
              />
              {cepLoading && (
                <HelperText className="mt-1 text-xs text-brand-600">Buscando endereço...</HelperText>
              )}
            </div>

            <div className="sm:col-span-6">
              <Input
                label="Logradouro"
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
                label="Número"
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
              <Input label="Complemento" name="addr.complement" value={formData.address.complement || ''} onChange={handleChange} maxLength={100} />
            </div>

            <div className="sm:col-span-4">
              <Input
                label="Bairro"
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
                label="Cidade"
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
                label="UF"
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

        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <TextArea
            id="notes"
            rows={3}
            name="notes"
            label="Observações Adicionais"
            value={formData.notes}
            onChange={handleChange}
            maxLength={1000}
          />
        </div>

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
