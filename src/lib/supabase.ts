import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';
import { appConfig } from '../config/appConfig';

// Only create real client if Supabase is configured
// Otherwise, create a dummy client that won't attempt any connections
export const supabase = appConfig.supabase.isConfigured
  ? createClient<Database>(appConfig.supabase.url!, appConfig.supabase.anonKey!)
  : createClient<Database>('https://placeholder.supabase.co', 'placeholder-key');

// Auth helper functions
export const auth = {
  signUp: async (email: string, password: string, metadata?: { name?: string; companyName?: string; role?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default supabase;
