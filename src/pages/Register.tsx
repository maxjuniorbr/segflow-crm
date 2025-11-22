import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input } from '../components/UIComponents';
import { storageService } from '../services/storage';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await storageService.register({ email, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-slate-200">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Conta Criada!</h3>
          <p className="mt-2 text-sm text-slate-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-50 p-3 rounded-full">
              <ShieldCheck className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">Criar Conta</h2>
          <p className="text-center text-slate-600 mb-8">Cadastre-se no SegFlow</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
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
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};