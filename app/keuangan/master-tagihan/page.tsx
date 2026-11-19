"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, ArrowLeft, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MasterTagihanPage() {
  const router = useRouter();
  const [tagihan, setTagihan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah
  const [nama, setNama] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [batasWaktu, setBatasWaktu] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // State Form Edit (Inline)
  const [editId, setEditId] = useState<string | null>(null);
  const [editNominal, setEditNominal] = useState<number | "">("");
  const [editBatasWaktu, setEditBatasWaktu] = useState("");

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.schema("keuangan").from("master_tagihan").select("*").order("tahun_ajaran", { ascending: false });
    if (data) setTagihan(data);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!nama || !nominal || !tahunAjaran) return alert("Isi semua kolom!");
    
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("master_tagihan").insert([{
      nama_tagihan: nama,
      nominal_default: Number(nominal),
      tahun_ajaran: tahunAjaran,
      batas_waktu: batasWaktu || null
    }]);

    setSedangSimpan(false);
    if (error) {
      if (error.code === '23505') alert("Tagihan dengan nama tersebut sudah ada di tahun ajaran ini.");
      else alert(error.message);
    } else {
      setNama("");
      setNominal("");
      setBatasWaktu("");
      loadData();
    }
  }

  async function handleHapus(id: string) {
    if (!confirm("Yakin ingin menghapus jenis tagihan ini?")) return;
    const { error } = await supabase.schema("keuangan").from("master_tagihan").delete().eq("id", id);
    if (error) alert("Gagal: " + error.message);
    else loadData();
  }

  async function handleSimpanEdit(id: string) {
    if (!editNominal) return alert("Isi nominal baru!");
    
    const { error } = await supabase.schema("keuangan").from("master_tagihan").update({ 
      nominal_default: Number(editNominal),
      batas_waktu: editBatasWaktu || null
    }).eq("id", id);
    
    if (error) alert("Gagal update: " + error.message);
    else {
      setEditId(null);
      setEditNominal("");
      setEditBatasWaktu("");
      loadData();
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Master Jenis Tagihan</h1>
          <p className="text-slate-500 text-sm mt-1">Atur daftar tagihan non-SPP per tahun ajaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM TAMBAH */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Tambah Tagihan</h2>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: 2024/2025" value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Tagihan</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Uang Gedung" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal Standar (Rp)</label>
                <input type="number" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: 1500000" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Batas Waktu (Deadline)</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={batasWaktu} onChange={(e) => setBatasWaktu(e.target.value)} />
              </div>
              <button type="submit" disabled={sedangSimpan} className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                <Plus size={18} /> Tambah
              </button>
            </form>
          </div>
        </div>

        {/* LIST TAGIHAN */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Tahun Ajaran</th>
                    <th className="px-6 py-4">Nama Tagihan</th>
                    <th className="px-6 py-4">Nominal & Deadline</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tagihan.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-600">{t.tahun_ajaran}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{t.nama_tagihan}</td>
                      <td className="px-6 py-4">
                        {editId === t.id ? (
                          <div className="space-y-2">
                            <input type="number" className="w-full px-2 py-1 border rounded" value={editNominal} onChange={(e) => setEditNominal(Number(e.target.value))} />
                            <input type="date" className="w-full px-2 py-1 border rounded" value={editBatasWaktu} onChange={(e) => setEditBatasWaktu(e.target.value)} />
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => handleSimpanEdit(t.id)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Simpan</button>
                              <button onClick={() => setEditId(null)} className="text-xs bg-slate-400 text-white px-2 py-1 rounded">Batal</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="font-bold text-slate-700">{formatRupiah(t.nominal_default)}</p>
                            <p className="text-xs text-red-500 font-semibold mt-1">Batas: {t.batas_waktu || "-"}</p>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => { setEditId(t.id); setEditNominal(t.nominal_default); setEditBatasWaktu(t.batas_waktu || ""); }} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleHapus(t.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tagihan.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Belum ada master tagihan.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}