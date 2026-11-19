"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, FileText, Download, Trash2, Eye } from "lucide-react";

export default function DokumenPage() {
  const [dokumen, setDokumen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    // Ambil data dokumen beserta nama kategorinya
    const { data, error } = await supabase
      .schema("arsip")
      .from("dokumen")
      .select("*, kategori(nama_kategori)")
      .order("created_at", { ascending: false });

    if (data) setDokumen(data);
    setLoading(false);
  }

  async function hapusDokumen(id: string, fileUrl: string) {
    if (!confirm("Yakin ingin menghapus dokumen ini secara permanen?")) return;

    // 1. Hapus file dari Storage (jika ada)
    if (fileUrl) {
      const fileName = fileUrl.split("/").pop(); // Ambil nama file dari URL
      if (fileName) {
        await supabase.storage.from("documents").remove([fileName]);
      }
    }

    // 2. Hapus data dari Database
    const { error } = await supabase.schema("arsip").from("dokumen").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dokumen Arsip</h1>
          <p className="text-slate-500 text-sm mt-1">Pusat penyimpanan dokumen digital madrasah.</p>
        </div>
        <Link
          href="/arsip/dokumen/tambah"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Upload Dokumen
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Memuat data...</div>
        ) : dokumen.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <FileText size={48} className="text-slate-300 mb-3" />
            <p>Belum ada dokumen yang diarsipkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Judul Dokumen</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Nomor / Tanggal</th>
                  <th className="px-6 py-4 text-center">File</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dokumen.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{row.judul}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{row.deskripsi}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.kategori?.nama_kategori || "Tanpa Kategori"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">{row.nomor_dokumen || "-"}</p>
                      <p className="text-xs text-slate-500">{row.tanggal || row.tahun || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.file_url ? (
                        <a 
                          href={row.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          <Download size={14} /> Buka
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">No File</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {/* Tombol Detail (Mata) */}
                        <Link href={`/arsip/dokumen/${row.id}`} className="text-slate-500 hover:text-blue-600 transition-colors" title="Lihat Detail & Riwayat">
                          <Eye size={18} />
                        </Link>
                        
                        {/* Tombol Hapus */}
                        <button onClick={() => hapusDokumen(row.id, row.file_url)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus Dokumen">
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