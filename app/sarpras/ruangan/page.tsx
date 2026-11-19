"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, DoorOpen, Search } from "lucide-react";

export default function RuanganPage() {
  const [ruangan, setRuangan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);
    let query = supabase.schema("sarpras").from("ruangan").select("*");
    
    if (keyword.trim() !== "") {
      query = query.or(`nama_ruangan.ilike.%${keyword}%,kode_ruangan.ilike.%${keyword}%`);
    }

    const { data } = await query.order("nama_ruangan");
    setRuangan(data || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword]);

  async function hapusRuangan(id: string) {
    if (!confirm("Yakin ingin menghapus ruangan ini?")) return;
    const { error } = await supabase.schema("sarpras").from("ruangan").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Ruangan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar ruangan yang ada di madrasah.</p>
        </div>
        <Link
          href="/sarpras/ruangan/tambah"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> Tambah Ruangan
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none" placeholder="Cari nama atau kode ruangan..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : ruangan.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <DoorOpen size={48} className="text-slate-300 mb-3" />
            <p>Belum ada data ruangan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Kode</th>
                  <th className="px-6 py-4">Nama Ruangan</th>
                  <th className="px-6 py-4">Jenis</th>
                  <th className="px-6 py-4">Luas / Kapasitas</th>
                  <th className="px-6 py-4">Penanggung Jawab</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ruangan.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.kode_ruangan}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.nama_ruangan}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.jenis_ruangan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.luas || "-"} / {row.kapasitas ? `${row.kapasitas} org` : "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.penanggung_jawab || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => hapusRuangan(row.id)} className="text-red-500 hover:text-red-700 transition-colors">
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