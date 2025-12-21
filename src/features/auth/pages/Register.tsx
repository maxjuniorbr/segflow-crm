import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Input, Alert } from '../../../shared/components/UIComponents';
import { storageService } from '../../../services/storage';
import { maskCPF } from '../../../utils/formatters';
import { isValidCPF, isValidEmail } from '../../../utils/validators';
import { validationMessages } from '../../../utils/validationMessages';
import { authMessages } from '../../../utils/authMessages';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCPF(e.target.value);
    setCpf(masked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(validationMessages.required('Nome'));
      return;
    }

    if (!cpf.trim()) {
      setError(validationMessages.required('CPF'));
      return;
    }

    if (!isValidCPF(cpf)) {
      setError(validationMessages.invalid('CPF'));
      return;
    }

    if (!email.trim()) {
      setError(validationMessages.required('Email'));
      return;
    }

    if (!isValidEmail(email)) {
      setError(validationMessages.invalid('Email'));
      return;
    }

    if (password !== confirmPassword) {
      setError(validationMessages.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(validationMessages.passwordMinLength(6));
      return;
    }

    setLoading(true);

    try {
      await storageService.register({ name, cpf, email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || authMessages.registerError);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-neutral-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-50 mb-4">
            <ShieldCheck className="h-6 w-6 text-success-600" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900">Conta Criada!</h3>
          <p className="mt-2 text-sm text-neutral-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-50 p-3 rounded-full">
              <ShieldCheck className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h2 className="text-center text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Cadastrar</h2>
          <p className="text-center text-neutral-600 mb-8">{authMessages.registerSubtitle}</p>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Input
              id="name"
              name="name"
              label="Nome Completo"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
            />
            <Input
              id="cpf"
              name="cpf"
              label="CPF"
              type="text"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={handleCpfChange}
              required
              maxLength={14}
            />
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
            />
            <Input
              id="password"
              name="password"
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              id="confirm-password"
              name="confirm-password"
              label="Confirmar Senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Cadastrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
