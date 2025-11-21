import React from 'react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onNavigate, onLogout }) => {
  const getLinks = () => {
    switch (role) {
      case UserRole.CLIENT:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'browse', label: 'Browse Items', icon: 'search' },
          { id: 'rfqs', label: 'RFQs', icon: 'request_quote' },
          { id: 'orders', label: 'Orders', icon: 'receipt_long' },
          { id: 'settings', label: 'Account Settings', icon: 'settings' },
        ];
      case UserRole.SUPPLIER:
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
          { id: 'products', label: 'Product Management', icon: 'inventory_2' },
          { id: 'requests', label: 'Received RFQs', icon: 'inbox' },
          { id: 'browse', label: 'Browse RFQs/RFPs', icon: 'search' },
          { id: 'quotes', label: 'Send Quote', icon: 'send' },
          { id: 'orders', label: 'Orders Management', icon: 'receipt_long' },
        ];
      case UserRole.ADMIN:
        return [
          { id: 'overview', label: 'Overview', icon: 'analytics' },
          { id: 'approvals', label: 'Approvals', icon: 'verified_user' },
          { id: 'margins', label: 'Quote Manager', icon: 'currency_exchange' },
          { id: 'logistics', label: 'Logistics', icon: 'local_shipping' },
          { id: 'users', label: 'Users', icon: 'group' },
        ];
      default:
        return [];
    }
  };

  const getRoleName = () => {
    switch (role) {
        case UserRole.CLIENT: return 'Client Portal';
        case UserRole.SUPPLIER: return 'Supplier Portal';
        case UserRole.ADMIN: return 'Admin Portal';
        default: return 'Portal';
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-4 sticky top-0 font-sans z-40">
      <div className="flex flex-col gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCGWwctk0QMZDJJMQQzQ_cz17di_9zLg16SRX6v-8qae9ylt12sFr5JZ6fsg77k25Vz5b1L7wJxXyD_0bJCAsdEQw2Z-zKZgoP71YTj0E97gpWCRbRMr0sAvnXhAHZ_kTvF_-ZOTy_eyIAik_hhTm9WOpDiGvasImGT8tg_iC0b2N3OuDGUpQqunwGxUeL3gm8GA_2ifaW32ERva-Yud_xxpVbKB-gjPughYitc5YBx2dNyvyTYGrTGiEAe69ppV8q9eZzuSrd6qv8D")' }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-slate-900 text-base font-medium leading-normal">mwrd</h1>
            <p className="text-slate-500 text-sm font-normal leading-normal">{getRoleName()}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 mt-4">
          {getLinks().map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
                activeTab === link.id
                  ? 'bg-[#137fec]/10 text-[#137fec]'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={activeTab === link.id ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {link.icon}
              </span>
              <p className="text-sm font-medium leading-normal">{link.label}</p>
            </button>
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="mt-auto flex flex-col gap-1">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <p className="text-sm font-medium leading-normal">Logout</p>
        </button>
      </div>
    </aside>
  );
};