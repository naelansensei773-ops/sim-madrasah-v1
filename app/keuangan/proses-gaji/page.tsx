"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Printer, Settings2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ListProsesGajiPage() {
  const router = useRouter();
  const [bulan, setBulan] = useState("07");
  const [tahun, setTahun] = useState("2024");
  
  const [listGuru, setListGuru] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  async function handleTampilkan() {
    setLoading(true);
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
    const { data: slip } = await supabase.schema("keuangan").from("slip_gaji").select("*").eq("bulan", namaBulan[Number(bulan) - 1]).eq("tahun", tahun);

    if (guru) {
      const merged = guru.map(g => {
        const s = slip?.find(sl => sl.guru_id === g.id);
        return { ...g, slip: s || null };
      });
      setListGuru(merged);
    }
    setLoading(false);
  }

  useEffect(() => { handleTampilkan(); }, [bulan, tahun]);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proses Gaji Bulanan</h1>
          <p className="text-slate-500 text-sm mt-1">Pilih guru untuk memproses gaji dan honor kegiatan.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-48">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Bulan</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm" value={bulan} onChange={(e) => setBulan(e.target.value)}>
            {namaBulan.map((b, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{b}</option>)}
          </select>
        </div>
        <div className="w-full md:w-32">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun</label>
          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={tahun} onChange={(e) => setTahun(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Guru</th>
                <th className="px-6 py-4">Status Gaji ({namaBulan[Number(bulan) - 1]})</th>
                <th className="px-6 py-4 text-right">Gaji Bersih Diterima</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listGuru.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-semibold text-slate-800">{g.nama_lengkap}</td>
                  <td className="px-6 py-4">
                    {g.slip ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 size={16} /> Sudah Diproses</span>
                    ) : (
                      <span className="text-slate-400 italic">Belum Diproses</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700">
                    {g.slip ? formatRupiah(g.slip.gaji_bersih) : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {g.slip ? (
                      <Link href={`/keuangan/proses-gaji/slip/${g.id}?bulan=${bulan}&tahun=${tahun}`} className="inline-flex items-center gap-1 bg-slate-800 text-white hover:bg-slate-900 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Printer size={14} /> Cetak Slip
                      </Link>
                    ) : (
                      <Link href={`/keuangan/proses-gaji/proses/${g.id}?bulan=${bulan}&tahun=${tahun}`} className="inline-flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                        <Settings2 size={14} /> Proses Gaji
                      </Link>
                    )}
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