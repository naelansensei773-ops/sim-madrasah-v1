"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PengampuPage() {
  const [dataPengampu, setDataPengampu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    
    // 1. Ambil data pengampu
    const { data: pengampu, error: errPengampu } = await supabase
      .schema("akademik")
      .from("pengampu_mapel")
      .select("*")
      .order("tahun_ajaran", { ascending: false });

    // 2. Ambil data guru dan mapel untuk mencocokkan ID
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap");
    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");

    if (errPengampu) {
      setError(errPengampu.message);
    } else {
      // 3. Gabungkan data (Mapping)
      const merged = (pengampu || []).map((p) => {
        const dataGuru = guru?.find((g) => g.id === p.guru_id);
        const dataMapel = mapel?.find((m) => m.id === p.mapel_id);
        
        return {
          ...p,
          nama_guru: dataGuru ? dataGuru.nama_lengkap : "Guru Dihapus",
          nama_mapel: dataMapel ? dataMapel.nama_mapel : "Mapel Dihapus",
        };
      });
      setDataPengampu(merged);
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
        <h1 className="text-2xl font-bold">Data Pengampu Mapel</h1>
        <Link
          href="/akademik/pengampu/tambah"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Pengampu
        </Link>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && dataPengampu.length === 0 && <p>Belum ada data pengampu.</p>}

      {!loading && !error && dataPengampu.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Nama Guru</th>
              <th className="border p-2 text-left">Mata Pelajaran</th>
              <th className="border p-2 text-left">Tahun Ajaran</th>
            </tr>
          </thead>
          <tbody>
            {dataPengampu.map((row) => (
              <tr key={row.id}>
                <td className="border p-2 font-medium">{row.nama_guru}</td>
                <td className="border p-2">{row.nama_mapel}</td>
                <td className="border p-2">{row.tahun_ajaran}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}