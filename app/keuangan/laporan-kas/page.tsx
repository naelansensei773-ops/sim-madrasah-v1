"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Printer, ArrowLeft, Search, Landmark, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LaporanKasPage() {
  const router = useRouter();
  
  const [bulan, setBulan] = useState("07"); // Default Juli
  const [tahun, setTahun] = useState("2024");
  const [loading, setLoading] = useState(false);
  
  const [dataKas, setDataKas] = useState<any[]>([]);
  const [totalMasuk, setTotalMasuk] = useState(0);
  const [totalKeluar, setTotalKeluar] = useState(0);
  const [saldoAkhir, setSaldoAkhir] = useState(0);

  useEffect(() => {
    // Set default bulan dan tahun ke bulan saat ini
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentYear = String(today.getFullYear());
    setBulan(currentMonth);
    setTahun(currentYear);
  }, []);

  async function handleTampilkan() {
    if (!bulan || !tahun) return alert("Pilih bulan dan tahun!");
    setLoading(true);

    const startDate = `${tahun}-${bulan}-01`;
    // Cari tanggal terakhir di bulan tersebut
    const lastDay = new Date(Number(tahun), Number(bulan), 0).getDate();
    const endDate = `${tahun}-${bulan}-${lastDay}`;

    try {
      // 1. Ambil data Sumber Dana (untuk mapping nama)
      const { data: sumberDana } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana");

      // 2. Ambil Penerimaan Dana (BOS/BOSDA)
      const { data: penerimaan } = await supabase.schema("keuangan").from("penerimaan_dana")
        .select("*").gte("tanggal", startDate).lte("tanggal", endDate);

      // 3. Ambil Pembayaran SPP
      const { data: spp } = await supabase.schema("keuangan").from("pembayaran_spp")
        .select("*").gte("tanggal_bayar", startDate).lte("tanggal_bayar", endDate);

      // 4. Ambil Pembayaran Tagihan (Uang Gedung/Seragam)
      const { data: tagihan } = await supabase.schema("keuangan").from("pembayaran_tagihan")
        .select("*, tagihan_siswa(master_tagihan(nama_tagihan))")
        .gte("tanggal_bayar", startDate).lte("tanggal_bayar", endDate);

      // 5. Ambil Pengeluaran
      const { data: pengeluaran } = await supabase.schema("keuangan").from("pengeluaran")
        .select("*").gte("tanggal", startDate).lte("tanggal", endDate);

      // PROSES GABUNGKAN DATA (MAPPING)
      const jurnal: any[] = [];

      // Masukkan Penerimaan
      penerimaan?.forEach(p => {
        jurnal.push({
          tanggal: p.tanggal,
          tipe: "Masuk",
          keterangan: p.keterangan || "Penerimaan Dana",
          sumber: sumberDana?.find(s => s.id === p.sumber_dana_id)?.nama_dana || "BOS",
          nominal: p.nominal
        });
      });

      // Masukkan SPP
      spp?.forEach(p => {
        jurnal.push({
          tanggal: p.tanggal_bayar,
          tipe: "Masuk",
          keterangan: `Pembayaran SPP Bulan ${p.bulan} ${p.tahun}`,
          sumber: "SPP",
          nominal: p.nominal
        });
      });

      // Masukkan Tagihan Lain
      tagihan?.forEach(p => {
        jurnal.push({
          tanggal: p.tanggal_bayar,
          tipe: "Masuk",
          keterangan: `Pembayaran ${(p as any).tagihan_siswa?.master_tagihan?.nama_tagihan || "Tagihan"}`,
          sumber: "Tagihan Siswa",
          nominal: p.nominal_bayar
        });
      });

      // Masukkan Pengeluaran
      pengeluaran?.forEach(p => {
        jurnal.push({
          tanggal: p.tanggal,
          tipe: "Keluar",
          keterangan: p.keterangan,
          sumber: sumberDana?.find(s => s.id === p.sumber_dana_id)?.nama_dana || "Lainnya",
          nominal: p.nominal
        });
      });

      // Urutkan berdasarkan tanggal
      jurnal.sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

      // Hitung Total dan Saldo Berjalan
      let masuk = 0;
      let keluar = 0;
      let saldo = 0;

      const finalJurnal = jurnal.map(j => {
        if (j.tipe === "Masuk") {
          masuk += j.nominal;
          saldo += j.nominal;
        } else {
          keluar += j.nominal;
          saldo -= j.nominal;
        }
        return { ...j, saldoBerjalan: saldo };
      });

      setDataKas(finalJurnal);
      setTotalMasuk(masuk);
      setTotalKeluar(keluar);
      setSaldoAkhir(saldo);
    } catch (error: any) {
      alert("Gagal memuat data: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  
  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER & FILTER (Sembunyi saat print) */}
      <div className="flex items-center gap-4 mb-6 print:hidden">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Buku Kas Umum</h1>
            <p className="text-slate-500 text-sm mt-1">Laporan arus kas masuk dan keluar per bulan.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end print:hidden">
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
        <button onClick={handleTampilkan} disabled={loading} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
          {loading ? "Memuat..." : "Tampilkan Laporan"}
        </button>
        {dataKas.length > 0 && (
          <button onClick={() => window.print()} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
            <Printer size={16} /> Cetak PDF
          </button>
        )}
      </div>

      {/* KERTAS LAPORAN */}
      {dataKas.length > 0 && (
        <div className="bg-white p-8 border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-0">
          
          {/* Kop Laporan */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
            <h1 className="text-2xl font-bold uppercase tracking-widest">Buku Kas Umum</h1>
            <p className="text-gray-600 mt-1">Periode: {namaBulan[Number(bulan) - 1]} {tahun}</p>
          </div>

          {/* Ringkasan Saldo */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-black p-3 text-center">
              <p className="text-xs font-bold uppercase text-gray-500">Total Pemasukan</p>
              <p className="text-lg font-bold text-green-700">{formatRupiah(totalMasuk)}</p>
            </div>
            <div className="border border-black p-3 text-center">
              <p className="text-xs font-bold uppercase text-gray-500">Total Pengeluaran</p>
              <p className="text-lg font-bold text-red-700">{formatRupiah(totalKeluar)}</p>
            </div>
            <div className="border border-black p-3 text-center bg-gray-50">
              <p className="text-xs font-bold uppercase text-gray-500">Saldo Akhir</p>
              <p className="text-lg font-black text-blue-800">{formatRupiah(saldoAkhir)}</p>
            </div>
          </div>

          {/* Tabel Jurnal */}
          <table className="w-full border-collapse border border-black text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-center w-12">No</th>
                <th className="border border-black p-2 text-center w-28">Tanggal</th>
                <th className="border border-black p-2 text-left">Keterangan</th>
                <th className="border border-black p-2 text-center">Sumber Dana</th>
                <th className="border border-black p-2 text-right">Pemasukan</th>
                <th className="border border-black p-2 text-right">Pengeluaran</th>
                <th className="border border-black p-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {dataKas.map((row, i) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2 text-center">{row.tanggal}</td>
                  <td className="border border-black p-2">{row.keterangan}</td>
                  <td className="border border-black p-2 text-center text-xs">{row.sumber}</td>
                  <td className="border border-black p-2 text-right text-green-700">{row.tipe === 'Masuk' ? formatRupiah(row.nominal) : '-'}</td>
                  <td className="border border-black p-2 text-right text-red-700">{row.tipe === 'Keluar' ? formatRupiah(row.nominal) : '-'}</td>
                  <td className="border border-black p-2 text-right font-semibold">{formatRupiah(row.saldoBerjalan)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={4} className="border border-black p-2 text-right uppercase">Total</td>
                <td className="border border-black p-2 text-right text-green-700">{formatRupiah(totalMasuk)}</td>
                <td className="border border-black p-2 text-right text-red-700">{formatRupiah(totalKeluar)}</td>
                <td className="border border-black p-2 text-right text-blue-800">{formatRupiah(saldoAkhir)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Tanda Tangan */}
          <div className="mt-12 flex justify-between text-sm">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p>Kepala Madrasah</p>
              <div className="h-20"></div>
              <p className="font-bold underline">(...........................................)</p>
            </div>
            <div className="text-center">
              <p>Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
              <p>Bendahara,</p>
              <div className="h-20"></div>
              <p className="font-bold underline">(...........................................)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}