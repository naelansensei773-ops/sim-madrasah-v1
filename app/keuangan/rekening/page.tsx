"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Save, ArrowLeft, Edit, X, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RekeningBankPage() {
  const router = useRouter();
  const [rekening, setRekening] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah
  const [namaBank, setNamaBank] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // State Form Edit (Inline)
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.schema("keuangan").from("rekening_bank").select("*").order("nama_bank");
    if (data) setRekening(data);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!namaBank || !nomorRekening || !atasNama) return alert("Isi semua kolom!");
    
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("rekening_bank").insert([{
      nama_bank: namaBank,
      nomor_rekening: nomorRekening,
      atas_nama: atasNama
    }]);

    setSedangSimpan(false);
    if (error) alert(error.message);
    else {
      setNamaBank("");
      setNomorRekening("");
      setAtasNama("");
      loadData();
    }
  }

  async function handleHapus(id: string) {
    if (!confirm("Yakin ingin menghapus rekening ini?")) return;
    const { error } = await supabase.schema("keuangan").from("rekening_bank").delete().eq("id", id);
    if (error) alert("Gagal: " + error.message);
    else loadData();
  }

  async function handleSimpanEdit(id: string) {
    if (!editData.nama_bank || !editData.nomor_rekening || !editData.atas_nama) return alert("Isi semua kolom!");
    
    const { error } = await supabase.schema("keuangan").from("rekening_bank").update({
      nama_bank: editData.nama_bank,
      nomor_rekening: editData.nomor_rekening,
      atas_nama: editData.atas_nama
    }).eq("id", id);
    
    if (error) alert("Gagal update: " + error.message);
    else {
      setEditId(null);
      loadData();
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekening Bank Madrasah</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola daftar rekening untuk info transfer orang tua.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM TAMBAH */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-600" /> Tambah Rekening
            </h2>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Bank</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: BSI, BRI, Mandiri" value={namaBank} onChange={(e) => setNamaBank(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: 1234567890" value={nomorRekening} onChange={(e) => setNomorRekening(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Atas Nama</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Madrasah Ibtidaiyah" value={atasNama} onChange={(e) => setAtasNama(e.target.value)} required />
              </div>
              <button type="submit" disabled={sedangSimpan} className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                <Plus size={18} /> Tambah
              </button>
            </form>
          </div>
        </div>

        {/* LIST REKENING */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? <div className="p-6 text-center text-slate-500">Memuat...</div> : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Bank</th>
                    <th className="px-6 py-4">Nomor Rekening</th>
                    <th className="px-6 py-4">Atas Nama</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rekening.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        {editId === r.id ? (
                          <input type="text" className="w-full px-2 py-1 border rounded" value={editData.nama_bank} onChange={(e) => setEditData({...editData, nama_bank: e.target.value})} />
                        ) : (
                          <span className="font-bold text-slate-800">{r.nama_bank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">
                        {editId === r.id ? (
                          <input type="text" className="w-full px-2 py-1 border rounded font-mono" value={editData.nomor_rekening} onChange={(e) => setEditData({...editData, nomor_rekening: e.target.value})} />
                        ) : (
                          r.nomor_rekening
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {editId === r.id ? (
                          <input type="text" className="w-full px-2 py-1 border rounded" value={editData.atas_nama} onChange={(e) => setEditData({...editData, atas_nama: e.target.value})} />
                        ) : (
                          r.atas_nama
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {editId === r.id ? (
                            <>
                              <button onClick={() => handleSimpanEdit(r.id)} className="text-green-600 hover:text-green-800" title="Simpan"><Save size={18} /></button>
                              <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600" title="Batal"><X size={18} /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditId(r.id); setEditData(r); }} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleHapus(r.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rekening.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400">Belum ada data rekening.</td></tr>
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