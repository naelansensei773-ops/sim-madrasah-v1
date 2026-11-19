"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahRuangan() {
  const router = useRouter();
  
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("Kelas");
  const [luas, setLuas] = useState("");
  const [kapasitas, setKapasitas] = useState<number | "">("");
  const [pj, setPj] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!kode || !nama) return alert("Kode dan Nama Ruangan wajib diisi!");
    
    setLoading(true);
    const { error } = await supabase.schema("sarpras").from("ruangan").insert([{
      kode_ruangan: kode.toUpperCase(),
      nama_ruangan: nama,
      jenis_ruangan: jenis,
      luas: luas,
      kapasitas: kapasitas === "" ? null : kapasitas,
      penanggung_jawab: pj
    }]);

    setLoading(false);
    if (error) {
      if (error.code === '23505') alert("Kode ruangan sudah digunakan!");
      else alert("Gagal menyimpan: " + error.message);
    } else {
      router.push("/sarpras/ruangan");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Ruangan</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan data ruangan baru.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kode Ruangan</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 uppercase" placeholder="Cth: R001" value={kode} onChange={(e) => setKode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Ruangan</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Kelas 1A" value={nama} onChange={(e) => setNama(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Jenis Ruangan</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={jenis} onChange={(e) => setJenis(e.target.value)}>
              <option value="Kelas">Kelas</option>
              <option value="Kantor">Kantor</option>
              <option value="Laboratorium">Laboratorium</option>
              <option value="Perpustakaan">Perpustakaan</option>
              <option value="Aula">Aula</option>
              <option value="UKS">UKS</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Luas (Cth: 64 m²)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="64 m²" value={luas} onChange={(e) => setLuas(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kapasitas (Orang)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="32" value={kapasitas} onChange={(e) => setKapasitas(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Penanggung Jawab</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Nama Guru/Petugas" value={pj} onChange={(e) => setPj(e.target.value)} />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Ruangan"}
            </button>
            <button type="button" onClick={() => router.push("/sarpras/ruangan")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}