"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Users, GraduationCap, School, BookOpen, 
  Calendar, ClipboardList, CheckSquare, FileText, 
  BarChart, LineChart, Globe, ShieldCheck, FolderArchive, 
  FolderOpen, Search, Inbox, Send, Briefcase, Wallet, Settings, 
  FileSpreadsheet, UserCircle, Building, Box, MapPin, AlertTriangle, 
  Wrench, RotateCcw, LogOut, UserCog, Shield,
  // --- IKON BARU UNTUK PERPUSTAKAAN ---
  Library, Book, Tags, PenLine, Building2, BookCopy, UserCheck, BookCheck
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  
  const [role, setRole] = useState<string | null>(null);
  const [nama, setNama] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Ambil role user
        const { data: profile } = await supabase.from("profiles").select("role, nama_lengkap").eq("id", user.id).single();
        
        if (profile) {
          setRole(profile.role);
          setNama(profile.nama_lengkap || user.email);

          // 2. Ambil semua fitur yang diizinkan untuk role ini
          const { data: perms } = await supabase
            .from("role_permissions")
            .select("feature")
            .eq("role", profile.role)
            .eq("is_allowed", true);

          if (perms) {
            setPermissions(perms.map(p => p.feature));
          }
        }
      }
    }
    getUserData();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Sesuai aturan: pakai window.location.href agar state reset
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const menuClass = (path: string) => 
    `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
      isActive(path) 
        ? "bg-blue-600 text-white font-semibold shadow-md" 
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  // Fungsi pengecekan akses
  const hasAccess = (feature: string) => {
    if (role === 'kepala_madrasah') return true; // Kamad selalu punya akses penuh
    return permissions.includes(feature);
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl print:hidden z-20">
      <div className="p-6 border-b border-slate-800 text-center">
        <div className="text-2xl font-black tracking-wider text-blue-400">SiAkad.</div>
        <div className="mt-3 text-sm text-slate-300">
          Login sebagai: <br />
          <span className="font-bold text-white">{nama || "Memuat..."}</span> <br />
          <span className="text-xs bg-slate-800 text-blue-300 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">
            {role ? role.replace('_', ' ') : "..."}
          </span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <Link href="/" className={menuClass("/")}>
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </Link>
        
        {/* MASTER DATA */}
        {(hasAccess('master_guru') || hasAccess('master_siswa') || hasAccess('master_rombel') || hasAccess('master_mapel') || hasAccess('master_pengguna')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Master Data</div>
            {hasAccess('master_guru') && <Link href="/master-data/guru" className={menuClass("/master-data/guru")}><Users size={20} /> <span>Data Guru</span></Link>}
            {hasAccess('master_siswa') && <Link href="/master-data/siswa" className={menuClass("/master-data/siswa")}><GraduationCap size={20} /> <span>Data Siswa</span></Link>}
            {hasAccess('master_rombel') && <Link href="/master-data/rombel" className={menuClass("/master-data/rombel")}><School size={20} /> <span>Data Rombel</span></Link>}
            {hasAccess('master_mapel') && <Link href="/master-data/mapel" className={menuClass("/master-data/mapel")}><BookOpen size={20} /> <span>Mata Pelajaran</span></Link>}
            {role === 'kepala_madrasah' && (
              <>
                <Link href="/master-data/pengguna" className={menuClass("/master-data/pengguna")}><UserCog size={20} /> <span>Manajemen Pengguna</span></Link>
                <Link href="/master-data/pengaturan-akses" className={menuClass("/master-data/pengaturan-akses")}><Shield size={20} /> <span>Pengaturan Akses</span></Link>
              </>
            )}
          </>
        )}

        {/* AKADEMIK */}
        {(hasAccess('akademik_pengampu') || hasAccess('akademik_jadwal') || hasAccess('akademik_jurnal') || hasAccess('akademik_absensi') || hasAccess('akademik_asesmen') || hasAccess('akademik_nilai') || hasAccess('akademik_leger') || hasAccess('akademik_rapor')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Akademik</div>
            {hasAccess('akademik_pengampu') && <Link href="/akademik/pengampu" className={menuClass("/akademik/pengampu")}><ShieldCheck size={20} /> <span>Pengampu Mapel</span></Link>}
            {hasAccess('akademik_jadwal') && <Link href="/akademik/jadwal" className={menuClass("/akademik/jadwal")}><Calendar size={20} /> <span>Jadwal Pelajaran</span></Link>}
            {hasAccess('akademik_jurnal') && <Link href="/akademik/jurnal" className={menuClass("/akademik/jurnal")}><ClipboardList size={20} /> <span>Jurnal Mengajar</span></Link>}
            {hasAccess('akademik_absensi') && <Link href="/akademik/absensi" className={menuClass("/akademik/absensi")}><CheckSquare size={20} /> <span>Absensi Siswa</span></Link>}
            {hasAccess('akademik_asesmen') && <Link href="/akademik/asesmen" className={menuClass("/akademik/asesmen")}><FileText size={20} /> <span>Data Asesmen</span></Link>}
            {hasAccess('akademik_nilai') && <Link href="/akademik/nilai" className={menuClass("/akademik/nilai")}><BarChart size={20} /> <span>Input Nilai</span></Link>}
            {hasAccess('akademik_leger') && <Link href="/akademik/leger" className={menuClass("/akademik/leger")}><LineChart size={20} /> <span>Leger Nilai</span></Link>}
            {hasAccess('akademik_rapor') && <Link href="/akademik/rapor" className={menuClass("/akademik/rapor")}><FileText size={20} /> <span>Cetak Rapor</span></Link>}
          </>
        )}

        {/* ARSIP DIGITAL */}
        {(hasAccess('arsip_kategori') || hasAccess('arsip_dokumen') || hasAccess('arsip_pencarian')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Arsip Digital</div>
            {hasAccess('arsip_kategori') && <Link href="/arsip/kategori" className={menuClass("/arsip/kategori")}><FolderOpen size={20} /> <span>Kategori</span></Link>}
            {hasAccess('arsip_dokumen') && <Link href="/arsip/dokumen" className={menuClass("/arsip/dokumen")}><FolderArchive size={20} /> <span>Dokumen</span></Link>}
            {hasAccess('arsip_pencarian') && <Link href="/arsip/pencarian" className={menuClass("/arsip/pencarian")}><Search size={20} /> <span>Pencarian</span></Link>}
          </>
        )}

        {/* ADMINISTRASI */}
        {(hasAccess('administrasi_masuk') || hasAccess('administrasi_keluar')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Administrasi</div>
            {hasAccess('administrasi_masuk') && <Link href="/administrasi/surat-masuk" className={menuClass("/administrasi/surat-masuk")}><Inbox size={20} /> <span>Surat Masuk</span></Link>}
            {hasAccess('administrasi_keluar') && <Link href="/administrasi/surat-keluar" className={menuClass("/administrasi/surat-keluar")}><Send size={20} /> <span>Surat Keluar</span></Link>}
          </>
        )}

        {/* KEUANGAN */}
        {(hasAccess('keuangan_spp') || hasAccess('keuangan_tarif') || hasAccess('keuangan_tagihan') || hasAccess('keuangan_rekap')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Keuangan</div>
            {hasAccess('keuangan_spp') && <Link href="/keuangan/spp" className={menuClass("/keuangan/spp")}><Wallet size={20} /> <span>Pembayaran SPP</span></Link>}
            {hasAccess('keuangan_tarif') && <Link href="/keuangan/tarif" className={menuClass("/keuangan/tarif")}><Settings size={20} /> <span>Tarif SPP</span></Link>}
            {hasAccess('keuangan_tagihan') && <Link href="/keuangan/master-tagihan" className={menuClass("/keuangan/master-tagihan")}><FileSpreadsheet size={20} /> <span>Master Tagihan</span></Link>}
            {hasAccess('keuangan_rekap') && <Link href="/keuangan/rekap-anak" className={menuClass("/keuangan/rekap-anak")}><UserCircle size={20} /> <span>Rekap Per Anak</span></Link>}
          </>
        )}

        {/* 📚 PERPUSTAKAAN (BARU DITAMBAHKAN) */}
        {(hasAccess('perpustakaan_katalog') || hasAccess('perpustakaan_kategori') || hasAccess('perpustakaan_pengarang') || hasAccess('perpustakaan_penerbit') || hasAccess('perpustakaan_eksemplar') || hasAccess('perpustakaan_anggota') || hasAccess('perpustakaan_peminjaman')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Perpustakaan</div>
            {hasAccess('perpustakaan_katalog') && <Link href="/perpustakaan/katalog" className={menuClass("/perpustakaan/katalog")}><Book size={20} /> <span>Katalog Buku</span></Link>}
            {hasAccess('perpustakaan_kategori') && <Link href="/perpustakaan/kategori" className={menuClass("/perpustakaan/kategori")}><Tags size={20} /> <span>Kategori Buku</span></Link>}
            {hasAccess('perpustakaan_pengarang') && <Link href="/perpustakaan/pengarang" className={menuClass("/perpustakaan/pengarang")}><PenLine size={20} /> <span>Pengarang</span></Link>}
            {hasAccess('perpustakaan_penerbit') && <Link href="/perpustakaan/penerbit" className={menuClass("/perpustakaan/penerbit")}><Building2 size={20} /> <span>Penerbit</span></Link>}
            {hasAccess('perpustakaan_eksemplar') && <Link href="/perpustakaan/eksemplar" className={menuClass("/perpustakaan/eksemplar")}><BookCopy size={20} /> <span>Eksemplar Buku</span></Link>}
            {hasAccess('perpustakaan_anggota') && <Link href="/perpustakaan/anggota" className={menuClass("/perpustakaan/anggota")}><UserCheck size={20} /> <span>Anggota</span></Link>}
            {hasAccess('perpustakaan_peminjaman') && <Link href="/perpustakaan/peminjaman" className={menuClass("/perpustakaan/peminjaman")}><BookCheck size={20} /> <span>Peminjaman</span></Link>}
          </>
        )}

        {/* SARPRAS */}
        {(hasAccess('sarpras_ruangan') || hasAccess('sarpras_aset') || hasAccess('sarpras_lokasi') || hasAccess('sarpras_kerusakan') || hasAccess('sarpras_pemeliharaan') || hasAccess('sarpras_peminjaman')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Sarpras</div>
            {hasAccess('sarpras_ruangan') && <Link href="/sarpras/ruangan" className={menuClass("/sarpras/ruangan")}><Building size={20} /> <span>Data Ruangan</span></Link>}
            {hasAccess('sarpras_aset') && <Link href="/sarpras/aset" className={menuClass("/sarpras/aset")}><Box size={20} /> <span>Data Aset</span></Link>}
            {hasAccess('sarpras_lokasi') && <Link href="/sarpras/lokasi" className={menuClass("/sarpras/lokasi")}><MapPin size={20} /> <span>Lokasi Aset</span></Link>}
            {hasAccess('sarpras_kerusakan') && <Link href="/sarpras/kerusakan" className={menuClass("/sarpras/kerusakan")}><AlertTriangle size={20} /> <span>Laporan Kerusakan</span></Link>}
            {hasAccess('sarpras_pemeliharaan') && <Link href="/sarpras/pemeliharaan" className={menuClass("/sarpras/pemeliharaan")}><Wrench size={20} /> <span>Pemeliharaan</span></Link>}
            {hasAccess('sarpras_peminjaman') && <Link href="/sarpras/peminjaman" className={menuClass("/sarpras/peminjaman")}><RotateCcw size={20} /> <span>Peminjaman</span></Link>}
          </>
        )}

        {/* MONITORING & DASHBOARD */}
        {(hasAccess('monitoring_akademik') || hasAccess('monitoring_arsip') || hasAccess('monitoring_administrasi') || hasAccess('monitoring_sarpras')) && (
          <>
            <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Monitoring</div>
            {hasAccess('monitoring_akademik') && <Link href="/dashboard/akademik" className={menuClass("/dashboard/akademik")}><LayoutDashboard size={20} /> <span>Dashboard Akademik</span></Link>}
            {hasAccess('monitoring_arsip') && <Link href="/dashboard/arsip" className={menuClass("/dashboard/arsip")}><LayoutDashboard size={20} /> <span>Dashboard Arsip</span></Link>}
            {hasAccess('monitoring_administrasi') && <Link href="/dashboard/administrasi" className={menuClass("/dashboard/administrasi")}><Briefcase size={20} /> <span>Dashboard Administrasi</span></Link>}
            {hasAccess('monitoring_sarpras') && <Link href="/dashboard/sarpras" className={menuClass("/dashboard/sarpras")}><LayoutDashboard size={20} /> <span>Dashboard Sarpras</span></Link>}
          </>
        )}

        {/* LAINNYA */}
        <div className="pt-6 pb-2 text-xs text-slate-500 font-bold uppercase tracking-wider px-4">Lainnya</div>
        <Link href="/portal-orang-tua" className={menuClass("/portal-orang-tua")}><Globe size={20} /> <span>Portal Orang Tua</span></Link>
      </nav>

      {/* TOMBOL LOGOUT */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
        >
          <LogOut size={18} /> <span>Keluar / Logout</span>
        </button>
      </div>
    </aside>
  );
}