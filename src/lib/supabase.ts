import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Security guard: Ensure service_role key is never bundled in frontend
if ((import.meta.env as any).SUPABASE_SERVICE_ROLE_KEY || (import.meta.env as any).VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '[CRITICAL SECURITY WARNING]: A Supabase service_role key was detected in the frontend environment! ' +
    'The service_role key bypasses Row Level Security and must NEVER be exposed in client-side code.'
  );
}

// Environment validation
function validateSupabaseConfig(): { isValid: boolean; warning?: string; error?: string } {
  if (!supabaseUrl && !supabaseAnonKey) {
    return {
      isValid: false,
      warning: 'Supabase environment variables are not set. Running in standalone Express API mode.',
    };
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      isValid: false,
      error: 'Incomplete Supabase configuration. Both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided.',
    };
  }

  if (supabaseUrl.includes('[PROJECT-REF]')) {
    return {
      isValid: false,
      error: 'Supabase environment variables contain unreplaced placeholders ([PROJECT-REF]).',
    };
  }

  try {
    new URL(supabaseUrl);
  } catch {
    return {
      isValid: false,
      error: `Invalid VITE_SUPABASE_URL: "${supabaseUrl}". Must be a valid HTTPS URL.`,
    };
  }

  const isJwtFormat = supabaseAnonKey.split('.').length === 3;
  if (!isJwtFormat && supabaseAnonKey.startsWith('sb_publishable_')) {
    console.warn(
      '[Supabase Auth Notice]: VITE_SUPABASE_ANON_KEY appears to be a publishable key format (sb_publishable_...). ' +
      'If auth operations fail, ensure you provide the public anon JWT key (starts with "eyJ...") from Supabase Dashboard -> Settings -> API.'
    );
  }

  return { isValid: true };
}

const configStatus = validateSupabaseConfig();

if (configStatus.error) {
  console.error(`[Supabase Config Error]: ${configStatus.error}`);
} else if (configStatus.warning) {
  console.info(`[Supabase Config Info]: ${configStatus.warning}`);
}

export const isSupabaseConfigured = configStatus.isValid;

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
        storageKey: 'excel_insight_supabase_auth',
      },
    });
  } catch (err) {
    console.error('[Supabase Init Error]: Failed to initialize Supabase client:', err);
    supabaseInstance = null;
  }
}

export const supabase = supabaseInstance;
