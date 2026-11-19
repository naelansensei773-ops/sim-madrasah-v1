"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Printer, ArrowDownLeft, ArrowUpRight } from "lucide-react";

function DetailTabunganContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // ID Siswa

  const [siswa, setSiswa] = useState<any>(null);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Transaksi
  const [tipe, setTipe] = useState("Setor");
  const [nominal, setNominal] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function loadData() {
    setLoading(true);
    // 1. Ambil data siswa
    const { data: s } = await supabase.schema("master").from("siswa").select("*, rombel(nama_rombel)").eq("id", id).single();
    setSiswa(s);

    // 2. Ambil transaksi (urutkan dari terlama ke terbaru untuk saldo berjalan)
    const { data: t } = await supabase.schema("keuangan").from("transaksi_tabungan").select("*").eq("siswa_id", id).order("tanggal", { ascending: true }).order("created_at", { ascending: true });
    
    if (t) {
      let saldoBerjalan = 0;
      const processed = t.map(trx => {
        if (trx.tipe === 'Setor') saldoBerjalan += trx.nominal;
        else saldoBerjalan -= trx.nominal;
        return { ...trx, saldoBerjalan };
      });
      // Balik urutan untuk tampilan (terbaru di atas)
      setTransaksi(processed.reverse());
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    setTanggal(new Date().toISOString().split("T")[0]);
  }, [id]);

  async function handleSimpanTransaksi(e: React.FormEvent) {
    e.preventDefault();
    if (!nominal || nominal <= 0) return alert("Nominal harus lebih dari 0!");
    
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("transaksi_tabungan").insert([{
      siswa_id: id,
      tipe: tipe,
      nominal: Number(nominal),
      keterangan: keterangan,
      tanggal: tanggal
    }]);

    setSedangSimpan(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else {
      setNominal("");
      setKeterangan("");
      loadData(); // Refresh data
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat buku tabungan...</div>;
  if (!siswa) return <div className="p-10 text-center text-red-500">Siswa tidak ditemukan.</div>;

  const saldoAkhir = transaksi.length > 0 ? transaksi[0].saldoBerjalan : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER (Sembunyi saat print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Buku Tabungan</h1>
            <p className="text-slate-500 text-sm mt-1">{siswa.nama_lengkap} ({siswa.rombel?.nama_rombel})</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors">
          <Printer size={18} /> Cetak Buku
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KOLOM KIRI: FORM TRANSAKSI */}
        <div className="md:col-span-1 print:hidden">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Transaksi Baru</h2>
            
            <div className={`p-4 rounded-xl text-center mb-5 border ${tipe === 'Setor' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase">Saldo Saat Ini</p>
              <p className={`text-2xl font-black ${tipe === 'Setor' ? 'text-green-700' : 'text-red-700'}`}>{formatRupiah(saldoAkhir)}</p>
            </div>

            <form onSubmit={handleSimpanTransaksi} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jenis Transaksi</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold" value={tipe} onChange={(e) => setTipe(e.target.value)}>
                  <option value="Setor">Setor Tunai (Masuk)</option>
                  <option value="Tarik">Tarik Tunai (Keluar)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold" placeholder="Cth: 50000" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan (Opsional)</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Cth: Nabung mingguan" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
              <button type="submit" disabled={sedangSimpan} className={`w-full inline-flex justify-center items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${tipe === 'Setor' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                <Save size={18} /> {sedangSimpan ? "Menyimpan..." : `Proses ${tipe}`}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: BUKU MUTASI (Tampil juga saat print) */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0">
            
            {/* Kop Buku Tabungan */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
              <h1 className="text-2xl font-bold uppercase tracking-widest">Buku Tabungan Siswa</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Nama Siswa</p>
                <p className="font-bold text-base">{siswa.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-gray-500">Kelas / NIS</p>
                <p className="font-semibold">{siswa.rombel?.nama_rombel || "-"} / {siswa.nis}</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-center w-28">Tanggal</th>
                  <th className="border border-black p-2 text-left">Keterangan</th>
                  <th className="border border-black p-2 text-right">Setor</th>
                  <th className="border border-black p-2 text-right">Tarik</th>
                  <th className="border border-black p-2 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.length === 0 ? (
                  <tr><td colSpan={5} className="border border-black p-4 text-center italic text-gray-500">Belum ada transaksi.</td></tr>
                ) : (
                  transaksi.map((trx, i) => (
                    <tr key={i}>
                      <td className="border border-black p-2 text-center">{trx.tanggal}</td>
                      <td className="border border-black p-2">{trx.keterangan || "-"}</td>
                      <td className="border border-black p-2 text-right text-green-700 font-semibold">{trx.tipe === 'Setor' ? formatRupiah(trx.nominal) : "-"}</td>
                      <td className="border border-black p-2 text-right text-red-700 font-semibold">{trx.tipe === 'Tarik' ? formatRupiah(trx.nominal) : "-"}</td>
                      <td className="border border-black p-2 text-right font-bold">{formatRupiah(trx.saldoBerjalan)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={4} className="border border-black p-2 text-right uppercase">Saldo Akhir Tabungan</td>
                  <td className="border border-black p-2 text-right text-blue-800">{formatRupiah(saldoAkhir)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="mt-8 text-xs text-gray-500 print:hidden flex items-center gap-2">
              <ArrowDownLeft size={14} className="text-green-600"/> Setor menambah saldo.
              <ArrowUpRight size={14} className="text-red-600"/> Tarik mengurangi saldo.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DetailTabungan() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat halaman...</div>}>
      <DetailTabunganContent />
    </Suspense>
  );
}