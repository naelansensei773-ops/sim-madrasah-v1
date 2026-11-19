"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, FileText, UploadCloud } from "lucide-react";

function EditPengeluaranContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [daftarSumber, setDaftarSumber] = useState<any[]>([]);
  const [sumberDanaId, setSumberDanaId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [kategori, setKategori] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  
  const [fileLama, setFileLama] = useState("");
  const [fileBaru, setFileBaru] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: sumber } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana").order("nama_dana");
      if (sumber) setDaftarSumber(sumber);

      const { data: pengeluaran, error } = await supabase.schema("keuangan").from("pengeluaran").select("*").eq("id", id).single();
      
      if (error) {
        alert("Gagal memuat data: " + error.message);
        router.push("/keuangan/pengeluaran");
      } else if (pengeluaran) {
        setSumberDanaId(pengeluaran.sumber_dana_id || "");
        setTanggal(pengeluaran.tanggal || "");
        setKategori(pengeluaran.kategori || "");
        setKeterangan(pengeluaran.keterangan || "");
        setNominal(pengeluaran.nominal || "");
        setFileLama(pengeluaran.bukti_nota_url || "");
      }
      setLoading(false);
    }
    fetchData();
  }, [id, router]);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!sumberDanaId || !tanggal || !keterangan || !nominal) return alert("Isi semua kolom wajib!");
    
    setSedangSimpan(true);
    let finalFileUrl = fileLama;

    try {
      if (fileBaru) {
        const fileExt = fileBaru.name.split('.').pop();
        const fileName = `nota_keluar_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, fileBaru);
        if (uploadError) throw new Error(uploadError.message);
        
        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        finalFileUrl = publicUrlData.publicUrl;
        
        if (fileLama) {
          const oldFileName = fileLama.split("/").pop();
          if (oldFileName) await supabase.storage.from("documents").remove([oldFileName]);
        }
      }

      const { error: dbError } = await supabase.schema("keuangan").from("pengeluaran").update({
        sumber_dana_id: sumberDanaId,
        tanggal: tanggal,
        kategori: kategori,
        keterangan: keterangan,
        nominal: Number(nominal),
        bukti_nota_url: finalFileUrl
      }).eq("id", id);

      if (dbError) throw new Error(dbError.message);
      router.push("/keuangan/pengeluaran");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSedangSimpan(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Pengeluaran</h1>
          <p className="text-slate-500 text-sm mt-1">Perbaiki data jika terjadi salah input.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana (Wajib)</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-blue-700" value={sumberDanaId} onChange={(e) => setSumberDanaId(e.target.value)} required>
                <option value="">-- Pilih Sumber Dana --</option>
                {daftarSumber.map(s => <option key={s.id} value={s.id}>{s.nama_dana}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori Pengeluaran</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={kategori} onChange={(e) => setKategori(e.target.value)}>
                <option value="ATK">ATK</option>
                <option value="Listrik/Air">Listrik / Air</option>
                <option value="Honor">Honor / Gaji</option>
                <option value="Pemeliharaan">Pemeliharaan</option>
                <option value="Kegiatan">Kegiatan Siswa</option>
                <option value="Sarpras">Sarana Prasarana</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal (Rp)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-red-600" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300" rows={3} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti Nota (Opsional)</label>
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer block">
              {fileBaru ? (
                <><FileText size={32} className="mx-auto text-blue-500 mb-2" /><p className="text-sm text-blue-600 font-bold">{fileBaru.name}</p></>
              ) : (
                <><UploadCloud size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-600 font-medium">{fileLama ? "Klik untuk mengganti nota" : "Klik untuk upload nota"}</p></>
              )}
              <input id="file-upload" type="file" className="hidden" onChange={(e) => { if (e.target.files) setFileBaru(e.target.files[0]); }} />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={sedangSimpan} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
              {sedangSimpan ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button type="button" onClick={() => router.push("/keuangan/pengeluaran")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditPengeluaran() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat...</div>}>
      <EditPengeluaranContent />
    </Suspense>
  );
}