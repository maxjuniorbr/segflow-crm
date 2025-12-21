import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Input, Alert } from '../../../shared/components/UIComponents';
import { storageService } from '../../../services/storage';
import { authMessages } from '../../../utils/authMessages';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await storageService.validateUser(email, password);
      if (user) {
        login(user);
        navigate('/');
      } else {
        setError(authMessages.invalidCredentials);
      }
    } catch (err) {
      setError(authMessages.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden border border-neutral-200">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-50 p-3 rounded-full">
              <ShieldCheck className="w-10 h-10 text-brand-600" />
            </div>
          </div>
          <h2 className="text-center text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Entrar</h2>
          <p className="text-center text-neutral-600 mb-8">{authMessages.loginSubtitle}</p>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
