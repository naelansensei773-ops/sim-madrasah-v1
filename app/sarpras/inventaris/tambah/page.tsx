"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahInventaris() {
  const router = useRouter();
  
  const [daftarRuangan, setDaftarRuangan] = useState<any[]>([]);
  const [daftarSumber, setDaftarSumber] = useState<any[]>([]);

  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [jumlah, setJumlah] = useState<number | "">(1);
  const [kondisi, setKondisi] = useState("Baik");
  const [ruanganId, setRuanganId] = useState("");
  const [sumberDanaId, setSumberDanaId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReferensi() {
      const { data: ruangan } = await supabase.schema("sarpras").from("ruangan").select("id, nama_ruangan").order("nama_ruangan");
      if (ruangan) setDaftarRuangan(ruangan);

      const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana").order("nama_dana");
      if (sumber) setDaftarSumber(sumber);
    }
    fetchReferensi();
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!nama || !jumlah) return alert("Nama barang dan jumlah wajib diisi!");
    
    setLoading(true);
    const { error } = await supabase.schema("sarpras").from("inventaris").insert([{
      nama_barang: nama,
      kode_barang: kode,
      jumlah: Number(jumlah),
      kondisi: kondisi,
      ruangan_id: ruanganId || null,
      sumber_dana_id: sumberDanaId || null,
      tanggal_perolehan: tanggal || null,
      keterangan: keterangan
    }]);

    setLoading(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/sarpras/inventaris");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Inventaris</h1>
          <p className="text-slate-500 text-sm mt-1">Catat aset atau sarana prasarana baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Barang</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Laptop Asus" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Barang (Opsional)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: INV-2024-001" value={kode} onChange={(e) => setKode(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Jumlah</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={jumlah} onChange={(e) => setJumlah(Number(e.target.value))} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kondisi</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={kondisi} onChange={(e) => setKondisi(e.target.value)}>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Perolehan</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ruangan</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={ruanganId} onChange={(e) => setRuanganId(e.target.value)}>
                <option value="">-- Pilih Ruangan --</option>
                {daftarRuangan.map(r => <option key={r.id} value={r.id}>{r.nama_ruangan}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-blue-700" value={sumberDanaId} onChange={(e) => setSumberDanaId(e.target.value)}>
                <option value="">-- Pilih Sumber Dana --</option>
                {daftarSumber.map(s => <option key={s.id} value={s.id}>{s.nama_dana}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Opsional)</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300" rows={2} placeholder="Cth: Warna hitam, layar lecet" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Barang"}
            </button>
            <button type="button" onClick={() => router.push("/sarpras/inventaris")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}