import React, { useState } from 'react';
import { UserRole } from '../types/types';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<UserRole | null>;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'client' | 'supplier' | 'admin') => {
    const credentials = {
      client: { email: 'client@mwrd.com', password: 'client123' },
      supplier: { email: 'supplier@mwrd.com', password: 'supplier123' },
      admin: { email: 'admin@mwrd.com', password: 'admin123' }
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl flex overflow-hidden max-w-5xl w-full min-h-[650px] animate-in zoom-in-95 duration-300">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-12 lg:p-16 flex flex-col justify-center relative">
          <button 
            onClick={onBack}
            className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>

          <div className="flex items-center gap-3 mb-12">
            <div className="size-8 bg-[#0A2540] rounded-lg flex items-center justify-center text-white">
              <svg className="size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
              </svg>
            </div>
            <span className="text-[#0A2540] text-2xl font-bold tracking-tight">mwrd</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 mb-8">Sign in to access your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <input 
                type="email" 
                placeholder="Work Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1 relative">
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-4 pr-36 py-3.5 rounded-lg border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none transition-all"
              />
              <button type="button" className="absolute right-4 top-3.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Don't have your account? <button className="text-blue-600 font-bold hover:underline">Sign Up</button>
            </p>
          </div>

          {/* Demo Hints */}
          <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Demo Credentials</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <button onClick={() => fillDemoCredentials('client')} className="hover:text-[#0A2540] underline">Client</button>
              <span>•</span>
              <button onClick={() => fillDemoCredentials('supplier')} className="hover:text-[#0A2540] underline">Supplier</button>
              <span>•</span>
              <button onClick={() => fillDemoCredentials('admin')} className="hover:text-[#0A2540] underline">Admin</button>
            </div>
          </div>
        </div>

        {/* Right Side - Hero */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-100 to-slate-300 relative flex-col justify-center p-12 lg:p-16 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 opacity-40">
             <svg className="absolute top-0 right-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M350 50L400 80V140L350 170L300 140V80L350 50Z" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M50 300L100 330V390L50 420L0 390V330L50 300Z" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.5"/>
                <path d="M200 200L250 230V290L200 320L150 290V230L200 200Z" stroke="#94a3b8" strokeWidth="1" fill="none" opacity="0.3"/>
                <circle cx="350" cy="80" r="3" fill="#94a3b8" opacity="0.5" />
                <circle cx="50" cy="330" r="3" fill="#94a3b8" opacity="0.5" />
                <line x1="350" y1="170" x2="250" y2="230" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
             </svg>
          </div>

          <div className="relative z-10 max-w-md">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
              Unlock Your B2B Potential.
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              Streamline procurement, manage supplier relationships, and drive growth in a secure, unified marketplace. mwrd empowers your business with efficiency and control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};