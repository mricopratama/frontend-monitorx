'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Activity, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { webhookService, type Webhook, type CreateWebhookRequest, type WebhookDelivery } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeliveriesDialog, setShowDeliveriesDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateWebhookRequest>({
    name: '',
    webhook_url: '',
    webhook_type: 'custom',
    send_on_downtime: true,
    send_on_recovery: true,
    send_on_ssl_expiry: true,
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getAll();
      setWebhooks(data || []);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await webhookService.create(formData);
      setShowAddDialog(false);
      setFormData({
        name: '',
        webhook_url: '',
        webhook_type: 'custom',
        send_on_downtime: true,
        send_on_recovery: true,
        send_on_ssl_expiry: true,
      });
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWebhook) return;
    try {
      setSubmitting(true);
      await webhookService.delete(selectedWebhook.id);
      setShowDeleteDialog(false);
      setSelectedWebhook(null);
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (webhook: Webhook) => {
    try {
      await webhookService.update(webhook.id, { is_active: !webhook.is_active });
      await loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update webhook');
    }
  };

  const viewDeliveries = async (webhook: Webhook) => {
    try {
      setSelectedWebhook(webhook);
      const data = await webhookService.getDeliveries(webhook.id, 50);
      setDeliveries(data || []);
      setShowDeliveriesDialog(true);
    } catch (error) {
      console.error('Failed to load deliveries:', error);
    }
  };

  const openDeleteDialog = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setShowDeleteDialog(true);
  };

  const getWebhookTypeIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return '💬';
      case 'discord':
        return '🎮';
      default:
        return '🔗';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Integration</h1>
          <p className="text-muted-foreground mt-2">
            Configure webhooks to receive notifications in Slack, Discord, or custom endpoints
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Webhooks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {webhooks.length === 0 ? (
          <Card className="p-12 text-center col-span-2">
            <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Webhook
            </Button>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getWebhookTypeIcon(webhook.webhook_type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {webhook.webhook_type} Webhook
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(webhook)}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      webhook.is_active
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {webhook.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Endpoint URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {webhook.webhook_url}
                  </code>
                  <a
                    href={webhook.webhook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/70"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Trigger Events</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.send_on_downtime && (
                    <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">
                      Downtime
                    </span>
                  )}
                  {webhook.send_on_recovery && (
                    <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                      Recovery
                    </span>
                  )}
                  {webhook.send_on_ssl_expiry && (
                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                      SSL Expiry
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewDeliveries(webhook)}
                  className="flex-1"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteDialog(webhook)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Webhook Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook endpoint to receive notifications
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Webhook Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Slack Channel"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Webhook Type</label>
                <select
                  value={formData.webhook_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      webhook_type: e.target.value as 'slack' | 'discord' | 'custom',
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-md"
                >
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                  <option value="custom">Custom Webhook</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Webhook URL</label>
                <Input
                  type="url"
                  value={formData.webhook_url}
                  onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.webhook_type === 'slack' && 'Get your Slack webhook URL from your workspace settings'}
                  {formData.webhook_type === 'discord' && 'Get your Discord webhook URL from channel settings'}
                  {formData.webhook_type === 'custom' && 'Enter any HTTPS endpoint that accepts POST requests'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Events</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.send_on_downtime}
                      onChange={(e) =>
                        setFormData({ ...formData, send_on_downtime: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Send when website goes down</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.send_on_recovery}
                      onChange={(e) =>
                        setFormData({ ...formData, send_on_recovery: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Send when website recovers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.send_on_ssl_expiry}
                      onChange={(e) =>
                        setFormData({ ...formData, send_on_ssl_expiry: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Send on SSL certificate expiry</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {submitting ? 'Creating...' : 'Create Webhook'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedWebhook?.name}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliveries Dialog */}
      <Dialog open={showDeliveriesDialog} onOpenChange={setShowDeliveriesDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery History - {selectedWebhook?.name}</DialogTitle>
            <DialogDescription>Recent webhook delivery attempts</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {deliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No deliveries yet</p>
            ) : (
              deliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="p-4 bg-muted rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {delivery.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : delivery.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className="font-medium capitalize">{delivery.event_type}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(delivery.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>
                      Status: <span className="font-medium">{delivery.status}</span>
                    </p>
                    {delivery.response_code && (
                      <p>
                        Response Code: <span className="font-medium">{delivery.response_code}</span>
                      </p>
                    )}
                    <p>
                      Attempts: <span className="font-medium">{delivery.attempt_count}</span>
                    </p>
                    {delivery.error_message && (
                      <p className="text-destructive">Error: {delivery.error_message}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDeliveriesDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
