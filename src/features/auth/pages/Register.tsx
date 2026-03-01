import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Input, Alert, SectionTitle } from '../../../shared/components/UIComponents';
import { storageService } from '../../../services/storage';
import { maskCPF, maskCNPJ, maskPhone } from '../../../utils/formatters';
import { isValidCPF, isValidCNPJ, isValidEmail } from '../../../utils/validators';
import { validationMessages } from '../../../utils/validationMessages';
import { authMessages } from '../../../utils/authMessages';
import { uiBaseMessages } from '../../../utils/uiBaseMessages';
import { FormErrors } from '../../../types';

interface FormData {
  corporateName: string;
  tradeName: string;
  cnpj: string;
  susepCode: string;
  phone: string;
  mobile: string;
  email: string;
  contactName: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  corporateName: '',
  tradeName: '',
  cnpj: '',
  susepCode: '',
  phone: '',
  mobile: '',
  email: '',
  contactName: '',
  cpf: '',
  password: '',
  confirmPassword: ''
};

export const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<FormErrors<FormData>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: masked }));
    if (errors.cnpj) {
      setErrors(prev => ({ ...prev, cnpj: '' }));
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setFormData(prev => ({ ...prev, cpf: masked }));
    if (errors.cpf) {
      setErrors(prev => ({ ...prev, cpf: '' }));
    }
  };

  const handlePhoneChange = (field: 'phone' | 'mobile') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskPhone(e.target.value);
    setFormData(prev => ({ ...prev, [field]: masked }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCnpjBlur = () => {
    if (formData.cnpj && !isValidCNPJ(formData.cnpj)) {
      setErrors(prev => ({ ...prev, cnpj: validationMessages.invalid(uiBaseMessages.labels.cnpj) }));
    }
  };

  const handleCpfBlur = () => {
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      setErrors(prev => ({ ...prev, cpf: validationMessages.invalid(uiBaseMessages.labels.cpf) }));
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: validationMessages.invalid(uiBaseMessages.labels.email) }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors<FormData> = {};

    if (!formData.corporateName.trim()) {
      newErrors.corporateName = validationMessages.required(uiBaseMessages.labels.corporateName);
    }

    if (!formData.tradeName.trim()) {
      newErrors.tradeName = validationMessages.required(uiBaseMessages.labels.tradeName);
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = validationMessages.required(uiBaseMessages.labels.cnpj);
    } else if (!isValidCNPJ(formData.cnpj)) {
      newErrors.cnpj = validationMessages.invalid(uiBaseMessages.labels.cnpj);
    }

    if (!formData.email.trim()) {
      newErrors.email = validationMessages.required(uiBaseMessages.labels.email);
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = validationMessages.invalid(uiBaseMessages.labels.email);
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = validationMessages.required(uiBaseMessages.labels.fullName);
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = validationMessages.required(uiBaseMessages.labels.cpf);
    } else if (!isValidCPF(formData.cpf)) {
      newErrors.cpf = validationMessages.invalid(uiBaseMessages.labels.cpf);
    }

    if (!formData.password.trim()) {
      newErrors.password = validationMessages.required(uiBaseMessages.labels.password);
    } else if (formData.password.length < 10 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = validationMessages.passwordMinLengthStrong(10);
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = validationMessages.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = validationMessages.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await storageService.registerBroker({
        corporateName: formData.corporateName,
        tradeName: formData.tradeName,
        cnpj: formData.cnpj,
        susepCode: formData.susepCode || null,
        phone: formData.phone || null,
        mobile: formData.mobile || null,
        email: formData.email,
        contactName: formData.contactName,
        cpf: formData.cpf,
        password: formData.password
      });
      setSuccess(true);
      redirectTimerRef.current = setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : authMessages.registerError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center border border-border">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-50 dark:bg-success-900/30 mb-4">
            <ShieldCheck className="h-6 w-6 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="text-lg font-medium text-foreground">{authMessages.registerSuccess}</h3>
          <p className="mt-2 text-sm text-muted">{authMessages.registerSuccessMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-50 dark:bg-brand-900/30 p-3 rounded-full">
              <ShieldCheck className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h2 className="text-center font-bold text-foreground mb-2" style={{ fontSize: 'var(--text-heading-lg)' }}>{authMessages.registerTitle}</h2>
          <p className="text-center text-muted mb-8">{authMessages.registerSubtitle}</p>

          {formError && (
            <div className="mb-4">
              <Alert variant="error">{formError}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionTitle>{authMessages.brokerSection}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="corporateName"
                name="corporateName"
                label={uiBaseMessages.labels.corporateName}
                type="text"
                placeholder={uiBaseMessages.placeholders.corporateName}
                value={formData.corporateName}
                onChange={handleChange}
                error={errors.corporateName}
                required
                maxLength={200}
              />
              <Input
                id="tradeName"
                name="tradeName"
                label={uiBaseMessages.labels.tradeName}
                type="text"
                placeholder={uiBaseMessages.placeholders.tradeName}
                value={formData.tradeName}
                onChange={handleChange}
                error={errors.tradeName}
                required
                maxLength={200}
              />
              <Input
                id="cnpj"
                name="cnpj"
                label={uiBaseMessages.labels.cnpj}
                type="text"
                placeholder={uiBaseMessages.placeholders.cnpj}
                value={formData.cnpj}
                onChange={handleCnpjChange}
                onBlur={handleCnpjBlur}
                error={errors.cnpj}
                required
                maxLength={18}
              />
              <Input
                id="susepCode"
                name="susepCode"
                label={uiBaseMessages.labels.susepCode}
                type="text"
                placeholder={uiBaseMessages.placeholders.susepCode}
                value={formData.susepCode}
                onChange={handleChange}
                error={errors.susepCode}
                maxLength={20}
              />
              <Input
                id="phone"
                name="phone"
                label={uiBaseMessages.labels.phone}
                type="text"
                placeholder={uiBaseMessages.placeholders.phone}
                value={formData.phone}
                onChange={handlePhoneChange('phone')}
                error={errors.phone}
                maxLength={15}
              />
              <Input
                id="mobile"
                name="mobile"
                label={uiBaseMessages.labels.mobile}
                type="text"
                placeholder={uiBaseMessages.placeholders.mobile}
                value={formData.mobile}
                onChange={handlePhoneChange('mobile')}
                error={errors.mobile}
                maxLength={15}
              />
              <div className="sm:col-span-2">
                <Input
                  id="email"
                  name="email"
                  label={uiBaseMessages.labels.email}
                  type="email"
                  placeholder={uiBaseMessages.placeholders.brokerEmail}
                  helperText={uiBaseMessages.labels.emailHelper}
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  error={errors.email}
                  required
                  maxLength={254}
                />
              </div>
            </div>

            <SectionTitle>{authMessages.userSection}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="contactName"
                name="contactName"
                label={uiBaseMessages.labels.fullName}
                type="text"
                placeholder={uiBaseMessages.labels.fullName}
                value={formData.contactName}
                onChange={handleChange}
                error={errors.contactName}
                required
                maxLength={200}
              />
              <Input
                id="cpf"
                name="cpf"
                label={uiBaseMessages.labels.cpf}
                type="text"
                placeholder={uiBaseMessages.placeholders.cpf}
                value={formData.cpf}
                onChange={handleCpfChange}
                onBlur={handleCpfBlur}
                error={errors.cpf}
                required
                maxLength={14}
              />
              <Input
                id="password"
                name="password"
                label={uiBaseMessages.labels.password}
                type="password"
                placeholder={uiBaseMessages.placeholders.passwordMin}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                label={uiBaseMessages.labels.confirmPassword}
                type="password"
                placeholder={uiBaseMessages.placeholders.confirmPassword}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              {authMessages.registerAction}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {authMessages.loginPrompt}{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
                {authMessages.loginAction}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
