"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RekapSppPage() {
  const router = useRouter();
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [rombelId, setRombelId] = useState("");
  const [bulan, setBulan] = useState("Juli");
  const [tahun, setTahun] = useState("2026");
  const [dataRekap, setDataRekap] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRombel() {
      const { data } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (data) setDaftarRombel(data);
    }
    fetchRombel();
  }, []);

  async function handleRekap() {
    if (!rombelId) return alert("Pilih kelas terlebih dahulu");
    setLoading(true);

    const { data: tarifData } = await supabase.schema("keuangan").from("tarif_spp").select("nominal").eq("rombel_id", rombelId).single();
    const nominalTarif = tarifData ? tarifData.nominal : 0;

    const { data: siswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis").eq("rombel_id", rombelId).eq("status_siswa", "Aktif").order("nama_lengkap");
    const { data: pembayaran } = await supabase.schema("keuangan").from("pembayaran_spp").select("siswa_id, nominal").eq("bulan", bulan).eq("tahun", tahun);

    if (siswa) {
      const merged = siswa.map(s => {
        const totalBayar = (pembayaran || []).filter(p => p.siswa_id === s.id).reduce((sum, p) => sum + p.nominal, 0);
        const sisa = nominalTarif - totalBayar;
        return {
          ...s,
          tagihan: nominalTarif,
          dibayar: totalBayar,
          sisa: sisa < 0 ? 0 : sisa,
          status: sisa <= 0 ? "Lunas" : (totalBayar > 0 ? "Cicil" : "Belum Bayar")
        };
      });
      setDataRekap(merged);
    }
    setLoading(false);
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekap SPP per Kelas</h1>
          <p className="text-slate-500 text-sm mt-1">Pantau status pembayaran siswa per bulan.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Rombel</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
            <option value="">-- Pilih Kelas --</option>
            {daftarRombel.map(r => <option key={r.id} value={r.id}>{r.nama_rombel}</option>)}
          </select>
        </div>
        <div className="w-full md:w-32">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Bulan</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm" value={bulan} onChange={(e) => setBulan(e.target.value)}>
            {["Juli", "Agustus", "September", "Oktober", "November", "Desember", "Januari", "Februari", "Maret", "April", "Mei", "Juni"].map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="w-full md:w-32">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun</label>
          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={tahun} onChange={(e) => setTahun(e.target.value)} />
        </div>
        <button onClick={handleRekap} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
          Tampilkan
        </button>
      </div>

      {loading ? <p className="text-center text-slate-500">Memuat data...</p> : dataRekap.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">Tagihan</th>
                <th className="px-6 py-4">Dibayar</th>
                <th className="px-6 py-4">Sisa</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataRekap.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80">
                  <td className="px-6 py-4 font-medium text-slate-900">{row.nama_lengkap}</td>
                  <td className="px-6 py-4">{formatRupiah(row.tagihan)}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">{formatRupiah(row.dibayar)}</td>
                  <td className="px-6 py-4 text-red-600 font-semibold">{formatRupiah(row.sisa)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      row.status === 'Lunas' ? 'bg-green-100 text-green-800' : row.status === 'Cicil' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}