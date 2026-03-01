import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button, Input, Alert } from '../../../shared/components/UIComponents';
import { storageService } from '../../../services/storage';
import { authMessages } from '../../../utils/authMessages';
import { uiMessages } from '../../../utils/uiMessages';

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
    } catch (_err) {
      setError(authMessages.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg overflow-hidden border border-border">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-6">
            <div className="bg-brand-50 dark:bg-brand-900/30 p-3 rounded-full">
              <ShieldCheck className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h2 className="text-center font-bold text-foreground mb-2" style={{ fontSize: 'var(--text-heading-lg)' }}>{uiMessages.auth.loginTitle}</h2>
          <p className="text-center text-muted mb-8">{authMessages.loginSubtitle}</p>

          {error && (
            <div className="mb-4">
              <Alert variant="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Input
              id="email"
              name="email"
              label={uiMessages.labels.email}
              type="email"
              placeholder={uiMessages.placeholders.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
            />
            <Input
              id="password"
              name="password"
              label={uiMessages.labels.password}
              type="password"
              placeholder={uiMessages.placeholders.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              {authMessages.loginButton}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              {authMessages.registerPrompt}{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">
                {authMessages.registerLinkAction}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
