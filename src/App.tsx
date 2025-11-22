import React, { useState, useEffect } from 'react';
import { UserRole } from './types/types';
import { useStore, LoginResult } from './store/useStore';
import { useToast } from './hooks/useToast';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';
import { SessionTimeoutWarning } from './components/SessionTimeoutWarning';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/client/ClientPortal';
import { SupplierPortal } from './pages/supplier/SupplierPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

type ViewState = 'LANDING' | 'LOGIN' | 'APP';

function App() {
  const { currentUser, isAuthenticated, login, logout, checkSession } = useStore();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [view, setView] = useState<ViewState>(isAuthenticated ? 'APP' : 'LANDING');
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // Session timeout handling
  const handleSessionTimeout = () => {
    logout();
    setView('LOGIN');
    setShowSessionWarning(false);
    toast.warning('Your session has expired. Please log in again.');
  };

  const handleSessionWarning = () => {
    setShowSessionWarning(true);
  };

  const { timeRemaining, extendSession } = useSessionTimeout({
    onTimeout: handleSessionTimeout,
    onWarning: handleSessionWarning,
  });

  const handleExtendSession = () => {
    extendSession();
    setShowSessionWarning(false);
    toast.success('Session extended');
  };

  // Check session validity on mount and view changes
  useEffect(() => {
    if (isAuthenticated && !checkSession()) {
      setView('LOGIN');
      toast.warning('Session expired. Please log in again.');
    }
  }, [view]);

  const handleLogin = (email: string, password: string): UserRole | null => {
    const result: LoginResult = login(email, password);

    if (result.success && result.user) {
      setView('APP');
      if (result.user.role === UserRole.CLIENT) setActiveTab('dashboard');
      if (result.user.role === UserRole.SUPPLIER) setActiveTab('dashboard');
      if (result.user.role === UserRole.ADMIN) setActiveTab('overview');
      toast.success(`Welcome back, ${result.user.name}!`);
      return result.user.role;
    } else {
      // Show appropriate error message
      if (result.lockoutRemainingMs) {
        const minutes = Math.ceil(result.lockoutRemainingMs / 60000);
        toast.error(`Account locked. Try again in ${minutes} minute(s).`);
      } else if (result.remainingAttempts !== undefined && result.remainingAttempts <= 2) {
        toast.error(`${result.error} ${result.remainingAttempts} attempt(s) remaining.`);
      } else {
        toast.error(result.error || 'Invalid credentials');
      }
      return null;
    }
  };

  const handleLogout = () => {
    logout();
    setView('LANDING');
    setShowSessionWarning(false);
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
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutWarning
        isVisible={showSessionWarning}
        timeRemaining={timeRemaining}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
      />
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
