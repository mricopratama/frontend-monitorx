/**
 * Application Configuration
 * Centralized configuration management for environment variables
 */

export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1/ws',
    timeout: 30000, // 30 seconds
  },
  app: {
    name: 'MonitorX',
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    debug: process.env.NEXT_PUBLIC_DEBUG === 'true' || process.env.NODE_ENV === 'development',
  },
  auth: {
    tokenKey: 'monitorx_token',
    refreshTokenKey: 'monitorx_refresh_token',
    userKey: 'monitorx_user',
  },
} as const;

export const isDevelopment = config.app.environment === 'development';
export const isProduction = config.app.environment === 'production';
