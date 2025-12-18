import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserRole } from '../types/types';
import { LanguageToggle } from './LanguageToggle';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, onNavigate, onLogout }) => {
  const { t } = useTranslation();

  const getLinks = () => {
    switch (role) {
      case UserRole.CLIENT:
        return [
          { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
          { id: 'browse', label: t('sidebar.browse'), icon: 'search' },
          { id: 'rfqs', label: t('sidebar.rfqs'), icon: 'request_quote' },
          { id: 'orders', label: t('sidebar.orders'), icon: 'receipt_long' },
          { id: 'settings', label: t('sidebar.settings'), icon: 'settings' },
        ];
      case UserRole.SUPPLIER:
        return [
          { id: 'dashboard', label: t('sidebar.dashboard'), icon: 'dashboard' },
          { id: 'products', label: t('sidebar.products'), icon: 'inventory_2' },
          { id: 'requests', label: t('sidebar.requests'), icon: 'inbox' },
          { id: 'browse', label: t('sidebar.browseRfqs'), icon: 'search' },
          { id: 'quotes', label: t('sidebar.quotes'), icon: 'send' },
          { id: 'orders', label: t('sidebar.ordersManagement'), icon: 'receipt_long' },
        ];
      case UserRole.ADMIN:
        return [
          { id: 'overview', label: t('sidebar.overview'), icon: 'analytics' },
          { id: 'approvals', label: t('sidebar.approvals'), icon: 'verified_user' },
          { id: 'margins', label: t('sidebar.margins'), icon: 'currency_exchange' },
          { id: 'logistics', label: t('sidebar.logistics'), icon: 'local_shipping' },
          { id: 'users', label: t('sidebar.users'), icon: 'group' },
        ];
      default:
        return [];
    }
  };

  const getRoleName = () => {
    switch (role) {
        case UserRole.CLIENT: return t('sidebar.clientPortal');
        case UserRole.SUPPLIER: return t('sidebar.supplierPortal');
        case UserRole.ADMIN: return t('sidebar.adminPortal');
        default: return 'Portal';
    }
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-4 sticky top-0 font-sans z-40 rtl:border-r-0 rtl:border-l">
      <div className="flex flex-col gap-4">
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

        <nav className="flex flex-col gap-2 mt-4">
          {getLinks().map((link) => (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left rtl:text-right ${
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

      <div className="mt-auto flex flex-col gap-2">
        <LanguageToggle className="w-full justify-center" />
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 w-full text-left rtl:text-right transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <p className="text-sm font-medium leading-normal">{t('common.logout')}</p>
        </button>
      </div>
    </aside>
  );
};
