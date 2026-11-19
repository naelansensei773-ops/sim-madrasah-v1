"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, AlertTriangle, Edit, Clock, CheckCircle2 } from "lucide-react";

export default function KerusakanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data: rusak } = await supabase.schema("sarpras").from("kerusakan").select("*").order("created_at", { ascending: false });
    const { data: aset } = await supabase.schema("sarpras").from("aset").select("id, nama_aset, kode_aset");

    const merged = (rusak || []).map(r => {
      const asetInfo = aset?.find(a => a.id === r.aset_id);
      return { ...r, aset: asetInfo || null };
    });

    setData(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function hapusLaporan(id: string) {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;
    const { error } = await supabase.schema("sarpras").from("kerusakan").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Dilaporkan': return { bg: 'bg-red-100 text-red-800', icon: <AlertTriangle size={14} /> };
      case 'Diproses': return { bg: 'bg-yellow-100 text-yellow-800', icon: <Clock size={14} /> };
      case 'Selesai': return { bg: 'bg-green-100 text-green-800', icon: <CheckCircle2 size={14} /> };
      default: return { bg: 'bg-slate-100 text-slate-800', icon: null };
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporan Kerusakan</h1>
          <p className="text-slate-500 text-sm mt-1">Daftar laporan kerusakan aset dari guru dan staf.</p>
        </div>
        <Link href="/sarpras/kerusakan/tambah" className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} /> Laporkan Kerusakan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <AlertTriangle size={48} className="text-slate-300 mb-3" />
            <p>Belum ada laporan kerusakan. Aset dalam kondisi aman! 🎉</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Aset</th>
                  <th className="px-6 py-4">Pelapor</th>
                  <th className="px-6 py-4">Deskripsi Kerusakan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => {
                  const badge = getStatusBadge(row.status);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{row.tanggal_lapor}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{row.aset?.nama_aset || "Aset Dihapus"}</p>
                        <p className="text-xs text-slate-500">{row.aset?.kode_aset || "-"}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{row.pelapor}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs">{row.deskripsi_kerusakan}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                          {badge.icon} {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/sarpras/kerusakan/edit/${row.id}`} className="text-blue-500 hover:text-blue-700 transition-colors" title="Update Status">
                            <Edit size={18} />
                          </Link>
                          <button onClick={() => hapusLaporan(row.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}