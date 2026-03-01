import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './shared/components/Layout';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { LoadingState } from './shared/components/UIComponents';

const Login = React.lazy(() => import('./features/auth/pages/Login').then(m => ({ default: m.Login })));
const Register = React.lazy(() => import('./features/auth/pages/Register').then(m => ({ default: m.Register })));
const Dashboard = React.lazy(() => import('./features/dashboard/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ClientList = React.lazy(() => import('./features/clients/pages/ClientList').then(m => ({ default: m.ClientList })));
const ClientForm = React.lazy(() => import('./features/clients/pages/ClientForm').then(m => ({ default: m.ClientForm })));
const ClientDetail = React.lazy(() => import('./features/clients/pages/ClientDetail').then(m => ({ default: m.ClientDetail })));
const DocumentList = React.lazy(() => import('./features/documents/pages/DocumentList').then(m => ({ default: m.DocumentList })));
const DocumentForm = React.lazy(() => import('./features/documents/pages/DocumentForm').then(m => ({ default: m.DocumentForm })));
const UserList = React.lazy(() => import('./features/users/pages/UserList').then(m => ({ default: m.UserList })));
const UserForm = React.lazy(() => import('./features/users/pages/UserForm').then(m => ({ default: m.UserForm })));
const BrokerList = React.lazy(() => import('./features/brokers/pages/BrokerList').then(m => ({ default: m.BrokerList })));
const BrokerForm = React.lazy(() => import('./features/brokers/pages/BrokerForm').then(m => ({ default: m.BrokerForm })));

const RouteErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  return (
    <ErrorBoundary resetKey={location.pathname}>
      {children}
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <ErrorBoundary>
          <RouteErrorBoundary>
          <Suspense fallback={<LoadingState />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Outlet />
                </Layout>
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<ClientList />} />
              <Route path="clients/new" element={<ClientForm />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="clients/edit/:id" element={<ClientForm />} />

              <Route path="documents" element={<DocumentList />} />
              <Route path="documents/new" element={<DocumentForm />} />
              <Route path="documents/edit/:id" element={<DocumentForm />} />

              <Route path="settings/users" element={<UserList />} />
              <Route path="settings/users/new" element={<UserForm />} />
              <Route path="settings/users/:id" element={<UserForm />} />
              <Route path="settings/brokers" element={<BrokerList />} />
              <Route path="settings/brokers/new" element={<BrokerForm />} />
              <Route path="settings/brokers/:id" element={<BrokerForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          </Suspense>
          </RouteErrorBoundary>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
