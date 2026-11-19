"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Plus, Trash2, ClipboardList } from "lucide-react";

export default function TambahRkamPage() {
  const router = useRouter();
  
  // State Header
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [namaProgram, setNamaProgram] = useState("");
  
  // Data Referensi
  const [daftarRekening, setDaftarRekening] = useState<any[]>([]);
  const [daftarSumber, setDaftarSumber] = useState<any[]>([]);
  
  // State Detail (Array of objects)
  const [details, setDetails] = useState<any[]>([
    { rekening_id: "", sumber_dana_id: "", uraian: "", volume: 1, satuan: "", pagu_anggaran: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReferensi() {
      const { data: rek } = await supabase.schema("keuangan").from("rekening_anggaran").select("id, kode_rekening, nama_rekening").order("kode_rekening");
      if (rek) setDaftarRekening(rek);

      const { data: sum } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana").order("nama_dana");
      if (sum) setDaftarSumber(sum);
    }
    fetchReferensi();
  }, []);

  // Handler untuk Form Dinamis
  const handleTambahBaris = () => {
    setDetails([...details, { rekening_id: "", sumber_dana_id: "", uraian: "", volume: 1, satuan: "", pagu_anggaran: 0 }]);
  };

  const handleHapusBaris = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleUbahBaris = (index: number, field: string, val: any) => {
    const newDetails = [...details];
    newDetails[index][field] = val;
    setDetails(newDetails);
  };

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!namaProgram) return alert("Nama program wajib diisi!");
    
    // Validasi detail
    const isDetailValid = details.every(d => d.rekening_id && d.sumber_dana_id && d.uraian && d.pagu_anggaran > 0);
    if (!isDetailValid) return alert("Pastikan semua rincian (Rekening, Sumber Dana, Uraian, Pagu) telah diisi dengan benar!");

    setLoading(true);

    try {
      // 1. Simpan Header RKAM
      const { data: rkamData, error: errRkam } = await supabase.schema("keuangan").from("rkam").insert([{
        tahun_ajaran: tahunAjaran,
        nama_program: namaProgram
      }]).select().single();

      if (errRkam) throw new Error("Gagal simpan program: " + errRkam.message);

      // 2. Simpan Detail RKAM (Sisipkan rkam_id)
      const detailPayload = details.map(d => ({
        rkam_id: rkamData.id,
        rekening_id: d.rekening_id,
        sumber_dana_id: d.sumber_dana_id,
        uraian: d.uraian,
        volume: Number(d.volume),
        satuan: d.satuan,
        pagu_anggaran: Number(d.pagu_anggaran)
      }));

      const { error: errDetail } = await supabase.schema("keuangan").from("rkam_detail").insert(detailPayload);
      if (errDetail) throw new Error("Gagal simpan rincian: " + errDetail.message);

      router.push("/keuangan/rkam");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  const totalPagu = details.reduce((sum, d) => sum + (Number(d.pagu_anggaran) || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Buat Program RKAM</h1>
          <p className="text-slate-500 text-sm mt-1">Susun rencana anggaran dan rincian belanjanya.</p>
        </div>
      </div>

      <form onSubmit={handleSimpan} className="space-y-6">
        
        {/* HEADER PROGRAM */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-5">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Program / Kegiatan</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Pengadaan Buku Perpustakaan" value={namaProgram} onChange={(e) => setNamaProgram(e.target.value)} required />
          </div>
          <div className="md:w-48">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun Ajaran</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} required />
          </div>
        </div>

        {/* RINCIAN BELANJA */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h2 className="font-bold text-slate-800">Rincian Belanja</h2>
            <button type="button" onClick={handleTambahBaris} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
              <Plus size={14} /> Tambah Baris
            </button>
          </div>

          <div className="space-y-4">
            {details.map((item, i) => (
              <div key={i} className="flex flex-col md:flex-row gap-3 items-start border-b border-dashed pb-4 md:pb-0 md:border-none">
                {/* Rekening Anggaran */}
                <div className="w-full md:w-1/3">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Rekening Anggaran</label>
                  <select className="w-full px-3 py-2 rounded-lg border text-sm" value={item.rekening_id} onChange={(e) => handleUbahBaris(i, "rekening_id", e.target.value)} required>
                    <option value="">-- Pilih Rekening --</option>
                    {daftarRekening.map(r => <option key={r.id} value={r.id}>{r.kode_rekening} - {r.nama_rekening}</option>)}
                  </select>
                </div>

                {/* Sumber Dana */}
                <div className="w-full md:w-1/4">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Sumber Dana</label>
                  <select className="w-full px-3 py-2 rounded-lg border text-sm" value={item.sumber_dana_id} onChange={(e) => handleUbahBaris(i, "sumber_dana_id", e.target.value)} required>
                    <option value="">-- Pilih Dana --</option>
                    {daftarSumber.map(s => <option key={s.id} value={s.id}>{s.nama_dana}</option>)}
                  </select>
                </div>

                {/* Uraian */}
                <div className="w-full md:flex-1">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Uraian Belanja</label>
                  <input type="text" className="w-full px-3 py-2 rounded-lg border text-sm" placeholder="Cth: Buku Tulis" value={item.uraian} onChange={(e) => handleUbahBaris(i, "uraian", e.target.value)} required />
                </div>

                {/* Volume & Satuan */}
                <div className="flex gap-2 w-full md:w-32">
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Vol</label>
                    <input type="number" className="w-full px-2 py-2 rounded-lg border text-sm text-center" value={item.volume} onChange={(e) => handleUbahBaris(i, "volume", e.target.value)} required />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Satuan</label>
                    <input type="text" className="w-full px-2 py-2 rounded-lg border text-sm text-center" placeholder="Pcs" value={item.satuan} onChange={(e) => handleUbahBaris(i, "satuan", e.target.value)} />
                  </div>
                </div>

                {/* Pagu */}
                <div className="w-full md:w-40">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pagu (Rp)</label>
                  <input type="number" className="w-full px-3 py-2 rounded-lg border text-sm font-bold" placeholder="150000" value={item.pagu_anggaran} onChange={(e) => handleUbahBaris(i, "pagu_anggaran", e.target.value)} required />
                </div>

                {/* Hapus */}
                <div className="pt-5">
                  <button type="button" onClick={() => handleHapusBaris(i)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER TOTAL */}
        <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Pagu Anggaran Program</p>
            <p className="text-3xl font-black">{formatRupiah(totalPagu)}</p>
          </div>
          <button type="submit" disabled={loading} className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
            <Save size={20} /> {loading ? "Menyimpan..." : "Simpan Program RKAM"}
          </button>
        </div>

      </form>
    </div>
  );
}