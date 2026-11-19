"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, UploadCloud, FileText, Download, History } from "lucide-react";

function DetailDokumenContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [dokumen, setDokumen] = useState<any>(null);
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk form upload versi baru
  const [fileBaru, setFileBaru] = useState<File | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [sedangUpload, setSedangUpload] = useState(false);

  async function loadData() {
    setLoading(true);
    // 1. Ambil data dokumen
    const { data: dok } = await supabase
      .schema("arsip")
      .from("dokumen")
      .select("*, kategori(nama_kategori)")
      .eq("id", id)
      .single();
    
    if (dok) setDokumen(dok);

    // 2. Ambil riwayat versi
    const { data: versi } = await supabase
      .schema("arsip")
      .from("versi_dokumen")
      .select("*")
      .eq("dokumen_id", id)
      .order("created_at", { ascending: false });

    if (versi) setRiwayat(versi);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleUploadVersi(e: React.FormEvent) {
    e.preventDefault();
    if (!fileBaru) return alert("Pilih file terlebih dahulu!");

    setSedangUpload(true);
    try {
      // 1. Upload file baru ke Storage
      const fileExt = fileBaru.name.split('.').pop();
      const fileName = `${Date.now()}_rev_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, fileBaru);
      if (uploadError) throw new Error("Gagal upload file: " + uploadError.message);

      const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
      const newFileUrl = publicUrlData.publicUrl;

      // 2. Simpan ke tabel riwayat versi
      const { error: dbError } = await supabase.schema("arsip").from("versi_dokumen").insert([{
        dokumen_id: id,
        file_url: newFileUrl,
        keterangan_revisi: keterangan || "Revisi tanpa keterangan"
      }]);
      if (dbError) throw new Error("Gagal simpan riwayat: " + dbError.message);

      // 3. Update file_url utama di tabel dokumen agar menjadi file terbaru
      await supabase.schema("arsip").from("dokumen").update({ file_url: newFileUrl }).eq("id", id);

      alert("Revisi dokumen berhasil diunggah!");
      setFileBaru(null);
      setKeterangan("");
      loadData(); // Refresh data

    } catch (error: any) {
      alert(error.message);
    } finally {
      setSedangUpload(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat detail dokumen...</div>;
  if (!dokumen) return <div className="p-10 text-center text-red-500">Dokumen tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Detail Dokumen</h1>
          <p className="text-slate-500 text-sm mt-1">Informasi lengkap dan riwayat revisi file.</p>
        </div>
      </div>

      {/* KARTU METADATA UTAMA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
              {dokumen.kategori?.nama_kategori || "Tanpa Kategori"}
            </span>
            <h2 className="text-2xl font-bold text-slate-800">{dokumen.judul}</h2>
            <p className="text-slate-500">{dokumen.deskripsi || "Tidak ada deskripsi."}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="text-slate-400 font-semibold">Nomor Dokumen</p>
                <p className="text-slate-800 font-medium">{dokumen.nomor_dokumen || "-"}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold">Tanggal / Tahun</p>
                <p className="text-slate-800 font-medium">{dokumen.tanggal || dokumen.tahun || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center w-full md:w-auto shrink-0">
            <FileText size={48} className="mx-auto text-blue-500 mb-3" />
            <p className="text-sm font-semibold text-slate-700 mb-3">File Saat Ini (Terbaru)</p>
            {dokumen.file_url ? (
              <a 
                href={dokumen.file_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full justify-center"
              >
                <Download size={18} /> Buka File
              </a>
            ) : (
              <p className="text-sm text-slate-400 italic">Belum ada file</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FORM UPLOAD VERSI BARU */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UploadCloud size={20} className="text-blue-600" /> Upload Revisi Baru
          </h3>
          <form onSubmit={handleUploadVersi} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih File Baru (PDF/Gambar)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all border border-slate-300 rounded-lg p-1"
                onChange={(e) => setFileBaru(e.target.files ? e.target.files[0] : null)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan Revisi</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Perbaikan salah ketik nomor surat"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={sedangUpload || !fileBaru}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {sedangUpload ? "Mengunggah Revisi..." : "Upload Revisi"}
            </button>
          </form>
        </div>

        {/* RIWAYAT VERSI */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <History size={20} className="text-blue-600" /> Riwayat Revisi
          </h3>
          {riwayat.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">
              Belum ada riwayat revisi untuk dokumen ini.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {riwayat.map((v) => (
                <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3">
                  <div className="p-2 bg-white rounded text-slate-400 shadow-sm shrink-0">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{v.keterangan_revisi}</p>
                    <p className="text-xs text-slate-500 mb-1">{new Date(v.created_at).toLocaleString('id-ID')}</p>
                    <a href={v.file_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                      Lihat File Revisi
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DetailDokumen() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <DetailDokumenContent />
    </Suspense>
  );
}