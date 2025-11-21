import React, { useState } from 'react';
import { UserRole } from './types';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { ClientPortal } from './pages/client/ClientPortal';
import { SupplierPortal } from './pages/supplier/SupplierPortal';
import { AdminPortal } from './pages/admin/AdminPortal';

type ViewState = 'LANDING' | 'LOGIN' | 'APP';

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.GUEST);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [view, setView] = useState<ViewState>('LANDING');

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setView('APP');
    // Set default tab based on role
    if (role === UserRole.CLIENT) setActiveTab('dashboard');
    if (role === UserRole.SUPPLIER) setActiveTab('dashboard');
    if (role === UserRole.ADMIN) setActiveTab('overview');
  };

  const handleLogout = () => {
    setCurrentRole(UserRole.GUEST);
    setView('LANDING');
  };

  if (view === 'LANDING') {
    return <Landing onNavigateToLogin={() => setView('LOGIN')} />;
  }

  if (view === 'LOGIN') {
    return <Login onLogin={handleLogin} onBack={() => setView('LANDING')} />;
  }

  return (
    <div className="flex min-h-screen w-full bg-[#f9fafb] font-sans text-gray-900">
      <Sidebar 
        role={currentRole} 
        activeTab={activeTab} 
        onNavigate={setActiveTab} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 overflow-y-auto bg-gray-50/50 min-w-0">
          {currentRole === UserRole.CLIENT && <ClientPortal activeTab={activeTab} onNavigate={setActiveTab} />}
          {currentRole === UserRole.SUPPLIER && <SupplierPortal activeTab={activeTab} onNavigate={setActiveTab} />}
          {currentRole === UserRole.ADMIN && <AdminPortal activeTab={activeTab} />}
      </main>
    </div>
  );
}

export default App;