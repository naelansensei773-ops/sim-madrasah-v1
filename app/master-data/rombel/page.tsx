"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RombelPage() {
  const [rombel, setRombel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRombel() {
    setLoading(true);
    const { data, error } = await supabase
      .schema("master")
      .from("rombel")
      .select("*")
      .order("nama_rombel");

    if (error) {
      setError(error.message);
      setRombel([]);
    } else {
      setError(null);
      setRombel(data || []);
    }
    setLoading(false);
  }

  // FUNGSI BARU: Untuk Soft Delete Rombel
  async function nonaktifkanRombel(id: string) {
    const yakin = confirm("Yakin ingin menonaktifkan rombel ini?");
    if (!yakin) return;

    const { error } = await supabase
      .schema("master")
      .from("rombel")
      .update({ status_aktif: false })
      .eq("id", id);

    if (error) {
      alert("Gagal menonaktifkan: " + error.message);
    } else {
      loadRombel(); // Refresh data setelah dinonaktifkan
    }
  }

  useEffect(() => {
    loadRombel();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daftar Rombel</h1>
        <Link
          href="/master-data/rombel/tambah"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Tambah Rombel
        </Link>
      </div>

      {loading && <p>Memuat data...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && !error && rombel.length === 0 && <p>Belum ada data rombel.</p>}

      {!loading && !error && rombel.length > 0 && (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Nama Rombel</th>
              <th className="border p-2 text-left">Tingkat</th>
              <th className="border p-2 text-left">Tahun Ajaran</th>
              <th className="border p-2 text-left">Wali Kelas</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rombel.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.nama_rombel}</td>
                <td className="border p-2">{row.tingkat}</td>
                <td className="border p-2">{row.tahun_ajaran}</td>
                <td className="border p-2">{row.wali_kelas}</td>
                <td className="border p-2">
                  {row.status_aktif ? (
                    <span className="text-green-600 font-semibold">Aktif</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Tidak Aktif</span>
                  )}
                </td>
                <td className="border p-2 text-center space-x-2">
                  {/* Tombol Edit */}
                  <Link
                    href={`/master-data/rombel/edit/${row.id}`}
                    className="rounded bg-yellow-500 px-3 py-1 text-white text-sm"
                  >
                    Edit
                  </Link>
                  
                  {/* Tombol Nonaktifkan */}
                  {row.status_aktif && (
                    <button
                      onClick={() => nonaktifkanRombel(row.id)}
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