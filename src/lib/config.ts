/**
 * Application configuration
 * Environment variables should be prefixed with VITE_ to be exposed to the client
 */

interface AppConfig {
  // API Configuration
  apiBaseUrl: string;
  apiTimeout: number;

  // Authentication
  sessionTimeoutMs: number;
  maxLoginAttempts: number;
  lockoutDurationMs: number;

  // Feature Flags
  enableMockData: boolean;
  enableDebugMode: boolean;

  // App Info
  appName: string;
  appVersion: string;

  // Pagination
  defaultPageSize: number;
  maxPageSize: number;
}

// Default configuration values
const defaultConfig: AppConfig = {
  apiBaseUrl: '/api',
  apiTimeout: 30000,
  sessionTimeoutMs: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
  enableMockData: true,
  enableDebugMode: false,
  appName: 'MWRD Marketplace',
  appVersion: '1.0.0',
  defaultPageSize: 20,
  maxPageSize: 100,
};

// Helper to get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || fallback;
  }
  return fallback;
};

const getEnvBool = (key: string, fallback: boolean): boolean => {
  const value = getEnvVar(key, String(fallback));
  return value === 'true' || value === '1';
};

const getEnvNumber = (key: string, fallback: number): number => {
  const value = getEnvVar(key, String(fallback));
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

// Build configuration from environment
export const config: AppConfig = {
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', defaultConfig.apiBaseUrl),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', defaultConfig.apiTimeout),
  sessionTimeoutMs: getEnvNumber('VITE_SESSION_TIMEOUT_MS', defaultConfig.sessionTimeoutMs),
  maxLoginAttempts: getEnvNumber('VITE_MAX_LOGIN_ATTEMPTS', defaultConfig.maxLoginAttempts),
  lockoutDurationMs: getEnvNumber('VITE_LOCKOUT_DURATION_MS', defaultConfig.lockoutDurationMs),
  enableMockData: getEnvBool('VITE_ENABLE_MOCK_DATA', defaultConfig.enableMockData),
  enableDebugMode: getEnvBool('VITE_DEBUG_MODE', defaultConfig.enableDebugMode),
  appName: getEnvVar('VITE_APP_NAME', defaultConfig.appName),
  appVersion: getEnvVar('VITE_APP_VERSION', defaultConfig.appVersion),
  defaultPageSize: getEnvNumber('VITE_DEFAULT_PAGE_SIZE', defaultConfig.defaultPageSize),
  maxPageSize: getEnvNumber('VITE_MAX_PAGE_SIZE', defaultConfig.maxPageSize),
};

// Validate configuration
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (config.sessionTimeoutMs < 60000) {
    errors.push('Session timeout must be at least 1 minute');
  }

  if (config.maxLoginAttempts < 1) {
    errors.push('Max login attempts must be at least 1');
  }

  if (config.defaultPageSize < 1 || config.defaultPageSize > config.maxPageSize) {
    errors.push('Invalid page size configuration');
  }

  return errors;
};

// Log configuration in debug mode
if (config.enableDebugMode) {
  console.log('App Configuration:', config);
  const errors = validateConfig();
  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors);
  }
}

export default config;
