"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, User, Wallet, FileText, CheckCircle, AlertCircle, Plus } from "lucide-react";

export default function RekapAnakPage() {
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  const [siswaId, setSiswaId] = useState("");
  const [siswa, setSiswa] = useState<any>(null);
  
  const [riwayatSpp, setRiwayatSpp] = useState<any[]>([]);
  const [riwayatTagihan, setRiwayatTagihan] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  
  // State untuk Form Bayar/Pemberian Tagihan (Sederhana)
  const [showTambahTagihan, setShowTambahTagihan] = useState(false);
  const [daftarMasterTagihan, setDaftarMasterTagihan] = useState<any[]>([]);
  const [selectedMasterTagihan, setSelectedMasterTagihan] = useState("");

  // Ambil daftar siswa
  useEffect(() => {
    async function fetchSiswa() {
      const { data } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis").eq("status_siswa", "Aktif").order("nama_lengkap");
      if (data) setDaftarSiswa(data);
    }
    fetchSiswa();
  }, []);

  async function handlePilihSiswa(id: string) {
    setSiswaId(id);
    if (!id) {
      setSiswa(null);
      setRiwayatSpp([]);
      setRiwayatTagihan([]);
      return;
    }

    setLoading(true);

    // 1. Ambil Profil Siswa
    const { data: dataSiswa } = await supabase.schema("master").from("siswa").select("*, rombel(nama_rombel)").eq("id", id).single();
    if (dataSiswa) setSiswa(dataSiswa);

    // 2. Ambil Riwayat SPP
    const { data: spp } = await supabase.schema("keuangan").from("pembayaran_spp").select("*").eq("siswa_id", id).order("tanggal_bayar", { ascending: false });
    if (spp) setRiwayatSpp(spp);

    // 3. Ambil Tagihan Lain & Pembayarannya
    const { data: tagihan } = await supabase.schema("keuangan").from("tagihan_siswa").select("*, master_tagihan(nama_tagihan)").eq("siswa_id", id);
    
    if (tagihan && tagihan.length > 0) {
      const tagihanIds = tagihan.map(t => t.id);
      const { data: pembayaran } = await supabase.schema("keuangan").from("pembayaran_tagihan").select("*").in("tagihan_siswa_id", tagihanIds);

      // Gabungkan data tagihan dengan pembayarannya
      const mergedTagihan = tagihan.map(t => {
        const bayar = pembayaran?.filter(p => p.tagihan_siswa_id === t.id) || [];
        const totalDibayar = bayar.reduce((sum, p) => sum + p.nominal_bayar, 0);
        const sisa = t.nominal_tagihan - totalDibayar;
        return {
          ...t,
          total_dibayar: totalDibayar,
          sisa: sisa < 0 ? 0 : sisa,
          status: sisa <= 0 ? "Lunas" : "Belum Lunas"
        };
      });
      setRiwayatTagihan(mergedTagihan);
    } else {
      setRiwayatTagihan([]);
    }

    setLoading(false);
  }

  // Fungsi untuk memberi tagihan baru ke siswa ini
  async function handleBeriTagihan() {
    if (!selectedMasterTagihan) return alert("Pilih jenis tagihan!");
    
    const master = daftarMasterTagihan.find(m => m.id === selectedMasterTagihan);
    if (!master) return;

    const { error } = await supabase.schema("keuangan").from("tagihan_siswa").insert([{
      siswa_id: siswaId,
      master_tagihan_id: master.id,
      nominal_tagihan: master.nominal_default,
      tahun_ajaran: master.tahun_ajaran
    }]);

    if (error) alert(error.message);
    else {
      setShowTambahTagihan(false);
      setSelectedMasterTagihan("");
      handlePilihSiswa(siswaId); // Refresh data
    }
  }

  // Fungsi untuk membayar tagihan (cicilan/lunas)
  async function handleBayarTagihan(tagihanId: string, sisa: number) {
    const nominalInput = prompt(`Masukkan nominal pembayaran (Sisa: Rp ${sisa.toLocaleString('id-ID')}):`);
    if (!nominalInput) return;
    
    const nominal = Number(nominalInput);
    if (isNaN(nominal) || nominal <= 0) return alert("Nominal tidak valid!");

    const { error } = await supabase.schema("keuangan").from("pembayaran_tagihan").insert([{
      tagihan_siswa_id: tagihanId,
      nominal_bayar: nominal,
      metode_bayar: "Tunai"
    }]);

    if (error) alert(error.message);
    else {
      alert("Pembayaran berhasil dicatat!");
      handlePilihSiswa(siswaId); // Refresh data
    }
  }

  // Ambil master tagihan untuk form
  useEffect(() => {
    async function fetchMaster() {
      const { data } = await supabase.schema("keuangan").from("master_tagihan").select("*").order("nama_tagihan");
      if (data) setDaftarMasterTagihan(data);
    }
    fetchMaster();
  }, []);

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);

  // Hitung Total Ringkasan
  const totalSpp = riwayatSpp.reduce((sum, s) => sum + s.nominal, 0);
  const totalTagihanLain = riwayatTagihan.reduce((sum, t) => sum + t.nominal_tagihan, 0);
  const totalDibayarTagihanLain = riwayatTagihan.reduce((sum, t) => sum + t.total_dibayar, 0);
  const totalSisa = riwayatTagihan.reduce((sum, t) => sum + t.sisa, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Rekap Keuangan Siswa</h1>
        <p className="text-slate-500 text-sm mt-1">Buku besar pembayaran SPP dan tagihan lainnya per siswa.</p>
      </div>

      {/* PENCARIAN SISWA */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <label className="font-semibold text-slate-700 whitespace-nowrap">Pilih Siswa:</label>
        <select 
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 text-sm" 
          value={siswaId} 
          onChange={(e) => handlePilihSiswa(e.target.value)}
        >
          <option value="">-- Cari / Pilih Siswa --</option>
          {daftarSiswa.map((s) => <option key={s.id} value={s.id}>{s.nama_lengkap} ({s.nis})</option>)}
        </select>
      </div>

      {loading && <p className="text-center text-slate-500">Memuat data siswa...</p>}

      {siswa && !loading && (
        <div className="space-y-6">
          
          {/* KARTU IDENTITAS & RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><User size={24} /></div>
              <div>
                <p className="text-sm text-slate-500 font-semibold">Nama Siswa</p>
                <p className="font-bold text-slate-900 text-lg">{siswa.nama_lengkap}</p>
                <p className="text-xs text-slate-500">Kelas: {siswa.rombel?.nama_rombel || "-"} | NIS: {siswa.nis}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Wallet size={24} /></div>
              <div>
                <p className="text-sm text-slate-500 font-semibold">Total Uang Masuk</p>
                <p className="font-bold text-green-600 text-lg">{formatRupiah(totalSpp + totalDibayarTagihanLain)}</p>
                <p className="text-xs text-slate-500">SPP: {formatRupiah(totalSpp)} | Lainnya: {formatRupiah(totalDibayarTagihanLain)}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={24} /></div>
              <div>
                <p className="text-sm text-slate-500 font-semibold">Sisa Tunggakan</p>
                <p className={`font-bold text-lg ${totalSisa > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totalSisa > 0 ? formatRupiah(totalSisa) : "Lunas"}
                </p>
                <p className="text-xs text-slate-500">Total Tagihan: {formatRupiah(totalTagihanLain)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* TABEL SPP */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle size={18} className="text-blue-600"/> Riwayat Pembayaran SPP</h3>
                <span className="text-sm font-bold text-blue-600">{formatRupiah(totalSpp)}</span>
              </div>
              <div className="overflow-x-auto flex-1 max-h-96">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Bulan / Tahun</th>
                      <th className="px-4 py-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayatSpp.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{s.tanggal_bayar}</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{s.bulan} {s.tahun}</td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">{formatRupiah(s.nominal)}</td>
                      </tr>
                    ))}
                    {riwayatSpp.length === 0 && (
                      <tr><td colSpan={3} className="text-center py-6 text-slate-400 italic">Belum ada riwayat SPP</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL TAGIHAN LAIN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-purple-600"/> Tagihan Lainnya</h3>
                <button onClick={() => setShowTambahTagihan(!showTambahTagihan)} className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-md hover:bg-purple-200 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Beri Tagihan
                </button>
              </div>

              {/* Form Tambah Tagihan (Muncul saat tombol diklik) */}
              {showTambahTagihan && (
                <div className="p-3 bg-purple-50 border-b border-purple-100 flex gap-2">
                  <select className="flex-1 px-3 py-1.5 rounded border border-purple-200 text-sm" value={selectedMasterTagihan} onChange={(e) => setSelectedMasterTagihan(e.target.value)}>
                    <option value="">-- Pilih Tagihan --</option>
                    {daftarMasterTagihan.map(m => <option key={m.id} value={m.id}>{m.nama_tagihan} - {formatRupiah(m.nominal_default)} ({m.tahun_ajaran})</option>)}
                  </select>
                  <button onClick={handleBeriTagihan} className="bg-purple-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-purple-700">Simpan</button>
                </div>
              )}

              <div className="overflow-x-auto flex-1 max-h-96">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Nama Tagihan</th>
                      <th className="px-4 py-3 text-right">Tagihan</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {riwayatTagihan.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{t.master_tagihan?.nama_tagihan}</p>
                          <p className="text-xs text-slate-500">Dibayar: {formatRupiah(t.total_dibayar)}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-bold text-slate-800">{formatRupiah(t.nominal_tagihan)}</p>
                          {t.sisa > 0 && <p className="text-xs text-red-500 font-semibold">Sisa: {formatRupiah(t.sisa)}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${t.status === 'Lunas' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {t.sisa > 0 ? (
                            <button onClick={() => handleBayarTagihan(t.id, t.sisa)} className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded hover:bg-blue-200">
                              Bayar
                            </button>
                          ) : (
                            <CheckCircle size={16} className="text-green-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {riwayatTagihan.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-slate-400 italic">Belum ada tagihan lain</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}