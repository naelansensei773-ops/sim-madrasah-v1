"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Search, PiggyBank, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ListTabunganPage() {
  const router = useRouter();
  const [dataSiswa, setDataSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);
    // 1. Ambil data siswa
    const { data: siswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis, rombel(nama_rombel)").eq("status_siswa", "Aktif").order("nama_lengkap");
    
    // 2. Ambil semua transaksi tabungan
    const { data: transaksi } = await supabase.schema("keuangan").from("transaksi_tabungan").select("*");

    if (siswa) {
      const merged = siswa.map(s => {
        const trxSiswa = transaksi?.filter(t => t.siswa_id === s.id) || [];
        const totalSetor = trxSiswa.filter(t => t.tipe === 'Setor').reduce((sum, t) => sum + t.nominal, 0);
        const totalTarik = trxSiswa.filter(t => t.tipe === 'Tarik').reduce((sum, t) => sum + t.nominal, 0);
        
        return {
          ...s,
          saldo: totalSetor - totalTarik
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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tabungan Siswa (Bank Mini)</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau saldo dan riwayat tabungan siswa.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cari nama siswa atau NIS..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : dataSiswa.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <PiggyBank size={48} className="text-slate-300 mb-3" />
            <p>Tidak ada data siswa ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Kelas / Rombel</th>
                  <th className="px-6 py-4 text-right">Saldo Tabungan</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataSiswa.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{s.nama_lengkap}</p>
                      <p className="text-xs text-slate-500">NIS: {s.nis || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{s.rombel?.nama_rombel || "-"}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-700">{formatRupiah(s.saldo)}</td>
                    <td className="px-6 py-4 text-center">
                      <Link href={`/keuangan/tabungan/${s.id}`} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                        <Eye size={14} /> Buka Buku Tabungan
                      </Link>
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