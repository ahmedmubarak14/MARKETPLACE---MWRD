/**
 * Centralized Application Configuration
 * Single source of truth for app mode and feature flags
 */

// Check if Supabase is properly configured
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const appConfig = {
  // Supabase configuration
  supabase: {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  },

  // App mode
  mode: Boolean(supabaseUrl && supabaseAnonKey) ? 'SUPABASE' : 'MOCK',

  // Feature flags
  features: {
    useDatabase: Boolean(supabaseUrl && supabaseAnonKey),
    enableMockData: !Boolean(supabaseUrl && supabaseAnonKey),
    validatePasswordInMockMode: true, // Always validate password even in mock mode
  },

  // Debug logging
  debug: {
    logAuthFlow: true,
    logStateChanges: true,
    logModeDetection: true,
  },
} as const;

// Log configuration on module load
if (appConfig.debug.logModeDetection) {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   MWRD Application Configuration   ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`🔧 Mode: ${appConfig.mode}`);
  console.log(`📊 Database: ${appConfig.features.useDatabase ? 'ENABLED (Supabase)' : 'DISABLED (Mock Data)'}`);
  console.log(`🔐 Mock Password Validation: ${appConfig.features.validatePasswordInMockMode ? 'ENABLED' : 'DISABLED'}`);
  console.log(`🐛 Debug Logging: ${appConfig.debug.logAuthFlow ? 'ENABLED' : 'DISABLED'}`);

  if (!appConfig.supabase.isConfigured) {
    console.log('');
    console.log('💡 Tip: To enable Supabase database:');
    console.log('   1. Copy .env.example to .env.local');
    console.log('   2. Uncomment and set VITE_SUPABASE_URL');
    console.log('   3. Uncomment and set VITE_SUPABASE_ANON_KEY');
    console.log('   4. Restart the dev server');
  }
  console.log('════════════════════════════════════════');
}

export default appConfig;
