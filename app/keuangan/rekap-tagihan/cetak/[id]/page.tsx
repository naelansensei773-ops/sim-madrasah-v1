"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Printer, ArrowLeft, Send } from "lucide-react";

function CetakTagihanContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [siswa, setSiswa] = useState<any>(null);
  const [tagihan, setTagihan] = useState<any[]>([]);
  const [pembayaran, setPembayaran] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: s } = await supabase.schema("master").from("siswa").select("*, rombel(nama_rombel)").eq("id", id).single();
      setSiswa(s);

      // Ambil master_tagihan untuk mendapatkan batas_waktu
      const { data: t } = await supabase.schema("keuangan").from("tagihan_siswa").select("*, master_tagihan(nama_tagihan, batas_waktu)").eq("siswa_id", id);
      setTagihan(t || []);

      const { data: p } = await supabase.schema("keuangan").from("pembayaran_tagihan").select("*");
      setPembayaran(p || []);

      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  if (!siswa) return <div className="p-10 text-center text-red-500">Siswa tidak ditemukan.</div>;

  const tagihanWithSisa = tagihan.map(t => {
    const dibayar = pembayaran.filter(p => p.tagihan_siswa_id === t.id).reduce((sum, p) => sum + p.nominal_bayar, 0);
    const sisa = t.nominal_tagihan - dibayar;
    return { ...t, dibayar, sisa };
  }).filter(t => t.sisa > 0);

  const totalSisa = tagihanWithSisa.reduce((sum, t) => sum + t.sisa, 0);
  const batasWaktu = tagihanWithSisa[0]?.master_tagihan?.batas_waktu;

  const handlePrint = () => {
    window.print();
  };

  const kirimWa = () => {
    // Link unik menuju halaman publik siswa
    // CATATAN: Jika sudah di-hosting, ganti localhost dengan domain asli (contoh: https://simsekolah.com)
    const linkPublik = `${window.location.origin}/tagihan/${siswa.id}`;

    const text = `*SURAT PEMBERITAHUAN TAGIHAN*\n\nYth. Orang Tua/Wali dari *${siswa.nama_lengkap}*\nKelas: ${siswa.rombel?.nama_rombel || "-"}\n\nBersama ini kami sampaikan bahwa putra/putri Bapak/Ibu memiliki tagihan yang belum diselesaikan.\n\n*Total Sisa Tagihan: Rp ${totalSisa.toLocaleString('id-ID')}*\n${batasWaktu ? `*Batas Waktu Pembayaran: ${batasWaktu}*\n` : ''}\nUntuk melihat rincian lengkap tagihan dan mencetak surat pemberitahuan, silakan klik tautan berikut:\n${linkPublik}\n\nMohon segera melakukan pembayaran. Atas perhatiannya kami ucapkan terima kasih.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button onClick={kirimWa} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
            <Send size={18} /> Kirim ke WA
          </button>
          <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
            <Printer size={18} /> Cetak PDF
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-black p-8 print:border-none print:p-0">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
          <h1 className="text-2xl font-bold uppercase tracking-widest">Surat Pemberitahuan Tagihan</h1>
        </div>

        <div className="mb-6 space-y-2 text-sm md:text-base">
          <div className="flex"><span className="w-32 font-semibold">Nama Siswa</span><span className="w-4">:</span><span className="font-bold">{siswa.nama_lengkap}</span></div>
          <div className="flex"><span className="w-32 font-semibold">NIS</span><span className="w-4">:</span><span>{siswa.nis}</span></div>
          <div className="flex"><span className="w-32 font-semibold">Kelas</span><span className="w-4">:</span><span>{siswa.rombel?.nama_rombel || "-"}</span></div>
          <div className="flex"><span className="w-32 font-semibold">Batas Waktu</span><span className="w-4">:</span><span className="font-bold text-red-600">{batasWaktu || "-"}</span></div>
        </div>

        <p className="mb-4 text-sm md:text-base">Dengan hormat, berdasarkan data administrasi keuangan kami, berikut adalah rincian tagihan yang belum diselesaikan oleh putra/putri Bapak/Ibu:</p>

        <table className="w-full border-collapse border border-black text-sm mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black p-2 text-left w-12">No</th>
              <th className="border border-black p-2 text-left">Jenis Tagihan</th>
              <th className="border border-black p-2 text-right">Nominal</th>
              <th className="border border-black p-2 text-right">Dibayar</th>
              <th className="border border-black p-2 text-right">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {tagihanWithSisa.map((t, i) => (
              <tr key={t.id}>
                <td className="border border-black p-2 text-center">{i + 1}</td>
                <td className="border border-black p-2">{t.master_tagihan?.nama_tagihan}</td>
                <td className="border border-black p-2 text-right">Rp {t.nominal_tagihan.toLocaleString('id-ID')}</td>
                <td className="border border-black p-2 text-right">Rp {t.dibayar.toLocaleString('id-ID')}</td>
                <td className="border border-black p-2 text-right font-bold">Rp {t.sisa.toLocaleString('id-ID')}</td>
              </tr>
            ))}
            {tagihanWithSisa.length === 0 && (
              <tr><td colSpan={5} className="border border-black p-4 text-center italic text-green-600 font-semibold">Tidak ada tagihan yang tertunggak (Lunas).</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-100">
              <td colSpan={4} className="border border-black p-2 text-right font-bold uppercase">Total Sisa Tagihan</td>
              <td className="border border-black p-2 text-right font-bold text-red-600">Rp {totalSisa.toLocaleString('id-ID')}</td>
            </tr>
          </tfoot>
        </table>

        <p className="mb-8 text-sm md:text-base">Mohon untuk melakukan pembayaran ke Bendahara Madrasah sebelum batas waktu yang ditentukan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.</p>

        <div className="flex justify-end text-sm mt-16">
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

export default function CetakTagihanPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <CetakTagihanContent />
    </Suspense>
  );
}