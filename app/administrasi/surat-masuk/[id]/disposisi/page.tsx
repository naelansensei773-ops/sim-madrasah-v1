"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Printer, CheckCircle } from "lucide-react";

function DisposisiContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [surat, setSurat] = useState<any>(null);
  const [riwayatDisposisi, setRiwayatDisposisi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [penerima, setPenerima] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [sifat, setSifat] = useState("Biasa");
  const [batasWaktu, setBatasWaktu] = useState("");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  async function loadData() {
    setLoading(true);
    // 1. Ambil data surat
    const { data: dataSurat } = await supabase.schema("administrasi").from("surat_masuk").select("*").eq("id", id).single();
    if (dataSurat) setSurat(dataSurat);

    // 2. Ambil data guru/staf untuk dropdown penerima
    const { data: dataGuru } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
    if (dataGuru) setDaftarGuru(dataGuru);

    // 3. Ambil riwayat disposisi
    const { data: dataDisposisi } = await supabase.schema("administrasi").from("disposisi").select("*").eq("surat_masuk_id", id).order("created_at", { ascending: false });
    if (dataDisposisi) setRiwayatDisposisi(dataDisposisi);

    setLoading(false);
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!penerima || !instruksi) return alert("Penerima dan Instruksi wajib diisi!");

    setSedangSimpan(true);
    const { error } = await supabase.schema("administrasi").from("disposisi").insert([{
      surat_masuk_id: id,
      penerima: penerima,
      instruksi: instruksi,
      sifat_disposisi: sifat,
      batas_waktu: batasWaktu || null,
    }]);

    setSedangSimpan(false);
    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      // Ubah status surat menjadi 'Diproses' otomatis
      await supabase.schema("administrasi").from("surat_masuk").update({ status: "Diproses" }).eq("id", id);
      
      setPenerima("");
      setInstruksi("");
      setSifat("Biasa");
      setBatasWaktu("");
      loadData(); // Refresh data
    }
  }

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  if (!surat) return <div className="p-10 text-center text-red-500">Surat tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-0">
      {/* HEADER (Sembunyi saat print) */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Lembar Disposisi</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola instruksi untuk surat masuk ini.</p>
          </div>
        </div>
        <button onClick={handlePrint} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
          <Printer size={18} /> Cetak Lembar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* KOLOM KIRI: FORM INPUT (Sembunyi saat print) */}
        <div className="print:hidden space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Buat Disposisi Baru</h2>
            <form onSubmit={handleSimpan} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Diteruskan Kepada</label>
                <select className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white" value={penerima} onChange={(e) => setPenerima(e.target.value)} required>
                  <option value="">-- Pilih Guru / Staf --</option>
                  {daftarGuru.map((g) => <option key={g.id} value={g.nama_lengkap}>{g.nama_lengkap}</option>)}
                  <option value="Tata Usaha">Tata Usaha (TU)</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Waka Kurikulum">Waka Kurikulum</option>
                  <option value="Waka Kesiswaan">Waka Kesiswaan</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instruksi / Arahan</label>
                <textarea className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Cth: Mohon hadiri rapat dan siapkan laporan..." value={instruksi} onChange={(e) => setInstruksi(e.target.value)} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Sifat</label>
                  <select className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={sifat} onChange={(e) => setSifat(e.target.value)}>
                    <option value="Biasa">Biasa</option>
                    <option value="Penting">Penting</option>
                    <option value="Segera">Segera</option>
                    <option value="Rahasia">Rahasia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Batas Waktu (Opsional)</label>
                  <input type="date" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={batasWaktu} onChange={(e) => setBatasWaktu(e.target.value)} />
                </div>
              </div>

              <button type="submit" disabled={sedangSimpan} className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                <Save size={18} /> {sedangSimpan ? "Menyimpan..." : "Simpan Disposisi"}
              </button>
            </form>
          </div>

          {/* RIWAYAT DISPOSISI */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Riwayat Disposisi</h2>
            {riwayatDisposisi.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Belum ada disposisi untuk surat ini.</p>
            ) : (
              <div className="space-y-3">
                {riwayatDisposisi.map((d) => (
                  <div key={d.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex gap-3">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Kepada: {d.penerima} <span className="text-xs font-normal text-slate-500">({d.sifat_disposisi})</span></p>
                      <p className="text-sm text-slate-600 mt-1">"{d.instruksi}"</p>
                      {d.batas_waktu && <p className="text-xs text-red-500 mt-1 font-semibold">Batas Waktu: {d.batas_waktu}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: PRATINJAU CETAK (Tampil di Layar & Saat Print) */}
        <div>
          <div className="bg-white border-2 border-black p-8 shadow-lg print:shadow-none print:border-none print:p-0 print:max-w-full">
            {/* Kop Lembar Disposisi */}
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
              <h1 className="text-2xl font-bold uppercase tracking-widest">Lembar Disposisi</h1>
            </div>

            {/* Info Surat */}
            <table className="w-full text-sm mb-6">
              <tbody>
                <tr><td className="font-semibold w-32 py-1">Nomor Surat</td><td className="py-1">: {surat.nomor_surat}</td></tr>
                <tr><td className="font-semibold py-1">Tanggal Surat</td><td className="py-1">: {surat.tanggal_surat}</td></tr>
                <tr><td className="font-semibold py-1">Pengirim</td><td className="py-1">: {surat.pengirim}</td></tr>
                <tr><td className="font-semibold py-1">Perihal</td><td className="py-1">: {surat.perihal}</td></tr>
              </tbody>
            </table>

            <div className="border-t border-black pt-4 mb-4 text-center">
              <p className="font-bold text-lg">INSTRUKSI / ARAHAN KEPALA MADRASAH</p>
            </div>

            {/* Tampilan Menumpuk jika ada banyak disposisi (seperti lembar fisik asli) */}
            <div className="space-y-6 min-h-[250px]">
              {riwayatDisposisi.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  ( Belum ada instruksi )
                </div>
              ) : (
                riwayatDisposisi.map((d, index) => (
                  <div key={d.id} className="border border-gray-300 p-4 relative">
                    <span className="absolute -top-3 -left-3 bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{index + 1}</span>
                    <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                      <p className="font-bold text-sm">Diteruskan Kepada: {d.penerima}</p>
                      <p className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded">Sifat: {d.sifat_disposisi}</p>
                    </div>
                    <p className="text-sm italic">"{d.instruksi}"</p>
                    {d.batas_waktu && <p className="text-xs mt-2 font-semibold text-red-600">Batas Waktu: {d.batas_waktu}</p>}
                    <p className="text-xs text-right mt-2 text-gray-500">Tgl: {new Date(d.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                ))
              )}
            </div>

            {/* Tanda Tangan Kamad (Hanya di halaman print terakhir) */}
            <div className="mt-12 flex justify-end text-sm">
              <div className="text-center">
                <p>Kepala Madrasah</p>
                <div className="h-20"></div>
                <p className="font-bold underline">(...........................................)</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DisposisiPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <DisposisiContent />
    </Suspense>
  );
}