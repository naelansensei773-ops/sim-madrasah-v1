"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahKategori() {
  const router = useRouter();
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  async function simpan() {
    if (!kode || !nama) return alert("Kode dan Nama Kategori wajib diisi!");
    setLoading(true);
    const { error } = await supabase.schema("arsip").from("kategori").insert([{
      kode: kode.toUpperCase(), // otomatis jadi huruf besar
      nama_kategori: nama,
      deskripsi
    }]);
    setLoading(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/arsip/kategori");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Kategori</h1>
          <p className="text-slate-500 text-sm mt-1">Buat pengelompokan baru untuk arsip dokumen.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Kategori</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all uppercase"
              placeholder="Contoh: SK, SURAT_MASUK"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Kategori</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Surat Keputusan"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi (Opsional)</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              rows={3}
              placeholder="Penjelasan singkat mengenai kategori ini..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={simpan}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Kategori"}
            </button>
            <button
              onClick={() => router.push("/arsip/kategori")}
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