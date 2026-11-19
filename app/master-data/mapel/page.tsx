"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MapelPage() {
  const [mapel, setMapel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadMapel() {
    setLoading(true);
    const { data, error } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .select("*")
      .order("kode_mapel");

    if (error) {
      setError(error.message);
      setMapel([]);
    } else {
      setError(null);
      setMapel(data || []);
    }
    setLoading(false);
  }

  async function nonaktifkanMapel(id: string) {
    const yakin = confirm("Yakin ingin menonaktifkan mapel ini?");
    if (!yakin) return;

    // Menggunakan kolom 'aktif' sesuai panduan PDF
    const { error } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .update({ aktif: false })
      .eq("id", id);

    if (error) {
      alert("Gagal menonaktifkan: " + error.message);
    } else {
      loadMapel();
    }
  }

  useEffect(() => {
    loadMapel();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Mata Pelajaran</h1>
        <Link
          href="/master-data/mapel/tambah"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Mapel
        </Link>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && mapel.length === 0 && <p>Belum ada data mapel.</p>}

      {!loading && !error && mapel.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Kode</th>
              <th className="border p-2 text-left">Nama Mapel</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mapel.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.kode_mapel}</td>
                <td className="border p-2">{row.nama_mapel}</td>
                <td className="border p-2">
                  {row.aktif ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Tidak Aktif</span>
                  )}
                </td>
                <td className="border p-2 text-center space-x-2">
                  <Link
                    href={`/master-data/mapel/edit/${row.id}`}
                    className="rounded bg-yellow-500 px-3 py-1 text-white text-sm"
                  >
                    Edit
                  </Link>
                  
                  {row.aktif && (
                    <button
                      onClick={() => nonaktifkanMapel(row.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white text-sm"
                    >
                      Nonaktifkan
                    </button>
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