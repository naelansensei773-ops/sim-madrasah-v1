"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, Download, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PenerimaanDanaPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    // Ambil data penerimaan beserta nama sumber dananya
    const { data: penerimaan } = await supabase.schema("keuangan").from("penerimaan_dana").select("*").order("tanggal", { ascending: false });
    const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana");

    if (penerimaan && sumber) {
      const merged = penerimaan.map(p => ({
        ...p,
        nama_dana: sumber.find(s => s.id === p.sumber_dana_id)?.nama_dana || "Dihapus"
      }));
      setData(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleHapus(id: string) {
    if (!confirm("Hapus catatan penerimaan dana ini?")) return;
    await supabase.schema("keuangan").from("penerimaan_dana").delete().eq("id", id);
    loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Penerimaan Dana (BOS/BOSDA)</h1>
            <p className="text-slate-500 text-sm mt-1">Catatan uang masuk dari pemerintah/pusat.</p>
          </div>
        </div>
        <Link href="/keuangan/penerimaan-dana/tambah" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm">
          <Plus size={18} /> Input Dana Masuk
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <p className="p-6 text-center text-slate-500">Memuat...</p> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Landmark size={48} className="text-slate-300 mb-3" />
            <p>Belum ada catatan penerimaan dana.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Sumber Dana</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4 text-center">Bukti</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium">{row.tanggal}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{row.nama_dana}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{row.keterangan}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{formatRupiah(row.nominal)}</td>
                  <td className="px-6 py-4 text-center">
                    {row.bukti_url ? (
                      <a href={row.bukti_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1"><Download size={14} /> Lihat</a>
                    ) : <span className="text-slate-400 italic text-xs">No File</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleHapus(row.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}