"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

function EditKerusakanContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState("Dilaporkan");
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: rusak, error } = await supabase.schema("sarpras").from("kerusakan").select("*").eq("id", id).single();
      if (error) {
        alert("Gagal memuat: " + error.message);
        router.push("/sarpras/kerusakan");
        return;
      }
      
      if (rusak) {
        const { data: aset } = await supabase.schema("sarpras").from("aset").select("nama_aset, kode_aset").eq("id", rusak.aset_id).single();
        setData({ ...rusak, aset });
        setStatus(rusak.status);
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    setSedangSimpan(true);
    const { error } = await supabase.schema("sarpras").from("kerusakan").update({ status: status }).eq("id", id);
    setSedangSimpan(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else router.push("/sarpras/kerusakan");
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  if (!data) return <div className="p-10 text-center text-red-500">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Update Status Laporan</h1>
          <p className="text-slate-500 text-sm mt-1">Perbarui status penanganan kerusakan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {/* Info Laporan */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg mb-6 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-500">Aset:</span><span className="font-semibold text-slate-800">{data.aset?.nama_aset} ({data.aset?.kode_aset})</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Pelapor:</span><span className="font-semibold text-slate-800">{data.pelapor}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Tanggal Lapor:</span><span className="font-semibold text-slate-800">{data.tanggal_lapor}</span></div>
          <div className="flex justify-between items-start"><span className="text-slate-500">Kerusakan:</span><span className="font-semibold text-slate-800 text-right max-w-md">{data.deskripsi_kerusakan}</span></div>
        </div>

        <form onSubmit={handleSimpan} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Penanganan</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-semibold" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Dilaporkan">Dilaporkan (Baru masuk)</option>
              <option value="Diproses">Diproses (Sedang diperbaiki)</option>
              <option value="Selesai">Selesai (Sudah beres)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={sedangSimpan} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
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

export default function EditKerusakan() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <EditKerusakanContent />
    </Suspense>
  );
}