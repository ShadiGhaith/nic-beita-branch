import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// طباعة تشخيصية في F12 Console لمعرفة القراءات الحقيقية
if (typeof window !== 'undefined') {
  console.log('🔗 Supabase URL:', supabaseUrl ? 'Loaded' : 'MISSING!');
  console.log('🔑 Supabase Key:', supabaseAnonKey ? 'Loaded' : 'MISSING!');
}

declare global {
  var supabaseClient: SupabaseClient | undefined;
}

export const supabase =
  globalThis.supabaseClient || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== 'production') {
  globalThis.supabaseClient = supabase;
}