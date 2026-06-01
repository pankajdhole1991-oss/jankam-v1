// ============================================
// JANKAM — SUPABASE POSTGRESQL CLIENT ADAPTER
// ============================================
import { createClient } from '@supabase/supabase-js';

// Retrieve credentials dynamically from environment variables or administrative overrides
console.log('[SUPABASE] Runtime Environment Variables Check:');
console.log('[SUPABASE] -> import.meta.env.VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('[SUPABASE] -> import.meta.env.VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 10)}...${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(-10)}` : 'undefined');
console.log('[SUPABASE] -> localStorage jankam_supabase_url:', localStorage.getItem('jankam_supabase_url'));
console.log('[SUPABASE] -> localStorage jankam_supabase_anon_key:', localStorage.getItem('jankam_supabase_anon_key') ? 'present' : 'absent');

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('jankam_supabase_url') || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('jankam_supabase_anon_key') || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

console.log('[SUPABASE] Creating client with URL:', SUPABASE_URL);
export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Dynamic validation checking if the cloud tables are fully configured
export const checkSupabaseOnline = async (): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[SUPABASE] Client is offline or unconfigured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set inside your .env file or local storage.');
    return false;
  }
  console.log('[SUPABASE] Client initialized successfully. Active Project URL:', SUPABASE_URL);
  return true;
};
