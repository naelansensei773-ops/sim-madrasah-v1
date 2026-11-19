"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

function EditAsetContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [kode, setKode] = useState("");
  const [nomorInv, setNomorInv] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState("");
  const [merek, setMerek] = useState("");
  const [spesifikasi, setSpesifikasi] = useState("");
  const [tahun, setTahun] = useState("");
  const [harga, setHarga] = useState<number | "">("");
  const [kondisi, setKondisi] = useState("");
  const [ruanganId, setRuanganId] = useState("");
  
  const [daftarRuangan, setDaftarRuangan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Ambil daftar ruangan
      const { data: ruangan } = await supabase.schema("sarpras").from("ruangan").select("id, nama_ruangan").order("nama_ruangan");
      if (ruangan) setDaftarRuangan(ruangan);

      // Ambil data aset
      const { data, error } = await supabase.schema("sarpras").from("aset").select("*").eq("id", id).single();
      
      if (error) {
        alert("Gagal memuat data: " + error.message);
        router.push("/sarpras/aset");
      } else if (data) {
        setKode(data.kode_aset || "");
        setNomorInv(data.nomor_inventaris || "");
        setNama(data.nama_aset || "");
        setKategori(data.kategori || "Elektronik");
        setMerek(data.merek || "");
        setSpesifikasi(data.spesifikasi || "");
        setTahun(data.tahun_perolehan || "");
        setHarga(data.harga || "");
        setKondisi(data.kondisi || "Baik");
        setRuanganId(data.ruangan_id || "");
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!kode || !nama) return alert("Kode dan Nama Aset wajib diisi!");
    
    setSedangSimpan(true);
    const { error } = await supabase.schema("sarpras").from("aset").update({
      kode_aset: kode.toUpperCase(),
      nomor_inventaris: nomorInv.toUpperCase() || null,
      nama_aset: nama,
      kategori: kategori,
      merek: merek,
      spesifikasi: spesifikasi,
      tahun_perolehan: tahun,
      harga: harga === "" ? null : harga,
      kondisi: kondisi,
      ruangan_id: ruanganId || null
    }).eq("id", id);

    setSedangSimpan(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/sarpras/aset");
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Perbaiki data atau perbarui kondisi aset.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Aset</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase" value={kode} onChange={(e) => setKode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Inventaris</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase" value={nomorInv} onChange={(e) => setNomorInv(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Aset</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={nama} onChange={(e) => setNama(e.target.value)} required />
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Merek</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={merek} onChange={(e) => setMerek(e.target.value)} />
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Spesifikasi</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={2} value={spesifikasi} onChange={(e) => setSpesifikasi(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun Perolehan</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tahun} onChange={(e) => setTahun(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Harga (Rp)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={harga} onChange={(e) => setHarga(Number(e.target.value))} />
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
            <button type="submit" disabled={sedangSimpan} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
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

export default function EditAset() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <EditAsetContent />
    </Suspense>
  );
}