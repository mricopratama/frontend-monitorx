/**
 * API Types
 * TypeScript interfaces matching backend response structures
 */

// ============================================================================
// Base Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// ============================================================================
// Website Types
// ============================================================================

export enum WebsiteStatus {
  UP = 'up',
  DOWN = 'down',
  UNKNOWN = 'unknown',
  CHECKING = 'checking',
}

export interface Website {
  id: string;
  user_id: string;
  name: string;
  url: string;
  monitoring_interval: number;
  timeout_threshold: number;
  status: WebsiteStatus;
  last_checked_at?: string;
  last_response_time?: number;
  last_status_code?: number;
  uptime_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWebsiteRequest {
  name: string;
  url: string;
  monitoring_interval: number;
  timeout_threshold: number;
}

export interface UpdateWebsiteRequest {
  name?: string;
  url?: string;
  monitoring_interval?: number;
  timeout_threshold?: number;
}

// ============================================================================
// Monitoring Result Types
// ============================================================================

export interface MonitoringResult {
  id: string;
  website_id: string;
  status_code: number;
  response_time: number;
  is_up: boolean;
  error_message?: string;
  checked_at: string;
  created_at: string;
}

export interface MonitoringLog {
  id: string;
  website_id: string;
  status_code: number;
  response_time: number;
  is_up: boolean;
  error_message?: string;
  checked_at: string;
}

// ============================================================================
// Alert Types
// ============================================================================

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AlertType {
  WEBSITE_DOWN = 'website_down',
  SLOW_RESPONSE = 'slow_response',
  CONSECUTIVE_FAILURES = 'consecutive_failures',
  SSL_EXPIRY = 'ssl_expiry',
}

export interface Alert {
  id: string;
  website_id: string;
  user_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_read: boolean;
  is_resolved: boolean;
  triggered_at: string;
  read_at?: string;
  resolved_at?: string;
  created_at: string;
  website_name?: string;
  website_url?: string;
}

export interface UpdateAlertRequest {
  is_read?: boolean;
  is_resolved?: boolean;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface DashboardSummary {
  total_websites: number;
  websites_up: number;
  websites_down: number;
  average_response_time: number;
  total_alerts: number;
  unread_alerts: number;
}

export interface UptimeData {
  website_id: string;
  website_name: string;
  uptime_percentage: number;
  total_checks: number;
  successful_checks: number;
  failed_checks: number;
  average_response_time: number;
}

export interface PerformanceData {
  timestamp: string;
  average_response_time: number;
  min_response_time: number;
  max_response_time: number;
  total_requests: number;
}

// ============================================================================
// WebSocket Message Types
// ============================================================================

export enum WebSocketMessageType {
  MONITORING_UPDATE = 'monitoring_update',
  ALERT_TRIGGERED = 'alert_triggered',
  WEBSITE_STATUS = 'website_status',
  PING = 'ping',
  PONG = 'pong',
}

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  timestamp: string;
  data: T;
}

export interface MonitoringUpdateData {
  website_id: string;
  status: WebsiteStatus;
  response_time: number;
  status_code: number;
  is_up: boolean;
  checked_at: string;
}

export interface AlertTriggeredData {
  alert: Alert;
  website: Website;
}

// ============================================================================
// Query Parameters
// ============================================================================

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface MonitoringLogParams extends PaginationParams {
  website_id: string;
  start_date?: string;
  end_date?: string;
}

export interface AlertQueryParams extends PaginationParams {
  website_id?: string;
  severity?: AlertSeverity;
  is_read?: boolean;
  is_resolved?: boolean;
}
