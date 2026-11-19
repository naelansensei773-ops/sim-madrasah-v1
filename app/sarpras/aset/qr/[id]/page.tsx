"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Printer } from "lucide-react";

function QRAsetContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [aset, setAset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.schema("sarpras").from("aset").select("*").eq("id", id).single();
      if (data) setAset(data);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  if (!aset) return <div className="p-10 text-center text-red-500">Aset tidak ditemukan.</div>;

  // URL yang akan dibuka saat QR Code di-scan
  // (Catatan: Saat aplikasi sudah di-deploy, ganti http://localhost:3000 dengan domain asli Anda)
  const scanUrl = `http://localhost:3000/sarpras/aset/detail/${id}`;

  return (
    <div className="max-w-xl mx-auto p-4 md:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">QR Code Aset</h1>
            <p className="text-slate-500 text-sm mt-1">Cetak dan tempelkan pada barang.</p>
          </div>
        </div>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Printer size={18} /> Cetak QR
        </button>
      </div>

      {/* KERTAS QR CODE */}
      <div ref={printRef} className="bg-white border-2 border-slate-300 p-8 rounded-xl print:border-none print:shadow-none flex flex-col items-center text-center mx-auto max-w-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-1">INVENTARIS MADRASAH</h2>
        <p className="text-sm text-slate-500 mb-6 border-b pb-2 w-full">Sistem Informasi Sarpras</p>
        
        {/* Kotak QR Code */}
        <div className="bg-white p-4 border border-slate-200 rounded-lg mb-4 shadow-sm">
          <QRCodeSVG value={scanUrl} size={200} level="H" includeMargin={true} />
        </div>

        <h3 className="font-bold text-lg text-slate-900 mt-2">{aset.nama_aset}</h3>
        <p className="text-sm font-semibold text-blue-600 mb-1">{aset.nomor_inventaris || aset.kode_aset}</p>
        <p className="text-xs text-slate-500">Kategori: {aset.kategori}</p>
        <p className="text-xs text-slate-500 mt-2 italic">Scan untuk melihat detail</p>
      </div>
      
      <div className="mt-4 text-center text-xs text-slate-400 print:hidden">
        *Pastikan Anda sudah membuat halaman <code className="bg-slate-100 p-1 rounded">/sarpras/aset/detail/[id]</code> agar saat di-scan menampilkan data.
      </div>
    </div>
  );
}

export default function QRAsetPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <QRAsetContent />
    </Suspense>
  );
}