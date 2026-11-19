"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, UploadCloud, FileText } from "lucide-react";

export default function TambahPenerimaanDana() {
  const router = useRouter();
  const [daftarSumber, setDaftarSumber] = useState<any[]>([]);
  
  // State tanggal dikosongkan dulu
  const [sumberDanaId, setSumberDanaId] = useState("");
  const [tanggal, setTanggal] = useState(""); 
  const [nominal, setNominal] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Ambil data sumber dana
    async function fetchSumber() {
      const { data } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana").order("nama_dana");
      if (data) setDaftarSumber(data);
    }
    fetchSumber();

    // 2. Set tanggal hari ini setelah komponen dimuat di browser
    setTanggal(new Date().toISOString().split("T")[0]);
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!sumberDanaId || !tanggal || !nominal) return alert("Isi semua kolom wajib!");
    
    setLoading(true);
    let fileUrl = "";

    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `penerimaan_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
        if (uploadError) throw new Error(uploadError.message);
        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.schema("keuangan").from("penerimaan_dana").insert([{
        sumber_dana_id: sumberDanaId,
        tanggal: tanggal,
        nominal: Number(nominal),
        keterangan: keterangan,
        bukti_url: fileUrl
      }]);

      if (dbError) throw new Error(dbError.message);
      router.push("/keuangan/penerimaan-dana");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Input Penerimaan Dana</h1>
          <p className="text-slate-500 text-sm mt-1">Catat uang masuk dari pemerintah (BOS/BOSDA).</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={sumberDanaId} onChange={(e) => setSumberDanaId(e.target.value)} required>
                <option value="">-- Pilih Sumber Dana --</option>
                {daftarSumber.map(s => <option key={s.id} value={s.id}>{s.nama_dana}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Masuk</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal (Rp)</label>
            <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-green-600" placeholder="Cth: 50000000" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan (Cth: Pencairan Tahap 1)</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Bukti Transfer / SK (Opsional)</label>
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer block">
              {file ? (
                <><FileText size={32} className="mx-auto text-blue-500 mb-2" /><p className="text-sm text-blue-600 font-bold">{file.name}</p></>
              ) : (
                <><UploadCloud size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-600 font-medium">Klik untuk upload bukti</p></>
              )}
              <input id="file-upload" type="file" className="hidden" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Dana Masuk"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}