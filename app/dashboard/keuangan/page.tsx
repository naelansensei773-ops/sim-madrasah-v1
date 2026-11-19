"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Wallet, TrendingUp, TrendingDown, PieChart, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function DashboardKeuangan() {
  const [stats, setStats] = useState({
    totalAnggaran: 0,
    totalRealisasi: 0,
    sisaAnggaran: 0,
    totalTransaksi: 0,
  });
  
  const [realisasiDana, setRealisasiDana] = useState<any[]>([]);
  const [realisasiRekening, setRealisasiRekening] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // 1. Ambil Data Referensi
      const { data: rkamDetail } = await supabase.schema("keuangan").from("rkam_detail").select("*");
      const { data: pengeluaran } = await supabase.schema("keuangan").from("pengeluaran").select("*");
      const { data: sumberDana } = await supabase.schema("keuangan").from("sumber_dana").select("*");
      const { data: rekening } = await supabase.schema("keuangan").from("rekening_anggaran").select("*");

      // 2. Hitung Total Keseluruhan
      const totalPagu = rkamDetail?.reduce((sum, item) => sum + item.pagu_anggaran, 0) || 0;
      const totalReal = pengeluaran?.reduce((sum, item) => sum + item.nominal, 0) || 0;
      
      setStats({
        totalAnggaran: totalPagu,
        totalRealisasi: totalReal,
        sisaAnggaran: totalPagu - totalReal,
        totalTransaksi: pengeluaran?.length || 0,
      });

      // 3. Hitung Realisasi Per Sumber Dana
      if (sumberDana) {
        const mappedDana = sumberDana.map(sd => {
          const pagu = rkamDetail?.filter(r => r.sumber_dana_id === sd.id).reduce((sum, r) => sum + r.pagu_anggaran, 0) || 0;
          const realisasi = pengeluaran?.filter(p => p.sumber_dana_id === sd.id).reduce((sum, p) => sum + p.nominal, 0) || 0;
          const persen = pagu > 0 ? (realisasi / pagu) * 100 : 0;
          return { nama: sd.nama_dana, pagu, realisasi, persen };
        }).filter(d => d.pagu > 0 || d.realisasi > 0); // Hanya tampilkan yang ada nominalnya
        setRealisasiDana(mappedDana);
      }

      // 4. Hitung Realisasi Per Rekening Anggaran (Top 5)
      if (rekening) {
        const mappedRekening = rekening.map(rek => {
          const pagu = rkamDetail?.filter(r => r.rekening_id === rek.id).reduce((sum, r) => sum + r.pagu_anggaran, 0) || 0;
          const realisasi = pengeluaran?.filter(p => p.rekening_anggaran_id === rek.id).reduce((sum, p) => sum + p.nominal, 0) || 0;
          const persen = pagu > 0 ? (realisasi / pagu) * 100 : 0;
          return { nama: `${rek.kode_rekening} - ${rek.nama_rekening}`, pagu, realisasi, persen };
        }).filter(r => r.pagu > 0 || r.realisasi > 0).sort((a, b) => b.realisasi - a.realisasi).slice(0, 5); // Ambil 5 terbesar
        setRealisasiRekening(mappedRekening);
      }

      setLoading(false);
    }

    loadStats();
  }, []);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  const getProgressColor = (persen: number) => {
    if (persen > 100) return "bg-red-500"; // Overbudget
    if (persen > 80) return "bg-yellow-500"; // Hampir habis
    return "bg-green-500"; // Aman
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Keuangan</h1>
          <p className="text-slate-500 text-sm mt-1">Evaluasi Rencana Anggaran (RKAM) vs Realisasi Belanja.</p>
        </div>
        <Link href="/keuangan/rkam" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm text-sm">
          <FileText size={16} /> Kelola RKAM
        </Link>
      </div>

      {loading ? <p className="text-slate-500">Memuat data...</p> : (
        <>
          {/* KARTU RINGKASAN ATAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Pagu Anggaran</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{formatRupiah(stats.totalAnggaran)}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Wallet size={20} /></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Realisasi</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{formatRupiah(stats.totalRealisasi)}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><TrendingDown size={20} /></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sisa Anggaran</p>
                  <p className={`text-2xl font-bold mt-2 ${stats.sisaAnggaran < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatRupiah(stats.sisaAnggaran)}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-green-600"><TrendingUp size={20} /></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Transaksi</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{stats.totalTransaksi}</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><CheckCircle2 size={20} /></div>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRAFIK PER SUMBER DANA */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChart size={20} className="text-blue-600" /> Realisasi Per Sumber Dana</h2>
              <div className="space-y-5">
                {realisasiDana.length === 0 ? <p className="text-sm text-slate-400 italic">Belum ada data RKAM / Pengeluaran.</p> : null}
                {realisasiDana.map((d, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">{d.nama}</span>
                      <span className="text-slate-500">{formatRupiah(d.realisasi)} / {formatRupiah(d.pagu)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${getProgressColor(d.persen)}`} style={{ width: `${Math.min(d.persen, 100)}%` }}></div>
                    </div>
                    {d.persen > 100 && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> Melebihi pagu anggaran!</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* GRAFIK PER REKENING ANGGARAN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><FileText size={20} className="text-blue-600" /> Top 5 Realisasi Rekening</h2>
              <div className="space-y-5">
                {realisasiRekening.length === 0 ? <p className="text-sm text-slate-400 italic">Belum ada data RKAM / Pengeluaran.</p> : null}
                {realisasiRekening.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700 truncate pr-2" title={r.nama}>{r.nama}</span>
                      <span className="text-slate-500 shrink-0">{formatRupiah(r.realisasi)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${getProgressColor(r.persen)}`} style={{ width: `${Math.min(r.persen, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}