"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, ArrowLeft, Hash } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RekeningAnggaranPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Form
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [kelompok, setKelompok] = useState("Belanja Barang");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function loadData() {
    setLoading(true);
    const { data: rekening } = await supabase.schema("keuangan").from("rekening_anggaran").select("*").order("kode_rekening");
    if (rekening) setData(rekening);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleTambah(e: React.FormEvent) {
    e.preventDefault();
    if (!kode || !nama) return alert("Kode dan Nama Rekening wajib diisi!");
    
    setSedangSimpan(true);
    const { error } = await supabase.schema("keuangan").from("rekening_anggaran").insert([{
      kode_rekening: kode,
      nama_rekening: nama,
      kelompok: kelompok
    }]);

    setSedangSimpan(false);
    if (error) {
      if (error.code === '23505') alert("Kode rekening sudah digunakan!");
      else alert(error.message);
    } else {
      setKode("");
      setNama("");
      loadData();
    }
  }

  async function handleHapus(id: string) {
    if (!confirm("Yakin ingin menghapus rekening ini? Pastikan tidak ada transaksi yang terhubung.")) return;
    const { error } = await supabase.schema("keuangan").from("rekening_anggaran").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Rekening Anggaran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola Kode Akun Standar (Chart of Accounts) untuk pengeluaran.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FORM TAMBAH */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Hash size={20} className="text-blue-600" /> Tambah Rekening</h2>
            <form onSubmit={handleTambah} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Rekening</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" placeholder="Cth: 5.1.02.04" value={kode} onChange={(e) => setKode(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Rekening</label>
                <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300" placeholder="Cth: Belanja Cetak" value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kelompok</label>
                <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white" value={kelompok} onChange={(e) => setKelompok(e.target.value)}>
                  <option value="Belanja Pegawai">Belanja Pegawai</option>
                  <option value="Belanja Barang">Belanja Barang</option>
                  <option value="Belanja Modal">Belanja Modal</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <button type="submit" disabled={sedangSimpan} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">Tambah</button>
            </form>
          </div>
        </div>

        {/* LIST DATA */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? <p className="p-6 text-center text-slate-500">Memuat...</p> : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Kode</th>
                    <th className="px-6 py-4">Nama Rekening</th>
                    <th className="px-6 py-4">Kelompok</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.kode_rekening}</td>
                      <td className="px-6 py-4 text-slate-700">{item.nama_rekening}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.kelompok}
                        </span>
                      </td>
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