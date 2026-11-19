"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, FolderOpen } from "lucide-react";

export default function KategoriPage() {
  const [kategori, setKategori] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.schema("arsip").from("kategori").select("*").order("nama_kategori");
    setKategori(data || []);
    setLoading(false);
  }

  async function hapusKategori(id: string) {
    if (!confirm("Yakin ingin menghapus kategori ini? Dokumen di dalamnya mungkin akan terpengaruh.")) return;
    const { error } = await supabase.schema("arsip").from("kategori").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kategori Dokumen</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola pengelompokan jenis-jenis dokumen arsip.</p>
        </div>
        <Link
          href="/arsip/kategori/tambah"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Kategori
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Memuat data...</div>
        ) : kategori.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <FolderOpen size={48} className="text-slate-300 mb-3" />
            <p>Belum ada kategori dokumen.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Kode</th>
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kategori.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.kode}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{row.nama_kategori}</td>
                    <td className="px-6 py-4 text-slate-500">{row.deskripsi || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => hapusKategori(row.id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <Trash2 size={18} />
                      </button>
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