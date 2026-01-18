import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PushNotificationSettings } from '../push-notification-settings';

// Mock the push notifications hook
vi.mock('@/lib/hooks/use-push-notifications', () => ({
  usePushNotifications: vi.fn(),
}));

describe('PushNotificationSettings', () => {
  const mockSubscribe = vi.fn();
  const mockUnsubscribe = vi.fn();
  const mockSendTestNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show not supported message when push notifications are not supported', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: false,
      subscription: null,
      permission: 'default',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/not supported/i)).toBeInTheDocument();
  });

  it('should show enable button when not subscribed', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'default',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/enable/i)).toBeInTheDocument();
  });

  it('should show disable button when subscribed', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: { endpoint: 'test-endpoint' },
      permission: 'granted',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: true,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/disable/i)).toBeInTheDocument();
  });

  it('should call subscribe when enable button is clicked', async () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'default',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    const enableButton = screen.getByText(/enable/i);
    fireEvent.click(enableButton);

    await waitFor(() => {
      expect(mockSubscribe).toHaveBeenCalled();
    });
  });

  it('should call unsubscribe when disable button is clicked', async () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: { endpoint: 'test-endpoint' },
      permission: 'granted',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: true,
    });

    render(<PushNotificationSettings />);
    
    const disableButton = screen.getByText(/disable/i);
    fireEvent.click(disableButton);

    await waitFor(() => {
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  it('should show test notification button when subscribed', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: { endpoint: 'test-endpoint' },
      permission: 'granted',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: true,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/send test/i)).toBeInTheDocument();
  });

  it('should call sendTestNotification when test button is clicked', async () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: { endpoint: 'test-endpoint' },
      permission: 'granted',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: true,
    });

    render(<PushNotificationSettings />);
    
    const testButton = screen.getByText(/send test/i);
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockSendTestNotification).toHaveBeenCalled();
    });
  });

  it('should show loading state', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'default',
      loading: true,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    // Button should be disabled during loading
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should display current permission status', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'granted',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/granted/i)).toBeInTheDocument();
  });

  it('should show denied permission message', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'denied',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/denied/i)).toBeInTheDocument();
  });

  it('should render card with title and description', () => {
    const { usePushNotifications } = require('@/lib/hooks/use-push-notifications');
    usePushNotifications.mockReturnValue({
      isSupported: true,
      subscription: null,
      permission: 'default',
      loading: false,
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      sendTestNotification: mockSendTestNotification,
      isSubscribed: false,
    });

    render(<PushNotificationSettings />);
    
    expect(screen.getByText(/push notification/i)).toBeInTheDocument();
  });
});
