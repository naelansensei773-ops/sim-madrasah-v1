"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function JurnalPage() {
  const [jurnal, setJurnal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    
    // 1. Ambil data jurnal
    const { data: dataJurnal, error: errJurnal } = await supabase
      .schema("akademik")
      .from("jurnal_mengajar")
      .select("*")
      .order("tanggal", { ascending: false });

    // 2. Ambil data referensi
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap");
    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");
    const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel");

    if (errJurnal) {
      setError(errJurnal.message);
    } else {
      // 3. Gabungkan data
      const merged = (dataJurnal || []).map((j) => {
        return {
          ...j,
          nama_guru: guru?.find((g) => g.id === j.guru_id)?.nama_lengkap || "-",
          nama_mapel: mapel?.find((m) => m.id === j.mapel_id)?.nama_mapel || "-",
          nama_rombel: rombel?.find((r) => r.id === j.rombel_id)?.nama_rombel || "-",
        };
      });
      setJurnal(merged);
      setError(null);
    }
    setLoading(false);
  }

  // FUNGSI BARU: Hapus Jurnal
  async function hapusJurnal(id: string) {
    const yakin = confirm("Yakin ingin menghapus jurnal ini secara permanen?");
    if (!yakin) return;

    const { error } = await supabase
      .schema("akademik")
      .from("jurnal_mengajar")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Gagal menghapus: " + error.message);
    } else {
      loadData(); // Refresh tabel setelah dihapus
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jurnal Mengajar</h1>
        <Link
          href="/akademik/jurnal/tambah"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Jurnal
        </Link>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && jurnal.length === 0 && <p>Belum ada data jurnal.</p>}

      {!loading && !error && jurnal.length > 0 && (
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">Guru</th>
              <th className="border p-2 text-left">Mapel</th>
              <th className="border p-2 text-left">Rombel</th>
              <th className="border p-2 text-left">Materi</th>
              <th className="border p-2 text-center">Hadir / Alpha</th>
              <th className="border p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jurnal.map((row) => (
              <tr key={row.id}>
                <td className="border p-2 font-medium">{row.tanggal}</td>
                <td className="border p-2">{row.nama_guru}</td>
                <td className="border p-2">{row.nama_mapel}</td>
                <td className="border p-2">{row.nama_rombel}</td>
                <td className="border p-2">{row.materi}</td>
                <td className="border p-2 text-center">
                  <span className="text-green-600 font-bold">{row.jumlah_hadir}</span> / <span className="text-red-600 font-bold">{row.jumlah_tidak_hadir}</span>
                </td>
                <td className="border p-2 text-center space-x-2">
                  <Link
                    href={`/akademik/jurnal/edit/${row.id}`}
                    className="rounded bg-yellow-500 px-3 py-1 text-white text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => hapusJurnal(row.id)}
                    className="rounded bg-red-600 px-3 py-1 text-white text-sm"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}