"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Download, Send, Edit, Search } from "lucide-react";

export default function SuratKeluarPage() {
  const [surat, setSurat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Pencarian & Filter
  const [keyword, setKeyword] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSifat, setFilterSifat] = useState("");

  async function loadData() {
    setLoading(true);
    
    let query = supabase
      .schema("administrasi")
      .from("surat_keluar")
      .select("*");

    if (keyword.trim() !== "") {
      query = query.or(`nomor_surat.ilike.%${keyword}%,tujuan.ilike.%${keyword}%`);
    }
    if (filterStatus !== "") {
      query = query.eq("status", filterStatus);
    }
    if (filterSifat !== "") {
      query = query.eq("sifat_surat", filterSifat);
    }

    const { data } = await query.order("tanggal_surat", { ascending: false });
    setSurat(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [filterStatus, filterSifat]);

  async function hapusSurat(id: string, fileUrl: string) {
    if (!confirm("Yakin ingin menghapus catatan surat keluar ini?")) return;

    if (fileUrl) {
      const fileName = fileUrl.split("/").pop();
      if (fileName) await supabase.storage.from("documents").remove([fileName]);
    }

    const { error } = await supabase.schema("administrasi").from("surat_keluar").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const getSifatBadge = (sifat: string) => {
    switch(sifat) {
      case 'Segera': return 'bg-red-100 text-red-800 border-red-200';
      case 'Penting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Surat Keluar</h1>
          <p className="text-slate-500 text-sm mt-1">Pencatatan surat dan dokumen yang dikirim oleh madrasah.</p>
        </div>
        <Link
          href="/administrasi/surat-keluar/tambah"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Surat Keluar
        </Link>
      </div>

      {/* AREA PENCARIAN & FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pencarian (Nomor / Tujuan)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none"
              placeholder="Ketik untuk mencari..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
            />
          </div>
        </div>

        <div className="w-full md:w-40">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Sifat</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500" value={filterSifat} onChange={(e) => setFilterSifat(e.target.value)}>
            <option value="">Semua Sifat</option>
            <option value="Biasa">Biasa</option>
            <option value="Penting">Penting</option>
            <option value="Segera">Segera</option>
          </select>
        </div>

        <div className="w-full md:w-40">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Filter Status</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-blue-500" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Terkirim">Terkirim</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <button onClick={loadData} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Cari
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Memuat data...</div>
        ) : surat.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Send size={48} className="text-slate-300 mb-3" />
            <p>Belum ada surat keluar yang dicatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nomor & Tanggal</th>
                  <th className="px-6 py-4">Tujuan</th>
                  <th className="px-6 py-4">Perihal & Sifat</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">File</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {surat.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{row.nomor_surat}</p>
                      <p className="text-xs text-slate-500">{row.tanggal_surat}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.tujuan}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800 mb-1">{row.perihal}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getSifatBadge(row.sifat_surat)}`}>
                        {row.sifat_surat || "Biasa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.status === 'Draft' ? 'bg-slate-100 text-slate-800' : 
                        row.status === 'Terkirim' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.file_url ? (
                        <a href={row.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Download size={14} /> Buka
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No File</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/administrasi/surat-keluar/edit/${row.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => hapusSurat(row.id, row.file_url)} className="text-red-500 hover:text-red-700 transition-colors">
                          <Trash2 size={18} />
                        </button>
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