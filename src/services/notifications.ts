// ============================================================
// JANKAM — OPERATIONAL NOTIFICATION QUEUE SERVICES
// ============================================================
import { supabase, checkSupabaseOnline } from './supabaseClient';
import { storageService } from './storage';

export interface NotificationItem {
  id?: number | string;
  recipient: string; // Phone number or Email address
  type: 'WhatsApp' | 'SMS' | 'Email';
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  retryCount?: number;
  errorNotes?: string;
  createdAt: string;
  sentAt?: string;
}

const STORAGE_KEY = 'jankam_notifications';

export const notificationsService = {
  // Queue a new notification
  queueNotification: async (
    recipient: string,
    type: 'WhatsApp' | 'SMS' | 'Email',
    message: string
  ): Promise<NotificationItem> => {
    const item: NotificationItem = {
      id: `NT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipient: recipient.trim(),
      type,
      message: message.trim(),
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Sync to Supabase Postgres Table
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { error } = await supabase.from('notifications').insert([{
          recipient: item.recipient,
          type: item.type,
          message: item.message,
          status: item.status,
          retry_count: item.retryCount,
          created_at: item.createdAt
        }]);
        
        if (error) {
          console.warn('[SUPABASE] Failed to insert notification in Supabase:', error);
        }
      } catch (e) {
        console.warn('Failed to insert notification in Supabase, keeping local cache:', e);
      }
    }

    // 2. Local Cache fallback
    const list = storageService.get<NotificationItem>(STORAGE_KEY) || [];
    list.unshift(item); // Prepend so new items are shown first
    storageService.set(STORAGE_KEY, list);
    window.dispatchEvent(new Event('jankam-notifications-update'));

    // Automatically trigger queue processing simulation
    setTimeout(() => {
      notificationsService.processQueue();
    }, 1000);

    return item;
  },

  // Retrieve complete notification logs
  getAll: async (): Promise<NotificationItem[]> => {
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            recipient: d.recipient,
            type: d.type,
            message: d.message,
            status: d.status,
            retryCount: d.retry_count,
            errorNotes: d.error_notes,
            createdAt: d.created_at,
            sentAt: d.sent_at
          }));
        }
      } catch {
        // ignore
      }
    }
    return storageService.get<NotificationItem>(STORAGE_KEY) || [];
  },

  // Manually retry a failed notification
  retryNotification: async (id: number | string): Promise<void> => {
    // 1. Update local cache
    const list = storageService.get<NotificationItem>(STORAGE_KEY) || [];
    let newRetryCount = 1;
    const updated = list.map(item => {
      if (item.id === id) {
        newRetryCount = (item.retryCount || 0) + 1;
        return {
          ...item,
          status: 'retry' as const,
          retryCount: newRetryCount,
        };
      }
      return item;
    });
    storageService.set(STORAGE_KEY, updated);
    window.dispatchEvent(new Event('jankam-notifications-update'));

    // 2. Sync to Supabase Postgres
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const dbId = typeof id === 'number' ? id : parseInt(String(id).split('-')[1]);
        if (!isNaN(dbId)) {
          await supabase
            .from('notifications')
            .update({ status: 'retry', retry_count: newRetryCount })
            .eq('id', dbId);
        }
      } catch (e) {
        // ignore
      }
    }

    // Trigger queue processing
    setTimeout(() => {
      notificationsService.processQueue();
    }, 800);
  },

  // Simulates transmission and processes any pending/retry items in the queue
  processQueue: async (): Promise<void> => {
    const list = storageService.get<NotificationItem>(STORAGE_KEY) || [];
    const pendingItems = list.filter(item => item.status === 'pending' || item.status === 'retry');
    
    if (pendingItems.length === 0) return;

    const updated = list.map(item => {
      if (item.status === 'pending' || item.status === 'retry') {
        // 90% transmission success rate simulation
        const success = Math.random() > 0.1;
        return {
          ...item,
          status: success ? ('sent' as const) : ('failed' as const),
          sentAt: success ? new Date().toISOString() : undefined,
          errorNotes: success ? undefined : 'Provider server timeout (simulated transmission fault).',
        };
      }
      return item;
    });

    storageService.set(STORAGE_KEY, updated);
    window.dispatchEvent(new Event('jankam-notifications-update'));

    // Sync status updates to Supabase
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      for (const item of pendingItems) {
        const success = Math.random() > 0.1;
        try {
          const dbId = typeof item.id === 'number' ? item.id : parseInt(String(item.id).split('-')[1]);
          if (!isNaN(dbId)) {
            await supabase
              .from('notifications')
              .update({
                status: success ? 'sent' : 'failed',
                sent_at: success ? new Date().toISOString() : null,
                error_notes: success ? null : 'Provider server timeout (simulated transmission fault).'
              })
              .eq('id', dbId);
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
};
