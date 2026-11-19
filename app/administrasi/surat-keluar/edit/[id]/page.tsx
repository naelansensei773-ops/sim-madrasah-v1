"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, UploadCloud, FileText } from "lucide-react";

function EditSuratKeluarContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [nomor, setNomor] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [tujuan, setTujuan] = useState("");
  const [perihal, setPerihal] = useState("");
  const [status, setStatus] = useState("Draft");
  const [sifat, setSifat] = useState("Biasa");
  
  const [fileLama, setFileLama] = useState("");
  const [fileBaru, setFileBaru] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.schema("administrasi").from("surat_keluar").select("*").eq("id", id).single();
      
      if (error) {
        alert("Gagal memuat data: " + error.message);
        router.push("/administrasi/surat-keluar");
      } else if (data) {
        setNomor(data.nomor_surat || "");
        setTanggalSurat(data.tanggal_surat || "");
        setTujuan(data.tujuan || "");
        setPerihal(data.perihal || "");
        setStatus(data.status || "Draft");
        setSifat(data.sifat_surat || "Biasa");
        setFileLama(data.file_url || "");
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!nomor || !tujuan || !perihal) return alert("Nomor, Tujuan, dan Perihal wajib diisi!");
    
    setSedangSimpan(true);
    let finalFileUrl = fileLama;

    try {
      if (fileBaru) {
        if (fileBaru.size > 5 * 1024 * 1024) throw new Error("Ukuran file maksimal 5MB");
        const fileExt = fileBaru.name.split('.').pop();
        const fileName = `surat_keluar_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, fileBaru);
        if (uploadError) throw new Error("Gagal upload file: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        finalFileUrl = publicUrlData.publicUrl;
        
        if (fileLama) {
          const oldFileName = fileLama.split("/").pop();
          if (oldFileName) await supabase.storage.from("documents").remove([oldFileName]);
        }
      }

      const { error: dbError } = await supabase.schema("administrasi").from("surat_keluar").update({
        nomor_surat: nomor,
        tanggal_surat: tanggalSurat || null,
        tujuan: tujuan,
        perihal: perihal,
        status: status,
        sifat_surat: sifat,
        file_url: finalFileUrl
      }).eq("id", id);

      if (dbError) throw new Error("Gagal simpan ke database: " + dbError.message);
      router.push("/administrasi/surat-keluar");

    } catch (error: any) {
      alert(error.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data surat...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Surat Keluar</h1>
          <p className="text-slate-500 text-sm mt-1">Perbarui status atau perbaiki data surat.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Surat</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={nomor} onChange={(e) => setNomor(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tujuan / Instansi</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tujuan} onChange={(e) => setTujuan(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Surat</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" value={tanggalSurat} onChange={(e) => setTanggalSurat(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sifat Surat</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500" value={sifat} onChange={(e) => setSifat(e.target.value)}>
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Status Surat</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 font-medium" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Draft">Draft (Konsep)</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Perihal Surat</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500" rows={2} value={perihal} onChange={(e) => setPerihal(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">File Scan Surat</label>
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer block">
              {fileBaru ? (
                <>
                  <FileText size={32} className="mx-auto text-blue-500 mb-2" />
                  <p className="text-sm text-blue-600 font-bold">{fileBaru.name}</p>
                  <p className="text-xs text-slate-500 mt-1">File baru terpilih (akan menggantikan file lama)</p>
                </>
              ) : (
                <>
                  <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 font-medium">
                    {fileLama ? "Klik untuk mengganti file saat ini" : "Klik atau seret file ke sini"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Biarkan kosong jika tidak ingin mengubah file</p>
                </>
              )}
              <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files && e.target.files.length > 0) setFileBaru(e.target.files[0]); }} />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={sedangSimpan} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50">
              <Save size={18} /> {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button type="button" onClick={() => router.push("/administrasi/surat-keluar")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 transition-colors">
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditSuratKeluar() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Memuat halaman...</div>}>
      <EditSuratKeluarContent />
    </Suspense>
  );
}