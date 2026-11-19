"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahPeminjaman() {
  const router = useRouter();
  const [daftarAset, setDaftarAset] = useState<any[]>([]);
  
  const [asetId, setAsetId] = useState("");
  const [peminjam, setPeminjam] = useState("");
  const [tglPinjam, setTglPinjam] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAset() {
      const { data } = await supabase.schema("sarpras").from("aset").select("id, nama_aset, kode_aset").order("nama_aset");
      if (data) setDaftarAset(data);
    }
    fetchAset();
    setTglPinjam(new Date().toISOString().split("T")[0]);
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!asetId || !peminjam) return alert("Aset dan Peminjam wajib diisi!");
    
    setLoading(true);
    const { error } = await supabase.schema("sarpras").from("peminjaman").insert([{
      aset_id: asetId,
      peminjam: peminjam,
      tanggal_pinjam: tglPinjam,
      status: "Dipinjam"
    }]);

    setLoading(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/sarpras/peminjaman");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tambah Peminjaman</h1>
          <p className="text-slate-500 text-sm mt-1">Catat aset yang akan dipinjam.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Aset</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={asetId} onChange={(e) => setAsetId(e.target.value)} required>
              <option value="">-- Pilih Aset --</option>
              {daftarAset.map((a) => <option key={a.id} value={a.id}>{a.nama_aset} ({a.kode_aset})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Peminjam</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Pak Budi (Guru)" value={peminjam} onChange={(e) => setPeminjam(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Pinjam</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tglPinjam} onChange={(e) => setTglPinjam(e.target.value)} required />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Peminjaman"}
            </button>
            <button type="button" onClick={() => router.push("/sarpras/peminjaman")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}