import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '@mwrd/shared/store';
import { AdminPortal } from './pages/AdminPortal';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';

function App() {
  const { t } = useTranslation();
  const { currentUser, isAuthenticated, initializeAuth } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    initializeAuth();
  }, []);

  // Show login if not authenticated or not admin
  if (!isAuthenticated || currentUser?.role !== 'ADMIN') {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role="ADMIN"
        activeTab={activeTab}
        onNavigate={setActiveTab}
      />
      <main className="flex-1 ml-64">
        <AdminPortal activeTab={activeTab} />
      </main>
    </div>
  );
}

export default App;
