import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { ClientList } from './pages/ClientList';
import { ClientForm } from './pages/ClientForm';
import { ClientDetail } from './pages/ClientDetail';
import { DocumentList } from './pages/DocumentList';
import { DocumentForm } from './pages/DocumentForm';
import { UserList } from './pages/UserList';
import { UserForm } from './pages/UserForm';
import { ProtectedRoute } from './components/ProtectedRoute';

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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
