"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Box, Search, Edit, QrCode, MapPin } from "lucide-react";

export default function AsetPage() {
  const [aset, setAset] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  async function loadData() {
    setLoading(true);
    
    // Ambil data aset
    const { data: dataAset } = await supabase.schema("sarpras").from("aset").select("*");
    // Ambil data ruangan
    const { data: dataRuangan } = await supabase.schema("sarpras").from("ruangan").select("id, nama_ruangan");

    let merged = (dataAset || []).map(a => {
      const ruangan = dataRuangan?.find(r => r.id === a.ruangan_id);
      return { ...a, ruangan: ruangan || null };
    });

    if (keyword.trim() !== "") {
      merged = merged.filter(a => 
        a.nama_aset?.toLowerCase().includes(keyword.toLowerCase()) || 
        a.kode_aset?.toLowerCase().includes(keyword.toLowerCase()) ||
        a.nomor_inventaris?.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // Urutkan berdasarkan yang terbaru
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setAset(merged);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [keyword]);

  async function hapusAset(id: string) {
    if (!confirm("Yakin ingin menghapus aset ini?")) return;
    const { error } = await supabase.schema("sarpras").from("aset").delete().eq("id", id);
    if (error) alert("Gagal menghapus: " + error.message);
    else loadData();
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  const getKondisiBadge = (kondisi: string) => {
    switch(kondisi) {
      case 'Baik': return 'bg-green-100 text-green-800';
      case 'Rusak Ringan': return 'bg-yellow-100 text-yellow-800';
      case 'Rusak Berat': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Aset</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola inventaris barang dan aset madrasah.</p>
        </div>
        <Link href="/sarpras/aset/tambah" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Plus size={18} /> Tambah Aset
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={16} className="text-slate-400" /></div>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm outline-none" placeholder="Cari nama, kode aset, atau no. inventaris..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <div className="p-6 text-center text-slate-500">Memuat data...</div> : aset.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Box size={48} className="text-slate-300 mb-3" />
            <p>Belum ada data aset.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Kode / Inventaris</th>
                  <th className="px-6 py-4">Nama Aset</th>
                  <th className="px-6 py-4">Kategori / Lokasi</th>
                  <th className="px-6 py-4">Tahun / Harga</th>
                  <th className="px-6 py-4 text-center">Kondisi</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {aset.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{row.kode_aset}</p>
                      <p className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1">{row.nomor_inventaris || "Belum ada No. Inv"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{row.nama_aset}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{row.spesifikasi || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{row.kategori}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-red-500" /> {row.ruangan?.nama_ruangan || "Belum ditentukan"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-800">{row.tahun_perolehan || "-"}</p>
                      <p className="text-xs font-semibold text-green-600">{row.harga ? formatRupiah(row.harga) : "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKondisiBadge(row.kondisi)}`}>
                        {row.kondisi}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Link href={`/sarpras/aset/qr/${row.id}`} className="text-slate-600 hover:text-purple-600 transition-colors" title="Cetak QR Code">
                          <QrCode size={18} />
                        </Link>
                        <Link href={`/sarpras/aset/edit/${row.id}`} className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit Aset">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => hapusAset(row.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Hapus">
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