"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahAset() {
  const router = useRouter();
  
  const [kode, setKode] = useState("");
  const [nomorInv, setNomorInv] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("Elektronik");
  const [merek, setMerek] = useState("");
  const [spesifikasi, setSpesifikasi] = useState("");
  const [tahun, setTahun] = useState("");
  const [harga, setHarga] = useState<number | "">("");
  const [kondisi, setKondisi] = useState("Baik");
  const [ruanganId, setRuanganId] = useState("");
  
  const [daftarRuangan, setDaftarRuangan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Ambil data ruangan
  useEffect(() => {
    async function fetchRuangan() {
      const { data } = await supabase.schema("sarpras").from("ruangan").select("id, nama_ruangan").order("nama_ruangan");
      if (data) setDaftarRuangan(data);
    }
    fetchRuangan();
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!kode || !nama) return alert("Kode dan Nama Aset wajib diisi!");
    
    setLoading(true);
    const { error } = await supabase.schema("sarpras").from("aset").insert([{
      kode_aset: kode.toUpperCase(),
      nomor_inventaris: nomorInv.toUpperCase() || null,
      nama_aset: nama,
      kategori: kategori,
      merek: merek,
      spesifikasi: spesifikasi,
      tahun_perolehan: tahun,
      harga: harga === "" ? null : harga,
      kondisi: kondisi,
      ruangan_id: ruanganId || null // SIMPAN RUANGAN
    }]);

    setLoading(false);
    if (error) {
      if (error.code === '23505') alert("Kode Aset atau Nomor Inventaris sudah digunakan!");
      else alert("Gagal menyimpan: " + error.message);
    } else {
      router.push("/sarpras/aset");
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan data barang/aset baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Aset</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase" placeholder="AST-0001" value={kode} onChange={(e) => setKode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Inventaris</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase" placeholder="INV-2026-0001" value={nomorInv} onChange={(e) => setNomorInv(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Aset</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Proyektor Epson" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option value="Elektronik">Elektronik</option>
                <option value="Mebel">Mebel (Meja/Kursi)</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Alat Peraga">Alat Peraga</option>
                <option value="Buku">Buku</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Merek (Opsional)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Epson" value={merek} onChange={(e) => setMerek(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Lokasi Ruangan</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={ruanganId} onChange={(e) => setRuanganId(e.target.value)}>
                <option value="">-- Belum Ditentukan --</option>
                {daftarRuangan.map((r) => (
                  <option key={r.id} value={r.id}>{r.nama_ruangan}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Spesifikasi (Opsional)</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Tipe EB-X06, 3600 Lumens" value={spesifikasi} onChange={(e) => setSpesifikasi(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun Perolehan</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="2023" value={tahun} onChange={(e) => setTahun(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Harga (Rp)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="5000000" value={harga} onChange={(e) => setHarga(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kondisi</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={kondisi} onChange={(e) => setKondisi(e.target.value)}>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Aset"}
            </button>
            <button type="button" onClick={() => router.push("/sarpras/aset")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}