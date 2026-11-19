"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Printer, ArrowLeft } from "lucide-react";

function CetakSlipContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const guruId = params.id as string;
  const bulan = searchParams.get("bulan") || "";
  const tahun = searchParams.get("tahun") || "";
  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: guru } = await supabase.schema("master").from("guru").select("nama_lengkap, nuptk").eq("id", guruId).single();
      
      const { data: slip } = await supabase.schema("keuangan").from("slip_gaji")
        .select("*")
        .eq("guru_id", guruId)
        .eq("bulan", namaBulan[Number(bulan) - 1])
        .eq("tahun", tahun)
        .single();

      if (guru && slip) setData({ guru, slip });
      setLoading(false);
    }
    if (guruId && bulan && tahun) fetchData();
  }, [guruId, bulan, tahun]);

  if (loading) return <div className="p-10 text-center">Memuat slip...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Data slip gaji tidak ditemukan.</div>;

  const { guru, slip } = data;
  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm"><Printer size={18} /> Cetak Slip</button>
      </div>

      <div className="bg-white border-2 border-black p-8 print:border-none print:p-0">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Slip Gaji Guru</h1>
          <p className="font-semibold mt-1">Periode: {slip.bulan} {slip.tahun}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Nama Guru</p>
            <p className="font-bold text-lg">{guru.nama_lengkap}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">NUPTK</p>
            <p className="font-semibold">{guru.nuptk || "-"}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left">Pendapatan</th>
              <th className="border border-black p-2 text-right w-32">Nominal</th>
              <th className="border border-black p-2 text-left w-1/3">Potongan</th>
              <th className="border border-black p-2 text-right w-32">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {/* Looping Pendapatan dan Potongan secara bersamaan (Side by Side) */}
            {Array.from({ length: Math.max(slip.rincian_pendapatan?.length || 0, slip.rincian_potongan?.length || 0) }).map((_, i) => {
              const pend = slip.rincian_pendapatan?.[i];
              const pot = slip.rincian_potongan?.[i];
              return (
                <tr key={i}>
                  <td className="border border-black p-2">{pend ? pend.nama : ""}</td>
                  <td className="border border-black p-2 text-right">{pend ? formatRupiah(pend.nominal) : ""}</td>
                  <td className="border border-black p-2">{pot ? pot.nama : ""}</td>
                  <td className="border border-black p-2 text-right text-red-600">{pot ? formatRupiah(pot.nominal) : ""}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black p-2 text-right uppercase">Total Pendapatan</td>
              <td className="border border-black p-2 text-right">{formatRupiah(slip.total_pendapatan)}</td>
              <td className="border border-black p-2 text-right uppercase">Total Potongan</td>
              <td className="border border-black p-2 text-right text-red-600">{formatRupiah(slip.total_potongan)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="bg-blue-50 border border-black p-4 text-center mb-8">
          <p className="text-sm font-semibold uppercase">Gaji Bersih Diterima</p>
          <p className="text-3xl font-black text-blue-800">{formatRupiah(slip.gaji_bersih)}</p>
        </div>

        <div className="flex justify-between text-sm mt-12">
          <div className="text-center">
            <p>Tanggal: {slip.tanggal_bayar}</p>
            <p>Penerima,</p>
            <div className="h-20"></div>
            <p className="font-bold underline">(...........................................)</p>
          </div>
          <div className="text-center">
            <p>Bendahara,</p>
            <div className="h-20"></div>
            <p className="font-bold underline">(...........................................)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CetakSlipGaji() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat halaman...</div>}>
      <CetakSlipContent />
    </Suspense>
  );
}