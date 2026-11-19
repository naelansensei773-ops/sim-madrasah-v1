"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function SiswaPage() {
  const [siswa, setSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSiswa() {
    setLoading(true);
    const { data, error } = await supabase
      .schema("master")
      .from("siswa")
      .select("*, rombel(nama_rombel)") 
      .order("nama_lengkap");

    if (error) {
      setError(error.message);
      setSiswa([]);
    } else {
      setError(null);
      setSiswa(data || []);
    }
    setLoading(false);
  }

  async function nonaktifkanSiswa(id: string) {
    const yakin = confirm("Yakin ingin menonaktifkan siswa ini?");
    if (!yakin) return;
    const { error } = await supabase.schema("master").from("siswa").update({ status_siswa: "Tidak Aktif" }).eq("id", id);
    if (error) alert("Gagal menonaktifkan: " + error.message);
    else loadSiswa();
  }

  useEffect(() => { loadSiswa(); }, []);

  return (
    <div>
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Siswa</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola informasi seluruh siswa terdaftar.</p>
        </div>
        <Link
          href="/master-data/siswa/tambah"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Siswa
        </Link>
      </div>

      {/* Konten Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading && <div className="p-6 text-center text-slate-500">Memuat data...</div>}
        {error && <div className="p-6 text-center text-red-600">Error: {error}</div>}

        {!loading && !error && siswa.length === 0 && (
          <div className="p-10 text-center text-slate-500">Belum ada data siswa.</div>
        )}

        {!loading && !error && siswa.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">NIS</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Kelas / Rombel</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {siswa.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.nis}</td>
                    <td className="px-6 py-4">{row.nama_lengkap}</td>
                    <td className="px-6 py-4">
                      {row.rombel?.nama_rombel || <span className="text-slate-400 italic">Belum ada kelas</span>}
                    </td>
                    <td className="px-6 py-4">
                      {row.status_siswa === "Aktif" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/master-data/siswa/edit/${row.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Edit size={18} />
                        </Link>
                        {row.status_siswa === "Aktif" && (
                          <button onClick={() => nonaktifkanSiswa(row.id)} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}