"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, ArrowLeft, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PengaturanGajiPage() {
  const router = useRouter();
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [dataSetting, setDataSetting] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // State Form Edit (Menyimpan semua field dalam satu objek)
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
    const { data: setting } = await supabase.schema("keuangan").from("setting_gaji").select("*");
    
    if (guru) {
      setDaftarGuru(guru);
      const mapped: Record<string, any> = {};
      setting?.forEach(s => { mapped[s.guru_id] = s; });
      setDataSetting(mapped);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const handleEditClick = (guruId: string) => {
    const set = dataSetting[guruId];
    setEditId(guruId);
    setFormData({
      gaji_pokok: set?.gaji_pokok || 0,
      tunj_fungsional: set?.tunj_fungsional || 0,
      tunj_keluarga: set?.tunj_keluarga || 0,
      tunj_beras: set?.tunj_beras || 0,
      pot_bpjs: set?.pot_bpjs || 0,
      pot_koperasi: set?.pot_koperasi || 0,
    });
  };

  const handleChange = (field: string, val: number) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  async function handleSimpan(guruId: string) {
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("setting_gaji").upsert({
      guru_id: guruId,
      ...formData
    }, { onConflict: "guru_id" });

    setSedangSimpan(false);
    if (error) alert("Gagal menyimpan: " + error.message);
    else {
      setEditId(null);
      loadData();
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengaturan Gaji Default</h1>
          <p className="text-slate-500 text-sm mt-1">Atur gaji pokok, tunjangan tetap, dan potongan tetap bulanan.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : (
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-4">Nama Guru</th>
                <th className="px-4 py-4 text-right">Gaji Pokok</th>
                <th className="px-4 py-4 text-right">Tunj. Fungsional</th>
                <th className="px-4 py-4 text-right">Tunj. Keluarga</th>
                <th className="px-4 py-4 text-right">Tunj. Beras</th>
                <th className="px-4 py-4 text-right">Pot. BPJS</th>
                <th className="px-4 py-4 text-right">Pot. Koperasi</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarGuru.map((g) => {
                const isEditing = editId === g.id;
                const set = dataSetting[g.id];

                return (
                  <tr key={g.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4 font-semibold text-slate-800">{g.nama_lengkap}</td>
                    
                    <td className="px-4 py-4 text-right">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.gaji_pokok} onChange={(e) => handleChange("gaji_pokok", Number(e.target.value))} /> : set ? formatRupiah(set.gaji_pokok) : "0"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.tunj_fungsional} onChange={(e) => handleChange("tunj_fungsional", Number(e.target.value))} /> : set ? formatRupiah(set.tunj_fungsional) : "0"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.tunj_keluarga} onChange={(e) => handleChange("tunj_keluarga", Number(e.target.value))} /> : set ? formatRupiah(set.tunj_keluarga) : "0"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.tunj_beras} onChange={(e) => handleChange("tunj_beras", Number(e.target.value))} /> : set ? formatRupiah(set.tunj_beras) : "0"}
                    </td>
                    <td className="px-4 py-4 text-right text-red-600">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.pot_bpjs} onChange={(e) => handleChange("pot_bpjs", Number(e.target.value))} /> : set ? formatRupiah(set.pot_bpjs) : "0"}
                    </td>
                    <td className="px-4 py-4 text-right text-red-600">
                      {isEditing ? <input type="number" className="w-24 px-2 py-1 border rounded text-right" value={formData.pot_koperasi} onChange={(e) => handleChange("pot_koperasi", Number(e.target.value))} /> : set ? formatRupiah(set.pot_koperasi) : "0"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSimpan(g.id)} disabled={sedangSimpan} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                            <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                          </>
                        ) : (
                          <button onClick={() => handleEditClick(g.id)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}