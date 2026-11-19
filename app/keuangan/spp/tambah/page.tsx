"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahPembayaranSpp() {
  const router = useRouter();
  
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  
  const [siswaId, setSiswaId] = useState("");
  const [bulan, setBulan] = useState("Juli");
  const [tahun, setTahun] = useState("2026");
  const [nominal, setNominal] = useState<number | "">(150000);
  const [tanggalBayar, setTanggalBayar] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil daftar siswa aktif
  useEffect(() => {
    async function fetchSiswa() {
      const { data } = await supabase
        .schema("master")
        .from("siswa")
        .select("id, nama_lengkap, nis")
        .eq("status_siswa", "Aktif")
        .order("nama_lengkap");
      if (data) setDaftarSiswa(data);
    }
    fetchSiswa();
    
    // Set default tanggal hari ini
    const today = new Date().toISOString().split("T")[0];
    setTanggalBayar(today);
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!siswaId || !bulan || !tahun || !nominal) return alert("Semua kolom bertanda wajib diisi!");
    
    setLoading(true);

    const { error } = await supabase.schema("keuangan").from("pembayaran_spp").insert([{
      siswa_id: siswaId,
      bulan: bulan,
      tahun: tahun,
      nominal: Number(nominal),
      tanggal_bayar: tanggalBayar,
      keterangan: keterangan
    }]);

    setLoading(false);

    if (error) {
      // Tangkap error unique constraint (siswa sudah bayar bulan tersebut)
      if (error.code === '23505') {
        alert("Gagal: Siswa ini sudah membayar SPP untuk bulan dan tahun tersebut!");
      } else {
        alert("Gagal menyimpan: " + error.message);
      }
    } else {
      router.push("/keuangan/spp");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Input Pembayaran SPP</h1>
          <p className="text-slate-500 text-sm mt-1">Catat penerimaan uang SPP dari siswa.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Siswa</label>
            <select 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" 
              value={siswaId} 
              onChange={(e) => setSiswaId(e.target.value)} 
              required
            >
              <option value="">-- Cari / Pilih Siswa --</option>
              {daftarSiswa.map((s) => (
                <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nis})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Bulan</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={bulan} onChange={(e) => setBulan(e.target.value)}>
                {["Juli", "Agustus", "September", "Oktober", "November", "Desember", "Januari", "Februari", "Maret", "April", "Mei", "Juni"].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tahun} onChange={(e) => setTahun(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal (Rp)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Bayar</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tanggalBayar} onChange={(e) => setTanggalBayar(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Opsional)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Lunas, Titip Teman" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Pembayaran"}
            </button>
            <button type="button" onClick={() => router.push("/keuangan/spp")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}