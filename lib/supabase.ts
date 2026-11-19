import { createBrowserClient } from '@supabase/ssr'

// Kita tetap menamainya 'supabase' agar kode di halaman lain tidak error
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)