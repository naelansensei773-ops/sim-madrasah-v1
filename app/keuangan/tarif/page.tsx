"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TarifSppPage() {
  const router = useRouter();
  const [rombel, setRombel] = useState<any[]>([]);
  const [tarif, setTarif] = useState<Record<string, number>>({});
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data: rombels } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
    const { data: tarifs } = await supabase.schema("keuangan").from("tarif_spp").select("*").eq("tahun_ajaran", tahunAjaran);
    
    if (rombels) {
      setRombel(rombels);
      const tMap: Record<string, number> = {};
      tarifs?.forEach(t => { tMap[t.rombel_id] = t.nominal; });
      setTarif(tMap);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [tahunAjaran]);

  async function handleSave(rombelId: string) {
    const nominal = tarif[rombelId];
    if (!nominal) return alert("Isi nominal terlebih dahulu");
    
    const { error } = await supabase.schema("keuangan").from("tarif_spp").upsert({
      rombel_id: rombelId,
      tahun_ajaran: tahunAjaran,
      nominal: nominal
    }, { onConflict: "rombel_id,tahun_ajaran" });
    
    if (error) alert(error.message);
    else alert("Tarif berhasil disimpan");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Tarif SPP</h1>
          <p className="text-slate-500 text-sm mt-1">Atur nominal SPP per kelas.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex items-center gap-4">
        <label className="font-semibold text-slate-700">Tahun Ajaran:</label>
        <input type="text" className="border p-2 rounded-lg" value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Rombel</th>
                <th className="px-6 py-4 w-64">Nominal SPP (Rp)</th>
                <th className="px-6 py-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rombel.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{r.nama_rombel}</td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      className="w-full border p-2 rounded-lg" 
                      placeholder="Cth: 150000"
                      value={tarif[r.id] || ""}
                      onChange={(e) => setTarif({...tarif, [r.id]: Number(e.target.value)})}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleSave(r.id)} className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700">
                      <Save size={14} /> Simpan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}