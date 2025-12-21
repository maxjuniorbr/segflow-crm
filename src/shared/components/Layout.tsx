import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Settings,
  ChevronDown,
  Building2
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isSettingsActive = location.pathname.startsWith('/settings');

  useEffect(() => {
    setIsSettingsOpen(isSettingsActive);
  }, [isSettingsActive]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Clientes', path: '/clients', icon: Users },
    { label: 'Propostas e apólices', path: '/documents', icon: FileText }
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 border-b border-neutral-200">
        <div className="flex items-center space-x-2 font-bold text-neutral-800 text-xl">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span>SegFlow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-neutral-600 p-2 -mr-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:min-h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-neutral-800 bg-neutral-900">
            <ShieldCheck className="w-8 h-8 text-brand-500 mr-3" />
            <span className="text-xl font-bold text-white">SegFlow</span>
          </div>

          <div className="flex-1 py-6 flex flex-col px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isActive(item.path)
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}
                `}
              >
                <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive(item.path) ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                {item.label}
              </Link>
            ))}

            <div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                aria-expanded={isSettingsOpen}
                aria-controls="settings-submenu"
                className={`
                  w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                  ${isSettingsActive
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}
                `}
              >
                <div className="flex items-center">
                  <Settings className={`mr-3 flex-shrink-0 h-5 w-5 ${isSettingsActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                  Configurações
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180 text-neutral-200' : 'text-neutral-400'}`} />
              </button>

              {isSettingsOpen && (
                <div id="settings-submenu" className="ml-3 mt-2 space-y-1 border-l border-neutral-700/70 pl-3">
                  <Link
                    to="/settings/users"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                      ${isActive('/settings/users')
                        ? 'bg-brand-600 text-white'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}
                    `}
                  >
                    <Users className={`mr-3 flex-shrink-0 h-4 w-4 ${isActive('/settings/users') ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                    Usuários
                  </Link>
                  <Link
                    to="/settings/brokers"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors
                      ${isActive('/settings/brokers')
                        ? 'bg-brand-600 text-white'
                        : 'text-neutral-300 hover:text-white hover:bg-neutral-800'}
                    `}
                  >
                    <Building2 className={`mr-3 flex-shrink-0 h-4 w-4 ${isActive('/settings/brokers') ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-300'}`} />
                    Corretoras
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-neutral-800 bg-neutral-900">
            <div className="flex items-center mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-200 font-bold border border-neutral-600">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.username || 'Usuário'}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-danger-500 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900 bg-opacity-75 z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
