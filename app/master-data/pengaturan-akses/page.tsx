"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Save } from "lucide-react";

// Daftar semua menu di aplikasi kita
const ALL_FEATURES = [
  {
    group: "Master Data", items: [
      { key: "master_guru", label: "Data Guru" },
      { key: "master_siswa", label: "Data Siswa" },
      { key: "master_rombel", label: "Data Rombel" },
      { key: "master_mapel", label: "Mata Pelajaran" },
      { key: "master_pengguna", label: "Manajemen Pengguna" },
    ]
  },
  {
    group: "Akademik", items: [
      { key: "akademik_pengampu", label: "Pengampu Mapel" },
      { key: "akademik_jadwal", label: "Jadwal Pelajaran" },
      { key: "akademik_jurnal", label: "Jurnal Mengajar" },
      { key: "akademik_absensi", label: "Absensi Siswa" },
      { key: "akademik_asesmen", label: "Data Asesmen" },
      { key: "akademik_nilai", label: "Input Nilai" },
      { key: "akademik_leger", label: "Leger Nilai" },
      { key: "akademik_rapor", label: "Cetak Rapor" },
    ]
  },
  {
    group: "Arsip & Administrasi", items: [
      { key: "arsip_kategori", label: "Kategori Arsip" },
      { key: "arsip_dokumen", label: "Dokumen Arsip" },
      { key: "arsip_pencarian", label: "Pencarian Arsip" },
      { key: "administrasi_masuk", label: "Surat Masuk" },
      { key: "administrasi_keluar", label: "Surat Keluar" },
    ]
  },
  {
    group: "Keuangan", items: [
      { key: "keuangan_spp", label: "Pembayaran SPP" },
      { key: "keuangan_tarif", label: "Tarif SPP" },
      { key: "keuangan_tagihan", label: "Master Tagihan" },
      { key: "keuangan_rekap", label: "Rekap Per Anak" },
    ]
  },
  {
    group: "Sarpras", items: [
      { key: "sarpras_ruangan", label: "Data Ruangan" },
      { key: "sarpras_aset", label: "Data Aset" },
      { key: "sarpras_lokasi", label: "Lokasi Aset" },
      { key: "sarpras_kerusakan", label: "Laporan Kerusakan" },
      { key: "sarpras_pemeliharaan", label: "Pemeliharaan" },
      { key: "sarpras_peminjaman", label: "Peminjaman" },
    ]
  },
  // 📚 BARU DITAMBAHKAN: MODUL PERPUSTAKAAN
  {
    group: "Perpustakaan", items: [
      { key: "perpustakaan_katalog", label: "Katalog Buku" },
      { key: "perpustakaan_kategori", label: "Kategori Buku" },
      { key: "perpustakaan_pengarang", label: "Pengarang" },
      { key: "perpustakaan_penerbit", label: "Penerbit" },
      { key: "perpustakaan_eksemplar", label: "Eksemplar Buku" },
      { key: "perpustakaan_anggota", label: "Anggota" },
      { key: "perpustakaan_peminjaman", label: "Peminjaman" },
    ]
  },
  {
    group: "Monitoring", items: [
      { key: "monitoring_akademik", label: "Dashboard Akademik" },
      { key: "monitoring_arsip", label: "Dashboard Arsip" },
      { key: "monitoring_administrasi", label: "Dashboard Administrasi" },
      { key: "monitoring_sarpras", label: "Dashboard Sarpras" },
    ]
  }
];

const DAFTAR_ROLE = ["tu", "bendahara", "sarpras", "guru", "wali_kelas", "orang_tua", "pustakawan"];

export default function PengaturanAksesPage() {
  const [selectedRole, setSelectedRole] = useState("tu");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Ambil data akses berdasarkan role yang dipilih
  useEffect(() => {
    async function loadPermissions() {
      setLoading(true);
      const { data } = await supabase
        .from("role_permissions")
        .select("*")
        .eq("role", selectedRole);

      const permMap: Record<string, boolean> = {};
      data?.forEach((p) => {
        permMap[p.feature] = p.is_allowed;
      });
      setPermissions(permMap);
      setLoading(false);
    }
    loadPermissions();
  }, [selectedRole]);

  // Fungsi untuk mencentang / menghilangkan centang
  const togglePermission = (feature: string) => {
    setPermissions((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  // Simpan ke Database
  async function handleSimpan() {
    setSedangSimpan(true);
    
    // Siapkan data untuk di-upsert (update jika ada, insert jika belum)
    const dataToSave = Object.keys(permissions).map((feature) => ({
      role: selectedRole,
      feature: feature,
      is_allowed: permissions[feature],
    }));

    const { error } = await supabase
      .from("role_permissions")
      .upsert(dataToSave, { onConflict: "role, feature" });

    setSedangSimpan(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else alert(`Akses untuk role ${selectedRole.toUpperCase()} berhasil diperbarui!`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan Akses Fitur</h1>
        <p className="text-slate-500 text-sm mt-1">Tentukan menu apa saja yang boleh dibuka oleh setiap jabatan.</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
        <label className="font-semibold text-slate-700">Pilih Role / Jabatan:</label>
        <select 
          className="border border-slate-300 rounded-lg px-4 py-2 bg-white font-bold text-blue-600 uppercase outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {DAFTAR_ROLE.map(r => (
            <option key={r} value={r}>{r.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500">Memuat pengaturan akses...</div>
      ) : (
        <div className="space-y-6">
          {ALL_FEATURES.map((group) => (
            <div key={group.group} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
                {group.group}
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.items.map((item) => (
                  <label key={item.key} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      checked={permissions[item.key] || false}
                      onChange={() => togglePermission(item.key)}
                    />
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4 pb-20">
            <button
              onClick={handleSimpan}
              disabled={sedangSimpan}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50"
            >
              <Save size={20} /> {sedangSimpan ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}