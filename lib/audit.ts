// lib/audit.ts
import { supabase } from './supabase';

export async function catatAktivitas(
  aksi: string,
  modul: string,
  deskripsi: string
) {
  try {
    // 1. Ambil data user yang sedang login
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return; // Kalau nggak login, nggak usah catat

    // 2. Ambil profil user untuk dapat nama dan role
    const { data: profile } = await supabase
      .from('profiles')
      .select('nama_lengkap, role')
      .eq('id', user.id)
      .single();

    // 3. Masukkan data ke tabel audit
    await supabase.from('audit.log_aktivitas').insert({
      user_id: user.id,
      nama_user: profile?.nama_lengkap || user.email,
      role_user: profile?.role || 'unknown',
      aksi: aksi,
      modul: modul,
      deskripsi: deskripsi,
      // Catatan: IP address butuh edge function untuk akurat, kita kosongkan dulu atau isi 'localhost'
      ip_address: 'client-app' 
    });
  } catch (error) {
    console.error('Gagal mencatat audit log:', error);
    // Kita tidak throw error agar tidak mengganggu proses utama user
  }
}