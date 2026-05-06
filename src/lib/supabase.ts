/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): url is string => {
  if (!url || url.includes('placeholder')) return false;
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    // Basic check to see if it looks like a supabase url and not a key
    if (url.startsWith('sb_')) return false; 
    return true;
  } catch {
    return false;
  }
};

// Log for debugging (Safe, only logs if missing)
if (!isValidUrl(supabaseUrl)) {
  console.error('CRITICAL: VITE_SUPABASE_URL is missing or invalid. Current value:', supabaseUrl);
}

export const supabase = createClient(
  isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase configuration is missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Secrets panel.');
}
