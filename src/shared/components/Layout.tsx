import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { uiMessages } from '../../utils/uiMessages';
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
  Building2,
  Sun,
  Moon
} from 'lucide-react';

const useTheme = () => {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
    } catch { /* noop */ }
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* noop */ }
  }, [dark]);
  return { dark, toggle: () => setDark(d => !d) };
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isSettingsActive = location.pathname.startsWith('/settings');
  const theme = useTheme();

  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsSettingsOpen(isSettingsActive);
  }, [isSettingsActive]);

  const handleCloseMobile = useCallback(() => setIsMobileMenuOpen(false), []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    requestAnimationFrame(() => {
      const first = sidebar.querySelector<HTMLElement>('a, button');
      first?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseMobile();
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && sidebar) {
        const focusable = sidebar.querySelectorAll<HTMLElement>(
          'a, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, handleCloseMobile]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: uiMessages.navigation.dashboard, path: '/', icon: LayoutDashboard },
    { label: uiMessages.navigation.clients, path: '/clients', icon: Users },
    { label: uiMessages.navigation.documents, path: '/documents', icon: FileText }
  ];

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <div className="md:hidden bg-card shadow-sm p-4 flex justify-between items-center sticky top-0 z-20 border-b border-border">
        <div className="flex items-center space-x-2 font-bold text-foreground text-xl">
          <ShieldCheck className="w-8 h-8 text-brand-600" />
          <span>{uiMessages.app.name}</span>
        </div>
        <button
          ref={menuButtonRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-muted p-3 -mr-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={isMobileMenuOpen ? uiMessages.common.closeMenu : uiMessages.common.openMenu}
          aria-expanded={isMobileMenuOpen}
          title={isMobileMenuOpen ? uiMessages.common.closeMenu : uiMessages.common.openMenu}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside
        ref={sidebarRef}
        aria-label="Menu principal"
        className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-neutral-900 dark:bg-neutral-950 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:min-h-screen
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-neutral-800 bg-neutral-900 dark:bg-neutral-950">
            <ShieldCheck className="w-8 h-8 text-brand-500 mr-3" />
            <span className="text-xl font-bold text-white">{uiMessages.app.name}</span>
          </div>

          <nav aria-label="Menu principal" className="flex-1 py-6 flex flex-col px-3 space-y-1">
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
                  {uiMessages.navigation.settings}
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
                    {uiMessages.navigation.users}
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
                    {uiMessages.navigation.brokers}
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-neutral-800 bg-neutral-900 dark:bg-neutral-950">
            <div className="flex items-center mb-4 px-2">
              <div className="h-8 w-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-200 font-bold border border-neutral-600">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user?.username || uiMessages.placeholders.userFallback}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={theme.toggle}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-neutral-400 rounded-md hover:bg-neutral-800 transition-colors mb-1"
              aria-label={theme.dark ? uiMessages.navigation.lightMode : uiMessages.navigation.darkMode}
            >
              {theme.dark ? <Sun className="mr-3 h-5 w-5" /> : <Moon className="mr-3 h-5 w-5" />}
              {theme.dark ? uiMessages.navigation.lightMode : uiMessages.navigation.darkMode}
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-danger-500 rounded-md hover:bg-neutral-800 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              {uiMessages.navigation.logout}
            </button>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/75 z-[15] md:hidden animate-in fade-in duration-200"
          onClick={handleCloseMobile}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
