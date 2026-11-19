"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Wrench } from "lucide-react";

export default function PemeliharaanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data: pemeliharaan } = await supabase.schema("sarpras").from("pemeliharaan").select("*").order("tanggal", { ascending: false });
    const { data: aset } = await supabase.schema("sarpras").from("aset").select("id, nama_aset, kode_aset");

    const merged = (pemeliharaan || []).map(p => {
      const asetInfo = aset?.find(a => a.id === p.aset_id);
      return { ...p, aset: asetInfo || null };
    });
    setData(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function hapusData(id: string) {
    if (!confirm("Yakin ingin menghapus catatan pemeliharaan ini?")) return;
    const { error } = await supabase.schema("sarpras").from("pemeliharaan").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Pemeliharaan</h1>
          <p className="text-slate-500 text-sm mt-1">Catatan perbaikan dan perawatan aset madrasah.</p>
        </div>
        <Link href="/sarpras/pemeliharaan/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} /> Tambah Pemeliharaan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Wrench size={48} className="text-slate-300 mb-3" />
            <p>Belum ada catatan pemeliharaan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Aset</th>
                  <th className="px-6 py-4">Tindakan</th>
                  <th className="px-6 py-4">Pelaksana</th>
                  <th className="px-6 py-4 text-right">Biaya</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.tanggal}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{row.aset?.nama_aset || "-"}</p>
                      <p className="text-xs text-slate-500">{row.aset?.kode_aset || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs">{row.tindakan}</td>
                    <td className="px-6 py-4 text-slate-600">{row.pelaksana || "-"}</td>
                    <td className="px-6 py-4 text-right font-bold text-red-600">{formatRupiah(row.biaya)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => hapusData(row.id)} className="text-red-500 hover:text-red-700 transition-colors">
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