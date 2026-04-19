import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL veya Key eksikse daha kod patlamadan bizi uyarsın
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ve Anon Key eksik! .env dosyasını kontrol et kralkeke.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
