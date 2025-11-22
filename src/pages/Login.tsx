import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '../types/types';
import { LoginSchema, LoginFormData } from '../lib/validations';
import { useToastContext } from '../contexts/ToastContext';

interface LoginProps {
  onLogin: (email: string, password: string) => UserRole | null;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const toast = useToastContext();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError(null);

    // Simulate network delay
    setTimeout(() => {
      const result = onLogin(data.email, data.password);
      setIsLoading(false);
      if (!result) {
        setLoginError('Invalid email or password. Please try again.');
      }
    }, 800);
  };

  const setDemoEmail = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setLoginError(null);
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

          {/* Login Error Alert */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Work Email"
                {...register('email')}
                className={`w-full px-4 py-3.5 rounded-lg border text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none transition-all ${
                  errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1 relative">
              <input
                type="password"
                placeholder="Password"
                {...register('password')}
                className={`w-full pl-4 pr-36 py-3.5 rounded-lg border text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0A2540] focus:border-transparent outline-none transition-all ${
                  errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                }`}
              />
              <button type="button" onClick={() => toast.info('Password reset link would be sent to your email. Backend integration required.')} className="absolute right-4 top-3.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                Forgot Password?
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0A2540] hover:bg-[#0A2540]/90 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
              Don't have your account? <button onClick={() => toast.info('Registration requires backend integration. Please use demo credentials for now.')} className="text-blue-600 font-bold hover:underline">Sign Up</button>
            </p>
          </div>

          {/* Demo Hints */}
          <div className="mt-12 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Demo Credentials</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <button onClick={() => setDemoEmail('client@mwrd.com')} className="hover:text-[#0A2540] underline">Client</button>
              <span>•</span>
              <button onClick={() => setDemoEmail('supplier@mwrd.com')} className="hover:text-[#0A2540] underline">Supplier</button>
              <span>•</span>
              <button onClick={() => setDemoEmail('admin@mwrd.com')} className="hover:text-[#0A2540] underline">Admin</button>
            </div>
            <p className="text-xs text-slate-400 text-center mt-2">(Any password with 6+ characters)</p>
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
