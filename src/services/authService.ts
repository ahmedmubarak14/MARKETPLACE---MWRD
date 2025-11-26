// Supabase Authentication Service
// Handles user authentication, registration, and session management

import { supabase, auth } from '../lib/supabase';
import { User, UserRole } from '../types/types';
import type { AuthError, Session } from '@supabase/supabase-js';
import { appConfig } from '../config/appConfig';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  companyName: string;
  role: UserRole;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Sign up a new user
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await auth.signUp(
        data.email,
        data.password,
        {
          name: data.name,
          companyName: data.companyName,
          role: data.role
        }
      );

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user' };
      }

      // Create user profile in our users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          company_name: data.companyName,
          verified: false,
          status: data.role === 'SUPPLIER' ? 'PENDING' : 'ACTIVE',
          kyc_status: 'INCOMPLETE'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      const user = this.mapDbUserToUser(profile);

      return {
        success: true,
        user,
        session: authData.session || undefined
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    // If Supabase is not configured, don't attempt authentication
    if (!appConfig.supabase.isConfigured) {
      if (appConfig.debug.logAuthFlow) {
        console.warn('⚠️ authService.signIn() called in MOCK mode - this should not happen!');
        console.warn('   Login should be handled by mock data in useStore');
      }
      return { success: false, error: 'Supabase not configured. Use mock mode authentication.' };
    }

    if (appConfig.debug.logAuthFlow) {
      console.log('🔐 Attempting Supabase authentication...');
    }

    try {
      const { data: authData, error: authError } = await auth.signIn(email, password);

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { success: false, error: 'User profile not found' };
      }

      const user = this.mapDbUserToUser(profile);

      return {
        success: true,
        user,
        session: authData.session || undefined
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Sign out
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Get current session
  async getSession(): Promise<{ session: Session | null; user: User | null }> {
    // If Supabase is not configured, return null session
    if (!appConfig.supabase.isConfigured) {
      if (appConfig.debug.logAuthFlow) {
        console.log('📋 getSession() called in MOCK mode - returning null');
      }
      return { session: null, user: null };
    }

    try {
      const { data } = await auth.getSession();

      if (!data.session?.user) {
        return { session: null, user: null };
      }

      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (error || !profile) {
        return { session: data.session, user: null };
      }

      return {
        session: data.session,
        user: this.mapDbUserToUser(profile)
      };
    } catch (error) {
      console.error('Get session error:', error);
      return { session: null, user: null };
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: authData } = await auth.getUser();

      if (!authData.user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (error || !profile) {
        return null;
      }

      return this.mapDbUserToUser(profile);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    try {
      const dbUpdates: Record<string, any> = {};

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.companyName) dbUpdates.company_name = updates.companyName;
      if (updates.verified !== undefined) dbUpdates.verified = updates.verified;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.kycStatus) dbUpdates.kyc_status = updates.kycStatus;
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating;

      const { data, error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: this.mapDbUserToUser(data) };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: subscription } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        callback(null);
        return;
      }

      // Fetch user profile on auth state change
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        callback(this.mapDbUserToUser(profile));
      } else {
        callback(null);
      }
    });

    return () => subscription?.subscription.unsubscribe();
  }

  // Map database user to app User type
  private mapDbUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      companyName: dbUser.company_name,
      verified: dbUser.verified,
      publicId: dbUser.public_id,
      rating: dbUser.rating,
      status: dbUser.status,
      kycStatus: dbUser.kyc_status,
      dateJoined: dbUser.date_joined
    };
  }
}

export const authService = AuthService.getInstance();
export default authService;
