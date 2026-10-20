import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }) 
  : null;

export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'SUPABASE_NOT_CONFIGURED',
      message: 'Supabase URL & Anon Key chưa được thiết lập trong file .env'
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    return { success: false, error: err.message };
  }
};

export const signOut = async () => {
  if (supabase) {
    await supabase.auth.signOut();
  }
};
