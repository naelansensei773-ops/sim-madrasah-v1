"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, CheckCircle, RotateCcw } from "lucide-react";

export default function PeminjamanPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data: pinjam } = await supabase.schema("sarpras").from("peminjaman").select("*").order("created_at", { ascending: false });
    const { data: aset } = await supabase.schema("sarpras").from("aset").select("id, nama_aset, kode_aset");

    const merged = (pinjam || []).map(p => {
      const asetInfo = aset?.find(a => a.id === p.aset_id);
      return { ...p, aset: asetInfo || null };
    });
    setData(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function hapusData(id: string) {
    if (!confirm("Yakin ingin menghapus catatan peminjaman ini?")) return;
    const { error } = await supabase.schema("sarpras").from("peminjaman").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  // Fungsi untuk mengembalikan barang
  async function kembalikanBarang(id: string) {
    if (!confirm("Tandai barang ini sudah dikembalikan?")) return;
    const { error } = await supabase.schema("sarpras").from("peminjaman").update({ 
      status: "Kembali",
      tanggal_kembali: new Date().toISOString().split("T")[0]
    }).eq("id", id);
    
    if (error) alert("Gagal update: " + error.message);
    else loadData();
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Peminjaman Barang</h1>
          <p className="text-slate-500 text-sm mt-1">Catatan aset yang dipinjam oleh guru/siswa.</p>
        </div>
        <Link href="/sarpras/peminjaman/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} /> Tambah Peminjaman
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : data.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <RotateCcw size={48} className="text-slate-300 mb-3" />
            <p>Belum ada catatan peminjaman.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Aset</th>
                  <th className="px-6 py-4">Peminjam</th>
                  <th className="px-6 py-4">Tanggal Pinjam</th>
                  <th className="px-6 py-4">Tanggal Kembali</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{row.aset?.nama_aset || "-"}</p>
                      <p className="text-xs text-slate-500">{row.aset?.kode_aset || "-"}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{row.peminjam}</td>
                    <td className="px-6 py-4 text-slate-600">{row.tanggal_pinjam}</td>
                    <td className="px-6 py-4 text-slate-600">{row.tanggal_kembali || "-"}</td>
                    <td className="px-6 py-4 text-center">
                      {row.status === 'Dipinjam' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Dipinjam
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <CheckCircle size={14} /> Kembali
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {row.status === 'Dipinjam' && (
                          <button onClick={() => kembalikanBarang(row.id)} className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1.5 rounded hover:bg-green-200 transition-colors" title="Tandai Kembali">
                            Kembalikan
                          </button>
                        )}
                        <button onClick={() => hapusData(row.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}