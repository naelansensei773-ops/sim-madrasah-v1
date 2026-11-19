"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, UploadCloud, File } from "lucide-react";

export default function UploadDokumen() {
  const router = useRouter();
  
  const [daftarKategori, setDaftarKategori] = useState<any[]>([]);
  
  const [kategoriId, setKategoriId] = useState("");
  const [judul, setJudul] = useState("");
  const [nomor, setNomor] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [tahun, setTahun] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ambil daftar kategori untuk dropdown
  useEffect(() => {
    async function fetchKategori() {
      const { data } = await supabase.schema("arsip").from("kategori").select("id, nama_kategori").order("nama_kategori");
      if (data) setDaftarKategori(data);
    }
    fetchKategori();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!judul || !kategoriId) return alert("Judul dan Kategori wajib diisi!");
    
    setLoading(true);
    let fileUrl = "";

    try {
      // 1. PROSES UPLOAD FILE KE SUPABASE STORAGE (Jika ada file yang dipilih)
      if (file) {
        // Validasi ukuran (maks 5MB)
        if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran file maksimal 5MB");

        // Buat nama file unik (waktu_sekarang_namafile)
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(fileName, file);

        if (uploadError) throw new Error("Gagal upload file: " + uploadError.message);

        // Ambil URL publik dari file yang baru di-upload
        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }

      // 2. SIMPAN DATA KE TABEL DATABASE
      const { error: dbError } = await supabase.schema("arsip").from("dokumen").insert([{
        kategori_id: kategoriId,
        judul: judul,
        nomor_dokumen: nomor,
        tanggal: tanggal || null,
        tahun: tahun,
        deskripsi: deskripsi,
        file_url: fileUrl
      }]);

      if (dbError) throw new Error("Gagal simpan ke database: " + dbError.message);

      // Sukses!
      router.push("/arsip/dokumen");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Upload Dokumen</h1>
          <p className="text-slate-500 text-sm mt-1">Tambahkan file dan informasi dokumen arsip.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleUpload} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Dokumen</label>
              <select
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                value={kategoriId}
                onChange={(e) => setKategoriId(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {daftarKategori.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama_kategori}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Dokumen</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: SK Pembagian Tugas"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Dokumen</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Opsional"
                value={nomor}
                onChange={(e) => setNomor(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Dokumen</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tahun</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                placeholder="Cth: 2026"
                value={tahun}
                onChange={(e) => setTahun(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Deskripsi Singkat</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Penjelasan isi dokumen..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
          </div>

          {/* INPUT FILE UPLOAD DENGAN TAG LABEL (ANTI GAGAL) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File Dokumen (PDF/Gambar, Maks 5MB)</label>
            
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer block">
              {file ? (
                <>
                  <File size={32} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-blue-600 font-bold">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Klik untuk mengganti file</p>
                </>
              ) : (
                <>
                  <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Klik atau seret file ke sini untuk mengunggah</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, atau PNG</p>
                </>
              )}
              
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={18} /> {loading ? "Mengunggah..." : "Simpan & Upload"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/arsip/dokumen")}
              className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}