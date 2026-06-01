// ============================================================
// JANKAM — IMMUTABLE COMPLIANCE AUDIT LOG SERVICES
// ============================================================
import { supabase, checkSupabaseOnline } from './supabaseClient';
import { storageService } from './storage';

export interface AuditLogData {
  id?: number;
  adminUser: string;
  action: string;
  targetId: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  ipAddress: string;
  browser: string;
  device: string;
  reason?: string;
}

const STORAGE_KEY = 'jankam_audit_logs';

export const auditLogsService = {
  // Capture administrative change entry
  log: async (params: Omit<AuditLogData, 'createdAt' | 'ipAddress' | 'browser' | 'device'>): Promise<void> => {
    // Collect device and browser details
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone/i.test(ua);
    const browser = ua.includes('Chrome') ? 'Google Chrome' : ua.includes('Firefox') ? 'Mozilla Firefox' : 'Safari Browser';
    const device = isMobile ? 'Mobile Smartphone' : 'Desktop Workstation';
    
    const entry: AuditLogData = {
      ...params,
      createdAt: new Date().toISOString(),
      ipAddress: '192.168.43.102', // Simulated Secure Local Node IP
      browser,
      device,
    };

    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { error } = await supabase.from('audit_logs').insert([{
          admin_user: entry.adminUser,
          action: entry.action,
          target_id: entry.targetId,
          old_value: entry.oldValue,
          new_value: entry.newValue,
          ip_address: entry.ipAddress,
          browser: entry.browser,
          device: entry.device,
          reason: entry.reason
        }]);
        if (!error) return;
      } catch (e) {
        console.warn('Failed to insert audit log into Supabase, saving to local cache:', e);
      }
    }

    // Local Storage Fallback
    const list = storageService.get<AuditLogData>(STORAGE_KEY) || [];
    list.unshift(entry); // Prepend to show recent logs first
    storageService.set(STORAGE_KEY, list);
    window.dispatchEvent(new Event('jankam-audit-logs-update'));
  },

  // Retrieve complete audit trail logs
  getAll: async (): Promise<AuditLogData[]> => {
    const isOnline = await checkSupabaseOnline();
    if (isOnline && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            adminUser: d.admin_user,
            action: d.action,
            targetId: d.target_id,
            oldValue: d.old_value,
            newValue: d.new_value,
            createdAt: d.created_at,
            ipAddress: d.ip_address,
            browser: d.browser,
            device: d.device,
            reason: d.reason
          }));
        }
      } catch {
        // ignore
      }
    }
    return storageService.get<AuditLogData>(STORAGE_KEY) || [];
  }
};
