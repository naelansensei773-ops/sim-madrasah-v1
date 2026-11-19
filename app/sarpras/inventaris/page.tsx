"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InventarisPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);
    const { data: inventaris } = await supabase.schema("sarpras").from("inventaris").select("*").order("nama_barang");
    const { data: ruangan } = await supabase.schema("sarpras").from("ruangan").select("id, nama_ruangan");
    const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana");

    if (inventaris) {
      let merged = inventaris.map(i => ({
        ...i,
        nama_ruangan: ruangan?.find(r => r.id === i.ruangan_id)?.nama_ruangan || "Tanpa Ruangan",
        nama_sumber: sumber?.find(s => s.id === i.sumber_dana_id)?.nama_dana || "-"
      }));

      if (keyword.trim() !== "") {
        merged = merged.filter(i => i.nama_barang.toLowerCase().includes(keyword.toLowerCase()) || i.kode_barang?.toLowerCase().includes(keyword.toLowerCase()));
      }
      setData(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword]);

  async function handleHapus(id: string) {
    if (!confirm("Yakin ingin menghapus barang ini dari daftar inventaris?")) return;
    const { error } = await supabase.schema("sarpras").from("inventaris").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const getKondisiBadge = (kondisi: string) => {
    switch(kondisi) {
      case 'Baik': return 'bg-green-100 text-green-800';
      case 'Rusak Ringan': return 'bg-yellow-100 text-yellow-800';
      case 'Rusak Berat': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Inventaris Sarpras</h1>
            <p className="text-slate-500 text-sm mt-1">Daftar aset dan sarana prasarana madrasah.</p>
          </div>
          <Link href="/sarpras/inventaris/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm">
            <Plus size={18} /> Tambah Barang
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari nama barang atau kode..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Package size={48} className="text-slate-300 mb-3" />
            <p>Tidak ada data inventaris ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Barang</th>
                  <th className="px-6 py-4">Kode / Jumlah</th>
                  <th className="px-6 py-4">Ruangan</th>
                  <th className="px-6 py-4">Kondisi</th>
                  <th className="px-6 py-4">Sumber Dana</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{row.nama_barang}</p>
                      <p className="text-xs text-slate-500">{row.keterangan || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-slate-600">{row.kode_barang || "Tanpa Kode"}</p>
                      <p className="font-bold text-slate-800 mt-1">{row.jumlah} Unit</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{row.nama_ruangan}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getKondisiBadge(row.kondisi)}`}>
                        {row.kondisi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {row.nama_sumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleHapus(row.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={18} /></button>
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