"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, FileText, Download, Calendar, Tag } from "lucide-react";

export default function PencarianDokumen() {
  const [keyword, setKeyword] = useState("");
  const [tahun, setTahun] = useState("");
  const [hasil, setHasil] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sudahMencari, setSudahMencari] = useState(false);

  async function handleCari(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSudahMencari(true);

    // Mulai query ke tabel dokumen
    let query = supabase
      .schema("arsip")
      .from("dokumen")
      .select("*, kategori(nama_kategori)");

    // Jika keyword diisi, cari berdasarkan Judul ATAU Nomor Dokumen
    if (keyword.trim() !== "") {
      query = query.or(`judul.ilike.%${keyword}%,nomor_dokumen.ilike.%${keyword}%`);
    }

    // Jika tahun diisi, filter berdasarkan tahun
    if (tahun.trim() !== "") {
      query = query.eq("tahun", tahun);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      alert("Gagal mencari: " + error.message);
      setHasil([]);
    } else {
      setHasil(data || []);
    }
    
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Pencarian Dokumen</h1>
        <p className="text-slate-500 text-sm mt-1">Cari arsip berdasarkan judul, nomor, atau tahun dokumen.</p>
      </div>

      {/* FORM PENCARIAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <form onSubmit={handleCari} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Kata Kunci</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Cari Judul atau Nomor Surat..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-32">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cth: 2026"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Mencari..." : "Cari Dokumen"}
          </button>
        </form>
      </div>

      {/* HASIL PENCARIAN */}
      {loading && <p className="text-center text-slate-500">Sedang mencari dokumen...</p>}

      {!loading && sudahMencari && hasil.length === 0 && (
        <div className="text-center p-10 bg-white rounded-xl border border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 text-lg">Dokumen tidak ditemukan.</p>
          <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci atau tahun yang berbeda.</p>
        </div>
      )}

      {!loading && hasil.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 font-medium">Ditemukan {hasil.length} dokumen:</p>
          
          {hasil.map((dok) => (
            <div key={dok.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{dok.judul}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1">{dok.deskripsi || "Tidak ada deskripsi"}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Tag size={12} /> {dok.kategori?.nama_kategori || "Tanpa Kategori"}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                      <Calendar size={12} /> {dok.tanggal || dok.tahun || "-"}
                    </span>
                    <span className="font-mono text-slate-600">
                      No: {dok.nomor_dokumen || "-"}
                    </span>
                  </div>
                </div>
              </div>

              {dok.file_url ? (
                <a 
                  href={dok.file_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
                >
                  <Download size={16} /> Buka File
                </a>
              ) : (
                <span className="text-sm text-slate-400 italic px-4">File tidak tersedia</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}