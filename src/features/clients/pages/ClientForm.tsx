import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { storageService } from '../../../services/storage';
import { externalService } from '../../../services/external';
import { Client, ClientFormData } from '../../../types';
import { Card, Input, Button, Select, Alert, DateInput } from '../../../shared/components/UIComponents';
import { ChevronLeft, Save, Loader2, Search } from 'lucide-react';
import { maskCPF, maskCNPJ, maskPhone, maskCEP } from '../../../utils/formatters';
import { isValidCPF, isValidCNPJ } from '../../../utils/validators';
import { useToast } from '../../../contexts/ToastContext';

export const ClientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState('');
  const [error, setError] = useState('');

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
        setError("Erro ao carregar dados do cliente.");
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
  };

  const handleCpfBlur = () => {
    if (formData.cpf && formData.cpf.trim() !== '') {
      if (!isValidCPF(formData.cpf)) {
        setError('CPF inválido. Verifique os números digitados.');
        showToast('CPF inválido', 'error');
      } else {
        setError('');
      }
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj && formData.cnpj.trim() !== '') {
      if (!isValidCNPJ(formData.cnpj)) {
        setError('CNPJ inválido. Verifique os números digitados.');
        showToast('CNPJ inválido', 'error');
      } else {
        setError('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const clientToSave: Client = {
        id: id || '',
        createdAt: id ? clientMeta.createdAt || new Date().toISOString() : new Date().toISOString(),
        ...formData
      };
      await storageService.saveClient(clientToSave, !id);

      showToast(id ? 'Cliente atualizado com sucesso!' : 'Cliente criado com sucesso!', 'success');

      navigate(id ? `/clients/${id}` : '/clients');
    } catch (error: any) {
      console.error("Error saving client:", error);
      setError(error.message || 'Erro desconhecido ao salvar cliente.');
      showToast("Erro ao salvar cliente.", "error");
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

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-24 sm:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Preencha as informações abaixo para registrar um novo segurado.</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error">
          {error}
          {error.includes('email') && (
            <p className="mt-2 text-sm">Verifique se o email já não está cadastrado.</p>
          )}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

        <Card title="Tipo de Pessoa">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Select
                label="Tipo de Pessoa *"
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

        <Card title="Documentação e Identificação">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input label="Nome Completo *" name="name" value={formData.name} onChange={handleChange} required maxLength={200} />
            </div>

            {formData.personType === 'Física' ? (
              <>
                <div className="sm:col-span-3">
                  <Input label="CPF *" name="cpf" value={formData.cpf || ''} onChange={handleChange} onBlur={handleCpfBlur} required maxLength={14} />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    label="Estado Civil *"
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
                  <Input label="Órgão Expedidor" name="rgIssuer" value={formData.rgIssuer || ''} onChange={handleChange} placeholder="ex: SSP/SP" maxLength={20} />
                </div>
                <div className="sm:col-span-3">
                  <DateInput label="Data Expedição" name="rgDispatchDate" value={formData.rgDispatchDate || ''} onChange={handleChange} />
                </div>
                <div className="sm:col-span-3"></div>

                <div className="sm:col-span-3">
                  <DateInput label="Data de Nascimento *" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} required />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Idade" name="age" id="age" value={calculatedAge} readOnly className="bg-gray-50" />
                </div>
              </>
            ) : (
              <div className="sm:col-span-6">
                <Input label="CNPJ *" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} onBlur={handleCnpjBlur} required maxLength={18} />
              </div>
            )}
          </div>
        </Card>

        <Card title="Contatos">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input type="email" label="Email *" name="email" value={formData.email} onChange={handleChange} required maxLength={254} />
            </div>
            <div className="sm:col-span-6">
              <Input type="tel" label="Telefone/Celular *" name="phone" value={formData.phone} onChange={handleChange} required maxLength={15} />
            </div>
          </div>
        </Card>

        <Card title="Endereço">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-12">
            <div className="sm:col-span-3">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1.5">CEP *</label>
              <div className="flex rounded-md shadow-sm">
                <input
                  id="zipCode"
                  name="addr.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  required
                  maxLength={9}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                />
                <button
                  type="button"
                  onClick={fetchAddress}
                  className="-ml-px inline-flex items-center space-x-2 px-3 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </button>
              </div>
              {cepLoading && <p className="text-xs text-blue-600 mt-1">Buscando endereço...</p>}
            </div>

            <div className="sm:col-span-6">
              <Input
                label="Logradouro *"
                name="addr.street"
                value={formData.address.street}
                onChange={handleChange}
                required
                readOnly={lockedFields.street}
                ref={streetInputRef}
                maxLength={200}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label="Número *"
                name="addr.number"
                value={formData.address.number}
                onChange={handleChange}
                required
                ref={numberInputRef}
                maxLength={20}
              />
            </div>

            <div className="sm:col-span-4">
              <Input label="Complemento" name="addr.complement" value={formData.address.complement || ''} onChange={handleChange} maxLength={100} />
            </div>

            <div className="sm:col-span-4">
              <Input
                label="Bairro *"
                name="addr.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleChange}
                required
                readOnly={lockedFields.neighborhood}
                maxLength={100}
              />
            </div>

            <div className="sm:col-span-3">
              <Input
                label="Cidade *"
                name="addr.city"
                value={formData.address.city}
                onChange={handleChange}
                required
                readOnly={lockedFields.city}
                maxLength={100}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label="UF *"
                name="addr.state"
                value={formData.address.state}
                onChange={handleChange}
                required
                readOnly={lockedFields.state}
                maxLength={2}
              />
            </div>
          </div>
        </Card>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">Observações Adicionais</label>
          <textarea
            id="notes"
            rows={3}
            name="notes"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors bg-white text-gray-900"
            value={formData.notes}
            onChange={handleChange}
            maxLength={1000}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-lg sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:p-0 flex justify-end space-x-4 z-50">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Dados
          </Button>
        </div>
      </form>
    </div>
  );
};
