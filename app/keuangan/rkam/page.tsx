"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, ClipboardList, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ListRkamPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    // Ambil data RKAM dan Detailnya untuk menghitung Total Pagu
    const { data: rkam } = await supabase.schema("keuangan").from("rkam").select("*").order("created_at", { ascending: false });
    const { data: detail } = await supabase.schema("keuangan").from("rkam_detail").select("rkam_id, pagu_anggaran");

    if (rkam) {
      const merged = rkam.map(r => {
        const rincian = detail?.filter(d => d.rkam_id === r.id) || [];
        const totalPagu = rincian.reduce((sum, d) => sum + d.pagu_anggaran, 0);
        return { ...r, totalPagu, jumlahItem: rincian.length };
      });
      setData(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleHapus(id: string) {
    if (!confirm("Yakin ingin menghapus program RKAM ini beserta seluruh rinciannya?")) return;
    const { error } = await supabase.schema("keuangan").from("rkam").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rencana Kegiatan & Anggaran (RKAM)</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola perencanaan anggaran madrasah per program.</p>
          </div>
          <Link href="/keuangan/rkam/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm">
            <Plus size={18} /> Buat Program RKAM
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <ClipboardList size={48} className="text-slate-300 mb-3" />
            <p>Belum ada program RKAM yang dibuat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tahun Ajaran</th>
                  <th className="px-6 py-4">Nama Program</th>
                  <th className="px-6 py-4 text-center">Jml Item</th>
                  <th className="px-6 py-4 text-right">Total Pagu Anggaran</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-600">{row.tahun_ajaran}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.nama_program}</td>
                    <td className="px-6 py-4 text-center">{row.jumlahItem} Rincian</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-700">{formatRupiah(row.totalPagu)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/keuangan/rkam/${row.id}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium text-xs bg-slate-100 px-3 py-1.5 rounded-lg">
                          Lihat Rincian <ChevronRight size={14} />
                        </Link>
                        <button onClick={() => handleHapus(row.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
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