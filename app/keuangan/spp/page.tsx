"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Wallet, Search, Receipt, Printer, List } from "lucide-react";

export default function SppPage() {
  const [pembayaran, setPembayaran] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);
    const { data: dataPembayaran, error } = await supabase.schema("keuangan").from("pembayaran_spp").select("*").order("created_at", { ascending: false });
    const { data: dataSiswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis");

    if (error) {
      alert("Gagal memuat data: " + error.message);
    } else {
      let mergedData = (dataPembayaran || []).map((p) => {
        const siswa = dataSiswa?.find((s) => s.id === p.siswa_id);
        return { ...p, siswa: siswa || null };
      });

      if (keyword.trim() !== "") {
        mergedData = mergedData.filter((p) => p.siswa?.nama_lengkap?.toLowerCase().includes(keyword.toLowerCase()) || p.siswa?.nis?.includes(keyword));
      }
      setPembayaran(mergedData);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword]);

  async function hapusPembayaran(id: string) {
    if (!confirm("Yakin ingin menghapus catatan pembayaran ini?")) return;
    const { error } = await supabase.schema("keuangan").from("pembayaran_spp").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pembayaran SPP</h1>
          <p className="text-slate-500 text-sm mt-1">Catatan penerimaan uang SPP siswa.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/keuangan/spp/rekap" className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <List size={18} /> Rekap Kelas
          </Link>
          <Link href="/keuangan/spp/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus size={18} /> Input Pembayaran
          </Link>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none" placeholder="Cari nama siswa atau NIS..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : pembayaran.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Wallet size={48} className="text-slate-300 mb-3" />
            <p>Belum ada catatan pembayaran SPP.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Nama Siswa</th>
                  <th className="px-6 py-4">Pembayaran</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4">Metode</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pembayaran.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{row.tanggal_bayar}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{row.siswa?.nama_lengkap || "Dihapus"}</p>
                      <p className="text-xs text-slate-500">NIS: {row.siswa?.nis || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                        <Receipt size={14} /> {row.bulan} {row.tahun}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-600">{formatRupiah(row.nominal)}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600">{row.metode_bayar || "Tunai"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/keuangan/spp/kwitansi/${row.id}`} className="text-slate-500 hover:text-blue-600 transition-colors" title="Cetak Kwitansi">
                          <Printer size={18} />
                        </Link>
                        <button onClick={() => hapusPembayaran(row.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
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