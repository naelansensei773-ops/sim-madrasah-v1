"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, ArrowLeft, UserCheck, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AbsensiGuruPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState("");

  async function loadData() {
    setLoading(true);
    let query = supabase.schema("kepegawaian").from("absensi_guru").select("*").order("tanggal", { ascending: false });
    
    if (tanggal) {
      query = query.eq("tanggal", tanggal);
    }

    const { data: absensi } = await query;
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap");

    if (absensi && guru) {
      const merged = absensi.map(a => ({
        ...a,
        nama_guru: guru.find(g => g.id === a.guru_id)?.nama_lengkap || "Guru Dihapus"
      }));
      setData(merged);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [tanggal]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Absensi Guru & Staf</h1>
            <p className="text-slate-500 text-sm mt-1">Catatan kehadiran harian guru madrasah.</p>
          </div>
        </div>
        <Link href="/kepegawaian/absensi-guru/tambah" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm">
          <Plus size={18} /> Input Kehadiran
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-3">
        <Calendar size={20} className="text-slate-500" />
        <label className="text-sm font-semibold text-slate-700">Filter Tanggal:</label>
        <input type="date" className="px-3 py-1.5 border rounded-lg text-sm" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
        {tanggal && <button onClick={() => setTanggal("")} className="text-xs text-red-500 hover:underline">Reset</button>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <UserCheck size={48} className="text-slate-300 mb-3" />
            <p>Belum ada catatan kehadiran guru.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Nama Guru</th>
                <th className="px-6 py-4">Jam Masuk</th>
                <th className="px-6 py-4">Jam Pulang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium">{row.tanggal}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{row.nama_guru}</td>
                  <td className="px-6 py-4 font-mono">{row.jam_masuk || "-"}</td>
                  <td className="px-6 py-4 font-mono">{row.jam_pulang || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      row.status === 'Hadir' ? 'bg-green-100 text-green-800' : 
                      row.status === 'Izin' || row.status === 'Sakit' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{row.keterangan || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}