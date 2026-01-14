import { apiClient } from './client';

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  webhook_url: string;
  webhook_type: 'slack' | 'discord' | 'custom';
  is_active: boolean;
  send_on_downtime: boolean;
  send_on_recovery: boolean;
  send_on_ssl_expiry: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWebhookRequest {
  name: string;
  webhook_url: string;
  webhook_type: 'slack' | 'discord' | 'custom';
  send_on_downtime?: boolean;
  send_on_recovery?: boolean;
  send_on_ssl_expiry?: boolean;
}

export interface UpdateWebhookRequest {
  name?: string;
  webhook_url?: string;
  is_active?: boolean;
  send_on_downtime?: boolean;
  send_on_recovery?: boolean;
  send_on_ssl_expiry?: boolean;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  website_id?: string;
  event_type: string;
  payload: string;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  error_message?: string;
  attempt_count: number;
  delivered_at?: string;
  created_at: string;
}

export const webhookService = {
  /**
   * Get all webhooks for the current user
   */
  async getAll(): Promise<Webhook[]> {
    const response = await apiClient.get('/webhooks');
    return response.data;
  },

  /**
   * Get a webhook by ID
   */
  async getById(id: string): Promise<Webhook> {
    const response = await apiClient.get(`/webhooks/${id}`);
    return response.data;
  },

  /**
   * Create a new webhook
   */
  async create(data: CreateWebhookRequest): Promise<Webhook> {
    const response = await apiClient.post('/webhooks', data);
    return response.data;
  },

  /**
   * Update a webhook
   */
  async update(id: string, data: UpdateWebhookRequest): Promise<Webhook> {
    const response = await apiClient.put(`/webhooks/${id}`, data);
    return response.data;
  },

  /**
   * Delete a webhook
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/webhooks/${id}`);
  },

  /**
   * Get delivery history for a webhook
   */
  async getDeliveries(id: string, limit: number = 50): Promise<WebhookDelivery[]> {
    const response = await apiClient.get(`/webhooks/${id}/deliveries?limit=${limit}`);
    return response.data;
  },
};
