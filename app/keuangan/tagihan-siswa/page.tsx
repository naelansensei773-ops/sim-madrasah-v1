"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Save, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TagihanSiswaPage() {
  const router = useRouter();

  // State Filter
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [daftarMasterTagihan, setDaftarMasterTagihan] = useState<any[]>([]);
  const [rombelId, setRombelId] = useState("");
  const [masterTagihanId, setMasterTagihanId] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  
  // State Data Siswa
  const [listSiswa, setListSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Ambil data referensi awal
  useEffect(() => {
    async function fetchReferensi() {
      const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (rombel) setDaftarRombel(rombel);

      const { data: tagihan } = await supabase.schema("keuangan").from("master_tagihan").select("*").eq("tahun_ajaran", tahunAjaran).order("nama_tagihan");
      if (tagihan) setDaftarMasterTagihan(tagihan);
    }
    fetchReferensi();
  }, [tahunAjaran]);

  // Load siswa ketika rombel dan jenis tagihan dipilih
  async function handleLoadSiswa() {
    if (!rombelId || !masterTagihanId) return alert("Pilih Kelas dan Jenis Tagihan terlebih dahulu!");
    setLoading(true);

    // 1. Ambil data siswa di kelas tersebut
    const { data: siswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis").eq("rombel_id", rombelId).eq("status_siswa", "Aktif").order("nama_lengkap");

    // 2. Ambil tagihan siswa yang sudah ada di database untuk jenis tagihan ini
    const { data: tagihanAda } = await supabase.schema("keuangan").from("tagihan_siswa").select("siswa_id").eq("master_tagihan_id", masterTagihanId);

    if (siswa) {
      const merged = siswa.map(s => {
        // Cek apakah siswa ini sudah pernah dikasih tagihan ini sebelumnya
        const sudahAda = tagihanAda?.some(t => t.siswa_id === s.id);
        return {
          ...s,
          dipilih: !sudahAda, // Jika sudah ada, otomatis tidak perlu dicentang lagi (disable)
          sudahAda: sudahAda
        };
      });
      setListSiswa(merged);
    }
    setLoading(false);
  }

  // Toggle checkbox
  const handleToggleSiswa = (id: string) => {
    setListSiswa(prev => prev.map(s => s.id === id && !s.sudahAda ? { ...s, dipilih: !s.dipilih } : s));
  };

  // Simpan ke database
  async function handleSimpan() {
    const siswaDipilih = listSiswa.filter(s => s.dipilih && !s.sudahAda);
    if (siswaDipilih.length === 0) return alert("Tidak ada siswa baru yang dipilih.");

    const tagihanTerpilih = daftarMasterTagihan.find(t => t.id === masterTagihanId);
    if (!tagihanTerpilih) return;

    setSedangSimpan(true);

    const dataToInsert = siswaDipilih.map(s => ({
      siswa_id: s.id,
      master_tagihan_id: masterTagihanId,
      nominal_tagihan: tagihanTerpilih.nominal_default,
      tahun_ajaran: tahunAjaran
    }));

    const { error } = await supabase.schema("keuangan").from("tagihan_siswa").insert(dataToInsert);
    setSedangSimpan(false);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      alert(`Berhasil memberikan tagihan ke ${siswaDipilih.length} siswa!`);
      handleLoadSiswa(); // Refresh list
    }
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  const nominalTagihan = daftarMasterTagihan.find(t => t.id === masterTagihanId)?.nominal_default || 0;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Penugasan Tagihan Siswa</h1>
          <p className="text-slate-500 text-sm mt-1">Berikan tagihan non-SPP secara massal ke siswa per kelas.</p>
        </div>
      </div>

      {/* FORM FILTER */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-32">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tahun Ajaran</label>
          <input type="text" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" value={tahunAjaran} onChange={(e) => setTahunAjaran(e.target.value)} />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Kelas / Rombel</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
            <option value="">-- Pilih Kelas --</option>
            {daftarRombel.map(r => <option key={r.id} value={r.id}>{r.nama_rombel}</option>)}
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Jenis Tagihan</label>
          <select className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm" value={masterTagihanId} onChange={(e) => setMasterTagihanId(e.target.value)}>
            <option value="">-- Pilih Tagihan --</option>
            {daftarMasterTagihan.map(t => <option key={t.id} value={t.id}>{t.nama_tagihan} ({formatRupiah(t.nominal_default)})</option>)}
          </select>
        </div>
        <button onClick={handleLoadSiswa} className="w-full md:w-auto bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
          Tampilkan Siswa
        </button>
      </div>

      {/* LIST SISWA */}
      {loading && <p className="text-center text-slate-500 mt-10">Memuat data siswa...</p>}

      {!loading && listSiswa.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
            <p className="text-sm text-blue-800 font-semibold">
              Tagihan: {daftarMasterTagihan.find(t => t.id === masterTagihanId)?.nama_tagihan} - {formatRupiah(nominalTagihan)} / siswa
            </p>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 cursor-pointer"
                    checked={listSiswa.every(s => s.dipilih || s.sudahAda) && listSiswa.length > 0}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setListSiswa(prev => prev.map(s => s.sudahAda ? s : { ...s, dipilih: checked }));
                    }}
                  />
                </th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4">Status Penugasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listSiswa.map((s) => (
                <tr key={s.id} className={`transition-colors ${s.sudahAda ? 'bg-slate-50 opacity-60' : 'hover:bg-slate-50/80'}`}>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 cursor-pointer disabled:cursor-not-allowed"
                      checked={s.dipilih || s.sudahAda}
                      disabled={s.sudahAda}
                      onChange={() => handleToggleSiswa(s.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{s.nama_lengkap}</td>
                  <td className="px-6 py-4">{s.nis}</td>
                  <td className="px-6 py-4">
                    {s.sudahAda ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Sudah Ditagihkan
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Belum Ditagihkan</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button onClick={handleSimpan} disabled={sedangSimpan} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
              <Save size={18} /> {sedangSimpan ? "Menyimpan..." : "Simpan Penugasan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}