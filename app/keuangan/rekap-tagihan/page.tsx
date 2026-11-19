"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, ArrowLeft, CheckCircle2, XCircle, Printer } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RekapTagihanPage() {
  const router = useRouter();
  const [dataSiswa, setDataSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);

    const { data: siswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis, rombel(nama_rombel)").eq("status_siswa", "Aktif").order("nama_lengkap");
    const { data: tagihanSiswa } = await supabase.schema("keuangan").from("tagihan_siswa").select("*, master_tagihan(nama_tagihan)");
    const { data: pembayaranTagihan } = await supabase.schema("keuangan").from("pembayaran_tagihan").select("*");
    const { data: pembayaranSpp } = await supabase.schema("keuangan").from("pembayaran_spp").select("*");

    if (siswa) {
      const merged = siswa.map((s) => {
        const sppDibayar = pembayaranSpp?.filter(p => p.siswa_id === s.id).reduce((sum, p) => sum + p.nominal, 0) || 0;
        const tagihanNonSpp = tagihanSiswa?.filter(t => t.siswa_id === s.id) || [];
        const totalTagihanNonSpp = tagihanNonSpp.reduce((sum, t) => sum + t.nominal_tagihan, 0);

        let totalDibayarNonSpp = 0;
        tagihanNonSpp.forEach(t => {
          const bayar = pembayaranTagihan?.filter(p => p.tagihan_siswa_id === t.id).reduce((sum, p) => sum + p.nominal_bayar, 0) || 0;
          totalDibayarNonSpp += bayar;
        });

        return {
          ...s,
          totalSppDibayar: sppDibayar,
          totalTagihan: totalTagihanNonSpp,
          totalDibayarTagihan: totalDibayarNonSpp,
          sisaTagihan: totalTagihanNonSpp - totalDibayarNonSpp,
        };
      });

      let filtered = merged;
      if (keyword.trim() !== "") {
        filtered = merged.filter(s => s.nama_lengkap.toLowerCase().includes(keyword.toLowerCase()) || s.nis?.includes(keyword));
      }

      setDataSiswa(filtered);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword]);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap Tagihan Siswa (Buku Besar)</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau total pembayaran dan sisa tagihan seluruh siswa.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none" placeholder="Cari nama siswa atau NIS..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Total Bayar SPP</th>
                  <th className="px-6 py-4">Total Tagihan Lain</th>
                  <th className="px-6 py-4">Sudah Dibayar</th>
                  <th className="px-6 py-4">Sisa Tagihan</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataSiswa.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{s.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">{s.nis} | {s.rombel?.nama_rombel || "-"}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatRupiah(s.totalSppDibayar)}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatRupiah(s.totalTagihan)}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">{formatRupiah(s.totalDibayarTagihan)}</td>
                    <td className={`px-6 py-4 font-bold ${s.sisaTagihan > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {formatRupiah(s.sisaTagihan)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {s.sisaTagihan > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle size={12} /> Belum Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 size={12} /> Lunas
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* TOMBOL CETAK TAGIHAN BARU */}
                      <Link href={`/keuangan/rekap-tagihan/cetak/${s.id}`} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                        <Printer size={14} /> Cetak Tagihan
                      </Link>
                    </td>
                  </tr>
                ))}
                {dataSiswa.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-400">Tidak ada data siswa yang ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}