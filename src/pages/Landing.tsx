import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/LanguageToggle';

interface LandingProps {
  onNavigateToLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onNavigateToLogin }) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans bg-[#F6F9FC] text-[#4A4A4A]">
      <header className="sticky top-0 z-50 bg-[#F6F9FC]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 py-4">
            <div className="flex items-center gap-4">
              <div className="size-6 text-[#0A2540]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-[#0A2540] text-xl font-bold leading-tight tracking-[-0.015em]">mwrd</h2>
            </div>
            <nav className="hidden md:flex flex-1 justify-center items-center gap-8">
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#">{t('landing.forClients')}</a>
              <a className="text-[#4A4A4A] text-sm font-medium leading-normal hover:text-[#0A2540]" href="#">{t('landing.forSuppliers')}</a>
            </nav>
            <div className="flex gap-2 items-center">
              <LanguageToggle />
              <button 
                onClick={onNavigateToLogin}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-200 text-[#4A4A4A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
              >
                <span className="truncate">{t('common.login')}</span>
              </button>
              <button 
                onClick={onNavigateToLogin}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0A2540] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0A2540]/90 transition-colors"
              >
                <span className="truncate">{t('landing.getStarted')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8 text-center lg:text-start rtl:lg:text-end">
                <div className="flex flex-col gap-4">
                  <h1 className="text-[#0A2540] text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl">
                    {t('landing.heroTitle')}
                  </h1>
                  <p className="text-[#6b7280] text-lg font-normal leading-normal md:text-xl">
                    {t('landing.heroSubtitle')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start rtl:lg:justify-end">
                  <button 
                    onClick={onNavigateToLogin}
                    className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0A2540] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#0A2540]/90 transition-colors"
                  >
                    <span className="truncate">{t('landing.forClients')}</span>
                  </button>
                  <button 
                    onClick={onNavigateToLogin}
                    className="flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 text-[#4A4A4A] text-base font-bold leading-normal tracking-[0.015em] hover:bg-gray-300 transition-colors"
                  >
                    <span className="truncate">{t('landing.forSuppliers')}</span>
                  </button>
                </div>
              </div>
              <div 
                className="w-full bg-center bg-no-repeat aspect-square md:aspect-video lg:aspect-square bg-cover rounded-xl" 
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-zjAFJBV1Bx_1I3HkSkalvXrI-beVvnJr7J8L_JG2iD_PAZ5sdu5XAodzu-6N56qYmWJohKy7Klh11QTew7zNlSBuYfSV8A5M6XVxZyE9LEHQaYDW5rMt2SGr1GmnTcM85qh6Mwk3K3g2ky7XQAMToRe4YbXtX0HtN-mpFK5maRo3VmpGNCLD2JNCzRvWGiUUfp8EJynGxWom-KOu-a5HU4IBeeuOUugn2TtuP8ghrHnkx_AmRlVVXdSR9f49z_2NRWPJLWTwE5XW")' }}
              ></div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-12">
              <div className="text-center">
                <h2 className="text-[#0A2540] text-3xl md:text-4xl font-bold">{t('landing.features.title')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">verified_user</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.verified')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.verifiedDesc')}</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">shopping_cart_checkout</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.competitive')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.competitiveDesc')}</p>
                  </div>
                </div>
                <div className="flex flex-1 gap-4 rounded-xl border border-gray-200 bg-transparent p-6 flex-col">
                  <span className="material-symbols-outlined text-[#00C49A] text-3xl">dashboard</span>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#0A2540] text-lg font-bold leading-tight">{t('landing.features.streamlined')}</h3>
                    <p className="text-[#6b7280] text-sm font-normal leading-normal">{t('landing.features.streamlinedDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-[#0A2540] text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-6 text-white">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path></svg>
                  </div>
                  <h2 className="text-white text-xl font-bold">mwrd</h2>
                </div>
                <p className="text-sm text-gray-300">{t('landing.subtitle')}</p>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-white">Platform</h4>
                <a className="text-sm text-gray-300 hover:text-white" href="#">{t('landing.forClients')}</a>
                <a className="text-sm text-gray-300 hover:text-white" href="#">{t('landing.forSuppliers')}</a>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-100/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
              <p>© 2024 mwrd. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
