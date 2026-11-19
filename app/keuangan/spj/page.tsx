"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, CheckCircle2, AlertCircle, FileCheck, Send, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SpjPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data: pengeluaran } = await supabase.schema("keuangan").from("pengeluaran").select("*").order("tanggal", { ascending: false });
    const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana");
    
    if (pengeluaran) {
      const merged = pengeluaran.map(p => ({
        ...p,
        nama_dana: sumber?.find(s => s.id === p.sumber_dana_id)?.nama_dana || "-"
      }));
      setData(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function ubahStatus(id: string, newStatus: string) {
    const { error } = await supabase.schema("keuangan").from("pengeluaran").update({ status_spj: newStatus }).eq("id", id);
    if (error) alert("Gagal update status: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200"><FileCheck size={12}/> Draft</span>;
      case 'Diajukan': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200"><Send size={12}/> Diajukan</span>;
      case 'Diverifikasi': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200"><CheckCircle2 size={12}/> Diverifikasi</span>;
      case 'Ditolak': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200"><XCircle size={12}/> Ditolak</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Verifikasi SPJ</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola status Surat Pertanggungjawaban (SPJ) belanja madrasah.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <AlertCircle size={48} className="text-slate-300 mb-3" />
            <p>Belum ada data pengeluaran yang perlu di-SPJ-kan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tgl / No. Bukti</th>
                  <th className="px-6 py-4">Uraian Belanja</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4 text-center">Status SPJ</th>
                  <th className="px-6 py-4 text-center">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{row.tanggal}</p>
                      <p className="text-xs text-slate-500 font-mono">{row.nomor_bukti || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{row.keterangan}</p>
                      <p className="text-xs text-slate-500">{row.nama_dana}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">{formatRupiah(row.nominal)}</td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(row.status_spj)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select 
                        className="text-xs border rounded p-1.5 bg-white"
                        value={row.status_spj}
                        onChange={(e) => ubahStatus(row.id, e.target.value)}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Diajukan">Diajukan</option>
                        <option value="Diverifikasi">Diverifikasi</option>
                        <option value="Ditolak">Ditolak</option>
                      </select>
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