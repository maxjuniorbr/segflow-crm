import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './shared/components/Layout';
import { Login } from './features/auth/pages/Login';
import { Register } from './features/auth/pages/Register';
import { Dashboard } from './features/dashboard/pages/Dashboard';
import { ClientList } from './features/clients/pages/ClientList';
import { ClientForm } from './features/clients/pages/ClientForm';
import { ClientDetail } from './features/clients/pages/ClientDetail';
import { DocumentList } from './features/documents/pages/DocumentList';
import { DocumentForm } from './features/documents/pages/DocumentForm';
import { UserList } from './features/users/pages/UserList';
import { UserForm } from './features/users/pages/UserForm';
import { BrokerList } from './features/brokers/pages/BrokerList';
import { BrokerForm } from './features/brokers/pages/BrokerForm';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
