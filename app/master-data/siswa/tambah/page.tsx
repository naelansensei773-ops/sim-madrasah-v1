"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahSiswa() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  async function simpan() {
    if (!nama.trim()) return alert("Nama lengkap wajib diisi.");
    setLoading(true);
    const { error } = await supabase.schema("master").from("siswa").insert([{ nis, nama_lengkap: nama }]);
    setLoading(false);
    if (error) alert("Gagal menyimpan siswa: " + error.message);
    else router.push("/master-data/siswa");
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Halaman */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Siswa</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan data diri siswa baru.</p>
        </div>
      </div>

      {/* Kartu Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">NIS (Nomor Induk Siswa)</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: 2024001"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Masukkan nama lengkap siswa"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={simpan}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
            <button
              onClick={() => router.push("/master-data/siswa")}
              className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}