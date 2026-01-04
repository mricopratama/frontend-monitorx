/**
 * WebSocket Hook
 * Manages WebSocket connection for real-time updates
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { config } from '@/lib/config';
import { WebSocketMessage, WebSocketMessageType } from '@/lib/types/api';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onMonitoringUpdate?: (data: any) => void;
  onAlertTriggered?: (data: any) => void;
  onWebsiteStatus?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onMonitoringUpdate,
    onAlertTriggered,
    onWebsiteStatus,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Get authentication token
   */
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(config.auth.tokenKey);
  }, []);

  /**
   * Send message through WebSocket
   */
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else if (config.app.debug) {
      // Only warn in debug mode
      console.warn('WebSocket is not connected - message not sent');
    }
  }, []);

  /**
   * Send ping message
   */
  const ping = useCallback(() => {
    sendMessage({ type: WebSocketMessageType.PING });
  }, [sendMessage]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (wsRef.current?.readyState === WebSocket.OPEN || isConnecting) {
      return;
    }

    const token = getToken();
    if (!token) {
      // Silently skip WebSocket connection if no token
      if (config.app.debug) {
        console.warn('No auth token available for WebSocket connection');
      }
      return;
    }

    try {
      setIsConnecting(true);
      const wsUrl = `${config.api.wsUrl}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (config.app.debug) {
          console.log('WebSocket connected');
        }
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // Start ping interval
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ping();
          }
        }, 30000); // Ping every 30 seconds

        ws.addEventListener('close', () => {
          clearInterval(pingInterval);
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Call generic message handler
          onMessage?.(message);

          // Call specific handlers based on message type
          switch (message.type) {
            case WebSocketMessageType.MONITORING_UPDATE:
              onMonitoringUpdate?.(message.data);
              break;
            case WebSocketMessageType.ALERT_TRIGGERED:
              onAlertTriggered?.(message.data);
              break;
            case WebSocketMessageType.WEBSITE_STATUS:
              onWebsiteStatus?.(message.data);
              break;
            case WebSocketMessageType.PONG:
              // Handle pong response
              break;
            default:
              if (config.app.debug) {
                console.log('Unknown message type:', message.type);
              }
          }
        } catch (error) {
          if (config.app.debug) {
            console.error('Failed to parse WebSocket message:', error);
          }
        }
      };

      ws.onerror = (error) => {
        // Only log errors in debug mode to avoid console spam
        if (config.app.debug) {
          console.error('WebSocket connection error - this is normal if backend WebSocket is not running');
        }
        setIsConnecting(false);
        // Don't call onError to avoid disrupting the app
        // onError?.(error);
      };

      ws.onclose = (event) => {
        // Only log in debug mode
        if (config.app.debug && event.code !== 1000) {
          console.log('WebSocket disconnected with code:', event.code);
        }
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();

        // Attempt reconnection with exponential backoff
        if (
          autoReconnect &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1;
          
          // Exponential backoff: 3s, 6s, 12s, 24s, etc.
          const backoffDelay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000 // Max 30 seconds
          );
          
          if (config.app.debug) {
            console.log(
              `WebSocket will retry in ${backoffDelay / 1000}s (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
            );
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      if (config.app.debug) {
        console.error('Failed to create WebSocket connection:', error);
      }
      setIsConnecting(false);
      
      // Retry connection after a delay
      if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        const backoffDelay = Math.min(
          reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1),
          30000
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffDelay);
      }
    }
  }, [
    getToken,
    isConnecting,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
    onMonitoringUpdate,
    onAlertTriggered,
    onWebsiteStatus,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    ping,
  ]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  /**
   * Auto-connect on mount and cleanup on unmount
   */
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    ping,
  };
}
