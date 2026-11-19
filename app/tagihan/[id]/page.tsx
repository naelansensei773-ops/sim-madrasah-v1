"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Printer, Phone, CheckCircle2, AlertTriangle, CreditCard } from "lucide-react";

function HalamanTagihanPublicContent() {
  const params = useParams();
  const id = params.id as string;
  
  const [siswa, setSiswa] = useState<any>(null);
  const [tagihan, setTagihan] = useState<any[]>([]);
  const [rekening, setRekening] = useState<any[]>([]); // State untuk rekening bank
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: s } = await supabase.schema("master").from("siswa").select("*, rombel(nama_rombel)").eq("id", id).single();
      setSiswa(s);

      const { data: t } = await supabase.schema("keuangan").from("tagihan_siswa").select("*, master_tagihan(nama_tagihan, batas_waktu)").eq("siswa_id", id);
      const { data: p } = await supabase.schema("keuangan").from("pembayaran_tagihan").select("*");
      
      // Ambil data rekening bank
      const { data: r } = await supabase.schema("keuangan").from("rekening_bank").select("*").order("nama_bank");
      if (r) setRekening(r);

      if (t) {
        const processed = t.map(item => {
          const dibayar = p?.filter(bayar => bayar.tagihan_siswa_id === item.id).reduce((sum, bayar) => sum + bayar.nominal_bayar, 0) || 0;
          return { ...item, dibayar, sisa: item.nominal_tagihan - dibayar };
        }).filter(item => item.sisa > 0);
        setTagihan(processed);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat data tagihan...</div>;
  if (!siswa) return <div className="min-h-screen flex items-center justify-center text-red-500">Data siswa tidak ditemukan.</div>;

  const totalSisa = tagihan.reduce((sum, t) => sum + t.sisa, 0);
  const batasWaktu = tagihan[0]?.master_tagihan?.batas_waktu;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
          
          {/* Header */}
          <div className="bg-blue-800 p-6 text-white text-center">
            <h1 className="text-xl font-bold uppercase tracking-wider mb-1">Pemberitahuan Tagihan</h1>
            <p className="text-blue-200 text-sm">Madrasah Ibtidaiyah / Sekolah</p>
          </div>

          {/* Identitas */}
          <div className="p-6 border-b border-slate-100">
            <p className="text-slate-500 text-sm mb-1">Ditujukan kepada Orang Tua/Wali dari:</p>
            <h2 className="text-2xl font-bold text-slate-800">{siswa.nama_lengkap}</h2>
            <p className="text-slate-600 mt-1">NIS: {siswa.nis} | Kelas: {siswa.rombel?.nama_rombel || "-"}</p>
          </div>

          {/* Daftar Tagihan */}
          <div className="p-6">
            <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Rincian Tagihan Belum Dibayar</h3>
            <div className="space-y-4">
              {tagihan.map((t) => (
                <div key={t.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-700">{t.master_tagihan?.nama_tagihan}</p>
                    <p className="text-xs text-slate-500">Tagihan: Rp {t.nominal_tagihan.toLocaleString('id-ID')} | Dibayar: Rp {t.dibayar.toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-bold text-red-600">Rp {t.sisa.toLocaleString('id-ID')}</p>
                </div>
              ))}
              {tagihan.length === 0 && (
                <div className="text-center py-6 text-green-600 flex flex-col items-center">
                  <CheckCircle2 size={40} className="mb-2" />
                  <p className="font-bold">Alhamdulillah, tidak ada tagihan tertunggak.</p>
                </div>
              )}
            </div>
          </div>

          {/* Total & Deadline */}
          {tagihan.length > 0 && (
            <div className="bg-slate-50 p-6 border-t border-b border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-600 font-semibold">Total yang harus dibayar:</span>
                <span className="text-2xl font-bold text-red-600">Rp {totalSisa.toLocaleString('id-ID')}</span>
              </div>
              {batasWaktu && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <AlertTriangle size={20} />
                  <p className="text-sm font-medium">Mohon dilunasi sebelum tanggal: <strong>{batasWaktu}</strong></p>
                </div>
              )}
            </div>
          )}

          {/* Info Pembayaran & Rekening */}
          <div className="p-6 bg-white">
            <p className="text-sm text-slate-700 leading-relaxed text-center mb-4">
              Pembayaran dapat dilakukan secara tunai ke <strong>Wali Kelas</strong> atau melalui transfer bank ke rekening berikut:
            </p>
            
            <div className="space-y-3 mb-6 print:hidden">
              {rekening.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{r.nama_bank}</p>
                    <p className="text-sm font-mono font-semibold text-blue-700">{r.nomor_rekening}</p>
                    <p className="text-xs text-slate-500">a.n. {r.atas_nama}</p>
                  </div>
                </div>
              ))}
              {rekening.length === 0 && (
                <p className="text-center text-xs text-slate-400 italic">Belum ada info rekening bank.</p>
              )}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed text-center mt-6">
              Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.
            </p>
            
            <div className="mt-6 pt-6 border-t border-dashed flex justify-center gap-4 print:hidden">
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-medium shadow-sm">
                <Printer size={18} /> Simpan PDF
              </button>
              <a href="https://wa.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm">
                <Phone size={18} /> Hubungi Wali Kelas
              </a>
            </div>
          </div>

        </div>
        
        <p className="text-center text-xs text-slate-400 mt-6 print:hidden">Sistem Informasi Sekolah © 2026</p>
      </div>
    </div>
  );
}

export default function HalamanTagihanPublic() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <HalamanTagihanPublicContent />
    </Suspense>
  );
}