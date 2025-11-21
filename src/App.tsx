import React, { useState } from 'react';
import { UserRole } from './types/types';
import { useStore } from './store/useStore';
import { useToast } from './hooks/useToast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/client/ClientPortal';
import { SupplierPortal } from './pages/supplier/SupplierPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

type ViewState = 'LANDING' | 'LOGIN' | 'APP';

function App() {
  const { currentUser, isAuthenticated, login, logout } = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [view, setView] = useState<ViewState>(isAuthenticated ? 'APP' : 'LANDING');

  const handleLogin = (email: string, password: string) => {
    const user = login(email, password);
    if (user) {
      setView('APP');
      if (user.role === UserRole.CLIENT) setActiveTab('dashboard');
      if (user.role === UserRole.SUPPLIER) setActiveTab('dashboard');
      if (user.role === UserRole.ADMIN) setActiveTab('overview');
      toast.success(`Welcome back, ${user.name}!`);
      return user.role;
    } else {
      toast.error('Invalid credentials');
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    setView('LANDING');
    toast.info('You have been logged out');
  };

  if (view === 'LANDING') {
    return (
      <ErrorBoundary>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <Landing onNavigateToLogin={() => setView('LOGIN')} />
      </ErrorBoundary>
    );
  }

  if (view === 'LOGIN') {
    return (
      <ErrorBoundary>
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        <Login onLogin={handleLogin} onBack={() => setView('LANDING')} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      <div className="flex min-h-screen w-full bg-[#f9fafb] font-sans text-gray-900">
        <Sidebar
          role={currentUser?.role || UserRole.GUEST}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50/50 min-w-0">
          {currentUser?.role === UserRole.CLIENT && <ClientPortal activeTab={activeTab} onNavigate={setActiveTab} />}
          {currentUser?.role === UserRole.SUPPLIER && <SupplierPortal activeTab={activeTab} onNavigate={setActiveTab} />}
          {currentUser?.role === UserRole.ADMIN && <AdminPortal activeTab={activeTab} />}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
