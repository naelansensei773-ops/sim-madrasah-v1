"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahKerusakan() {
  const router = useRouter();
  const [daftarAset, setDaftarAset] = useState<any[]>([]);
  
  const [asetId, setAsetId] = useState("");
  const [pelapor, setPelapor] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAset() {
      const { data } = await supabase.schema("sarpras").from("aset").select("id, nama_aset, kode_aset").order("nama_aset");
      if (data) setDaftarAset(data);
    }
    fetchAset();
    setTanggal(new Date().toISOString().split("T")[0]);
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!asetId || !pelapor || !deskripsi) return alert("Semua kolom wajib diisi!");
    
    setLoading(true);
    const { error } = await supabase.schema("sarpras").from("kerusakan").insert([{
      aset_id: asetId,
      pelapor: pelapor,
      tanggal_lapor: tanggal,
      deskripsi_kerusakan: deskripsi,
      status: "Dilaporkan"
    }]);

    setLoading(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/sarpras/kerusakan");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Laporkan Kerusakan</h1>
          <p className="text-slate-500 text-sm mt-1">Laporkan aset yang rusak agar bisa segera ditindaklanjuti.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Aset yang Rusak</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={asetId} onChange={(e) => setAsetId(e.target.value)} required>
              <option value="">-- Pilih Aset --</option>
              {daftarAset.map((a) => (
                <option key={a.id} value={a.id}>{a.nama_aset} ({a.kode_aset})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Pelapor</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Bu Siti (Guru Kelas 5A)" value={pelapor} onChange={(e) => setPelapor(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Lapor</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Kerusakan</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Jelaskan detail kerusakan, misal: Proyektor tidak mau menyala saat ditekan tombol power." value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} required />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Mengirim..." : "Kirim Laporan"}
            </button>
            <button type="button" onClick={() => router.push("/sarpras/kerusakan")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}