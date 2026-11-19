"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, UploadCloud, FileText } from "lucide-react";

export default function TambahSuratMasuk() {
  const router = useRouter();
  
  const [nomor, setNomor] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [tanggalDiterima, setTanggalDiterima] = useState("");
  const [pengirim, setPengirim] = useState("");
  const [perihal, setPerihal] = useState("");
  const [status, setStatus] = useState("Baru");
  const [sifat, setSifat] = useState("Biasa"); // STATE BARU
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!nomor || !pengirim || !perihal) return alert("Nomor, Pengirim, dan Perihal wajib diisi!");
    
    setLoading(true);
    let fileUrl = "";

    try {
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran file maksimal 5MB");
        const fileExt = file.name.split('.').pop();
        const fileName = `surat_masuk_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
        if (uploadError) throw new Error("Gagal upload file: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.schema("administrasi").from("surat_masuk").insert([{
        nomor_surat: nomor,
        tanggal_surat: tanggalSurat || null,
        tanggal_diterima: tanggalDiterima || null,
        pengirim: pengirim,
        perihal: perihal,
        status: status,
        sifat_surat: sifat, // SIMPAN SIFAT
        file_url: fileUrl
      }]);

      if (dbError) throw new Error("Gagal simpan ke database: " + dbError.message);
      router.push("/administrasi/surat-masuk");

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
          <h1 className="text-2xl font-bold text-slate-800">Tambah Surat Masuk</h1>
          <p className="text-slate-500 text-sm mt-1">Catat detail surat yang baru saja diterima.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Surat</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: B-123/Kemenag/2026" value={nomor} onChange={(e) => setNomor(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pengirim / Instansi</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" placeholder="Cth: Kementerian Agama" value={pengirim} onChange={(e) => setPengirim(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Surat</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tanggalSurat} onChange={(e) => setTanggalSurat(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Diterima</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tanggalDiterima} onChange={(e) => setTanggalDiterima(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sifat Surat</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={sifat} onChange={(e) => setSifat(e.target.value)}>
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status Awal</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Perihal Surat</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Cth: Undangan Rapat Evaluasi Kurikulum" value={perihal} onChange={(e) => setPerihal(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File Scan Surat (Opsional)</label>
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer block">
              {file ? (
                <>
                  <FileText size={32} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-blue-600 font-bold">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">Klik untuk mengganti file</p>
                </>
              ) : (
                <>
                  <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Klik atau seret file ke sini</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, JPG, atau PNG (Maks 5MB)</p>
                </>
              )}
              <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]); }} />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Surat"}
            </button>
            <button type="button" onClick={() => router.push("/administrasi/surat-masuk")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}