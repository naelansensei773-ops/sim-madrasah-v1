"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardAkademik() {
  // State untuk Card Statistik
  const [stats, setStats] = useState({
    jurnal: 0,
    absensi: 0,
    nilai: 0,
    rapor: 0,
  });

  // State untuk Monitoring Jurnal
  const [tanggal, setTanggal] = useState("");
  const [hari, setHari] = useState("");
  const [dataMonitoring, setDataMonitoring] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getHariIndo = (dateString: string) => {
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const d = new Date(dateString);
    return days[d.getDay()];
  };

  // 1. Fungsi Ambil Statistik
  async function loadStats() {
    const today = new Date().toISOString().split("T")[0];

    // Hitung total jurnal
    const { count: countJurnal } = await supabase.schema("akademik").from("jurnal_mengajar").select("*", { count: "exact", head: true });
    
    // Hitung absensi hari ini
    const { count: countAbsensi } = await supabase.schema("akademik").from("kehadiran_siswa").select("*", { count: "exact", head: true }).eq("tanggal", today);
    
    // Hitung total asesmen (sebagai gambaran nilai masuk)
    const { count: countNilai } = await supabase.schema("akademik").from("nilai_siswa").select("*", { count: "exact", head: true });
    
    // Hitung rapor yang sudah diisi catatannya
    const { count: countRapor } = await supabase.schema("akademik").from("rapor_catatan").select("*", { count: "exact", head: true });

    setStats({
      jurnal: countJurnal || 0,
      absensi: countAbsensi || 0,
      nilai: countNilai || 0,
      rapor: countRapor || 0,
    });
  }

  // 2. Fungsi Ambil Data Monitoring Jurnal (Sama seperti sebelumnya)
  async function loadMonitoring(dateStr: string) {
    setLoading(true);
    const namaHari = getHariIndo(dateStr);
    setHari(namaHari);

    const { data: jadwal } = await supabase.schema("akademik").from("jadwal_pelajaran").select("*").eq("hari", namaHari).order("jam_ke");
    const { data: jurnal } = await supabase.schema("akademik").from("jurnal_mengajar").select("*").eq("tanggal", dateStr);
    
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap");
    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");
    const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel");

    const merged = (jadwal || []).map((j) => {
      const jurnalMatch = jurnal?.find((jr) => jr.guru_id === j.guru_id && jr.mapel_id === j.mapel_id && jr.rombel_id === j.rombel_id);
      return {
        id: j.id,
        jam_ke: j.jam_ke,
        nama_guru: guru?.find((g) => g.id === j.guru_id)?.nama_lengkap || "-",
        nama_mapel: mapel?.find((m) => m.id === j.mapel_id)?.nama_mapel || "-",
        nama_rombel: rombel?.find((r) => r.id === j.rombel_id)?.nama_rombel || "-",
        sudah_isi: !!jurnalMatch,
        materi: jurnalMatch ? jurnalMatch.materi : "-",
      };
    });

    setDataMonitoring(merged);
    setLoading(false);
  }

  // Panggil fungsi saat halaman pertama kali dibuka
  useEffect(() => {
    loadStats();
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);
    loadMonitoring(today);
  }, []);

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setTanggal(newDate);
    if (newDate) loadMonitoring(newDate);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Akademik</h1>

      {/* 4 KOTAK STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Jurnal</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.jurnal}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Absensi Hari Ini</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.absensi}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Nilai Masuk</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.nilai}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Catatan Rapor</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stats.rapor}</p>
        </div>
      </div>

      <hr className="mb-8" />

      {/* SECTION MONITORING JURNAL */}
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded shadow">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Monitoring Jurnal KBM</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau kepatuhan guru dalam mengisi jurnal mengajar.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="font-semibold text-gray-700">Pilih Tanggal:</label>
          <input 
            type="date" 
            className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
            value={tanggal}
            onChange={handleTanggalChange}
          />
        </div>
      </div>

      <div className="mb-4">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Hari: {hari}
        </span>
      </div>

      {loading && <p>Memuat data monitoring...</p>}

      {!loading && dataMonitoring.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">Tidak ada jadwal pelajaran untuk hari {hari}.</p>
        </div>
      )}

      {!loading && dataMonitoring.length > 0 && (
        <table className="w-full border-collapse border bg-white shadow-sm text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="border p-3 text-left">Jam Ke</th>
              <th className="border p-3 text-left">Guru Pengajar</th>
              <th className="border p-3 text-left">Mata Pelajaran</th>
              <th className="border p-3 text-left">Rombel</th>
              <th className="border p-3 text-left">Materi Jurnal</th>
              <th className="border p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {dataMonitoring.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border p-3 font-medium text-center">{row.jam_ke}</td>
                <td className="border p-3">{row.nama_guru}</td>
                <td className="border p-3">{row.nama_mapel}</td>
                <td className="border p-3">{row.nama_rombel}</td>
                <td className="border p-3 italic text-gray-500">{row.materi}</td>
                <td className="border p-3 text-center">
                  {row.sudah_isi ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                      ✓ Sudah Isi
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                      ✗ Belum Isi
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}