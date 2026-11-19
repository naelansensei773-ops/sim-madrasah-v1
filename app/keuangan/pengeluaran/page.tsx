"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, Download, ShoppingCart, Search, Edit, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PengeluaranPage() {
  const router = useRouter();
  const [dataPengeluaran, setDataPengeluaran] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter
  const [keyword, setKeyword] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglSelesai, setTglSelesai] = useState("");

  async function loadData() {
    setLoading(true);
    let query = supabase.schema("keuangan").from("pengeluaran").select("*");

    if (tglMulai) query = query.gte("tanggal", tglMulai);
    if (tglSelesai) query = query.lte("tanggal", tglSelesai);
    query = query.order("tanggal", { ascending: false });

    const { data: pengeluaran, error } = await query;
    const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana");
    
    if (error) alert(error.message);
    else {
      let merged = (pengeluaran || []).map(p => ({
        ...p,
        nama_dana: sumber?.find(s => s.id === p.sumber_dana_id)?.nama_dana || "Tanpa Dana"
      }));

      if (keyword.trim() !== "") {
        merged = merged.filter(p => p.keterangan.toLowerCase().includes(keyword.toLowerCase()) || p.kategori.toLowerCase().includes(keyword.toLowerCase()));
      }
      setDataPengeluaran(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword, tglMulai, tglSelesai]);

  async function hapusData(id: string, fileUrl: string) {
    if (!confirm("Yakin ingin menghapus catatan pengeluaran ini?")) return;
    if (fileUrl) {
      const fileName = fileUrl.split("/").pop();
      if (fileName) await supabase.storage.from("documents").remove([fileName]);
    }
    const { error } = await supabase.schema("keuangan").from("pengeluaran").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Kas Umum (Pengeluaran)</h1>
            <p className="text-slate-500 text-sm mt-1">Catatan pengeluaran berdasarkan sumber dana.</p>
          </div>
          <Link href="/keuangan/pengeluaran/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm">
            <Plus size={18} /> Catat Pengeluaran
          </Link>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Cari Keterangan/Kategori</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
            <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm outline-none" placeholder="Ketik untuk mencari..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        </div>
        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Dari Tanggal</label>
          <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} />
        </div>
        <div className="w-full md:w-44">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Sampai Tanggal</label>
          <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} />
        </div>
        <button onClick={() => { setTglMulai(""); setTglSelesai(""); setKeyword(""); }} className="w-full md:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Reset</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : dataPengeluaran.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <ShoppingCart size={48} className="text-slate-300 mb-3" />
            <p>Tidak ada catatan pengeluaran pada periode ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Sumber Dana</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4 text-center">Bukti</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataPengeluaran.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.tanggal}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">{row.nama_dana}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{row.kategori}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.keterangan}</td>
                    <td className="px-6 py-4 font-bold text-red-600">{formatRupiah(row.nominal)}</td>
                    <td className="px-6 py-4 text-center">
                      {row.bukti_nota_url ? (
                        <a href={row.bukti_nota_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-lg"><Download size={14} /> Lihat</a>
                      ) : <span className="text-slate-400 italic text-xs">No File</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/keuangan/pengeluaran/edit/${row.id}`} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit size={18} /></Link>
                        <button onClick={() => hapusData(row.id, row.bukti_nota_url)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={18} /></button>
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