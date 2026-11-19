"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Printer, ArrowLeft } from "lucide-react";

function KwitansiContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [pembayaran, setPembayaran] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: pay } = await supabase.schema("keuangan").from("pembayaran_spp").select("*").eq("id", id).single();
      if (pay) {
        const { data: siswa } = await supabase.schema("master").from("siswa").select("nama_lengkap, nis, rombel(nama_rombel)").eq("id", pay.siswa_id).single();
        setPembayaran({ ...pay, siswa });
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <p className="p-10 text-center">Memuat...</p>;
  if (!pembayaran) return <p className="p-10 text-center text-red-500">Data tidak ditemukan.</p>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ArrowLeft size={20} />
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Printer size={18} /> Cetak Kwitansi
        </button>
      </div>

      <div className="bg-white border-2 border-black p-8 print:border-none print:p-0">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Kwitansi Pembayaran SPP</h1>
        </div>
        
        <div className="space-y-3 text-lg">
          <div className="flex"><span className="w-40 font-semibold">Telah Diterima Dari</span><span className="w-4">:</span><span>{pembayaran.siswa?.nama_lengkap}</span></div>
          <div className="flex"><span className="w-40 font-semibold">NIS / Kelas</span><span className="w-4">:</span><span>{pembayaran.siswa?.nis} / {pembayaran.siswa?.rombel?.nama_rombel}</span></div>
          <div className="flex"><span className="w-40 font-semibold">Uang Sejumlah</span><span className="w-4">:</span><span className="font-bold border-b border-black">Rp {pembayaran.nominal.toLocaleString('id-ID')}</span></div>
          <div className="flex"><span className="w-40 font-semibold">Untuk Pembayaran</span><span className="w-4">:</span><span>SPP Bulan {pembayaran.bulan} {pembayaran.tahun}</span></div>
          <div className="flex"><span className="w-40 font-semibold">Metode</span><span className="w-4">:</span><span>{pembayaran.metode_bayar}</span></div>
        </div>

        <div className="mt-16 flex justify-between">
          <div className="text-center">
            <p>Tanggal: {pembayaran.tanggal_bayar}</p>
          </div>
          <div className="text-center">
            <p>Bendahara,</p>
            <div className="h-24"></div>
            <p className="font-bold underline">(...........................................)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function KwitansiPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center">Memuat halaman...</p>}>
      <KwitansiContent />
    </Suspense>
  );
}