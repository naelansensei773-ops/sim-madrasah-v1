"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function JadwalPage() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    
    // 1. Ambil data jadwal
    const { data: dataJadwal, error: errJadwal } = await supabase
      .schema("akademik")
      .from("jadwal_pelajaran")
      .select("*")
      .order("hari");

    // 2. Ambil data referensi (Guru, Mapel, Rombel)
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap");
    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");
    const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel");

    if (errJadwal) {
      setError(errJadwal.message);
    } else {
      // 3. Gabungkan data
      const merged = (dataJadwal || []).map((j) => {
        return {
          ...j,
          nama_guru: guru?.find((g) => g.id === j.guru_id)?.nama_lengkap || "-",
          nama_mapel: mapel?.find((m) => m.id === j.mapel_id)?.nama_mapel || "-",
          nama_rombel: rombel?.find((r) => r.id === j.rombel_id)?.nama_rombel || "-",
        };
      });
      setJadwal(merged);
      setError(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jadwal Pelajaran</h1>
        <Link
          href="/akademik/jadwal/tambah"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Jadwal
        </Link>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && jadwal.length === 0 && <p>Belum ada data jadwal.</p>}

      {!loading && !error && jadwal.length > 0 && (
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Hari</th>
              <th className="border p-2 text-left">Jam</th>
              <th className="border p-2 text-left">Rombel</th>
              <th className="border p-2 text-left">Mapel</th>
              <th className="border p-2 text-left">Guru</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((row) => (
              <tr key={row.id}>
                <td className="border p-2 font-medium">{row.hari}</td>
                <td className="border p-2">
                  Jam {row.jam_ke} ({row.jam_mulai} - {row.jam_selesai})
                </td>
                <td className="border p-2">{row.nama_rombel}</td>
                <td className="border p-2">{row.nama_mapel}</td>
                <td className="border p-2">{row.nama_guru}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}