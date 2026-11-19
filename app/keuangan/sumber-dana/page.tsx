"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SumberDanaPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [nama, setNama] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.schema("keuangan").from("sumber_dana").select("*").order("nama_dana");
    if (data) setData(data);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!nama) return alert("Nama sumber dana wajib diisi!");
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("sumber_dana").insert([{ nama_dana: nama, keterangan }]);
    setSedangSimpan(false);
    if (error) alert(error.message);
    else { setNama(""); setKeterangan(""); loadData(); }
  }

  async function handleHapus(id: string) {
    if (!confirm("Hapus sumber dana ini? Pastikan tidak ada transaksi yang terhubung.")) return;
    const { error } = await supabase.schema("keuangan").from("sumber_dana").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Sumber Dana</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar sumber dana (BOS, SPP, BOSDA, dll).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Landmark size={20} className="text-blue-600" /> Tambah Dana</h2>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Sumber Dana</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Cth: BOS Pusat" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Opsional" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
              </div>
              <button type="submit" disabled={sedangSimpan} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">Tambah</button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? <p className="p-6 text-center text-slate-500">Memuat...</p> : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Nama Sumber Dana</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 font-bold text-slate-800">{item.nama_dana}</td>
                      <td className="px-6 py-4 text-slate-600">{item.keterangan || "-"}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => handleHapus(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}