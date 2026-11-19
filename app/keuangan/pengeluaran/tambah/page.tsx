"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, UploadCloud, FileText } from "lucide-react";

export default function TambahPengeluaran() {
  const router = useRouter();
  
  const [daftarSumber, setDaftarSumber] = useState<any[]>([]);
  const [daftarRekening, setDaftarRekening] = useState<any[]>([]);
  
  const [sumberDanaId, setSumberDanaId] = useState("");
  const [rekeningAnggaranId, setRekeningAnggaranId] = useState("");
  const [nomorBukti, setNomorBukti] = useState("");
  const [tanggal, setTanggal] = useState(""); 
  const [kategori, setKategori] = useState("ATK");
  const [keterangan, setKeterangan] = useState("");
  const [nominal, setNominal] = useState<number | "">("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTanggal(new Date().toISOString().split("T")[0]);

    async function fetchReferensi() {
      const { data: sum } = await supabase.schema("keuangan").from("sumber_dana").select("id, nama_dana").order("nama_dana");
      if (sum) setDaftarSumber(sum);

      const { data: rek } = await supabase.schema("keuangan").from("rekening_anggaran").select("id, kode_rekening, nama_rekening").order("kode_rekening");
      if (rek) setDaftarRekening(rek);
    }
    fetchReferensi();
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!sumberDanaId || !rekeningAnggaranId) return alert("Sumber Dana dan Rekening Anggaran wajib dipilih!");
    if (!tanggal || !keterangan || !nominal) return alert("Semua kolom wajib diisi!");
    
    setLoading(true);
    let fileUrl = "";

    try {
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran file maksimal 5MB");
        const fileExt = file.name.split('.').pop();
        const fileName = `nota_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from("documents").upload(fileName, file);
        if (uploadError) throw new Error("Gagal upload file: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from("documents").getPublicUrl(fileName);
        fileUrl = publicUrlData.publicUrl;
      }

      const { error: dbError } = await supabase.schema("keuangan").from("pengeluaran").insert([{
        sumber_dana_id: sumberDanaId,
        rekening_anggaran_id: rekeningAnggaranId,
        nomor_bukti: nomorBukti,
        tanggal: tanggal,
        kategori: kategori,
        keterangan: keterangan,
        nominal: Number(nominal),
        bukti_nota_url: fileUrl,
        status_spj: 'Draft' // Default awal
      }]);

      if (dbError) throw new Error("Gagal simpan ke database: " + dbError.message);
      router.push("/keuangan/pengeluaran");

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
          <h1 className="text-2xl font-bold text-slate-800">Catat Pengeluaran</h1>
          <p className="text-slate-500 text-sm mt-1">Masukkan data belanja, rekening, dan sumber dana.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Bukti (Opsional)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Cth: BKK-001/2024" value={nomorBukti} onChange={(e) => setNomorBukti(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Sumber Dana (Wajib)</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-blue-700" value={sumberDanaId} onChange={(e) => setSumberDanaId(e.target.value)} required>
                <option value="">-- Pilih Sumber Dana --</option>
                {daftarSumber.map(s => <option key={s.id} value={s.id}>{s.nama_dana}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Rekening Anggaran (Wajib)</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={rekeningAnggaranId} onChange={(e) => setRekeningAnggaranId(e.target.value)} required>
                <option value="">-- Pilih Rekening --</option>
                {daftarRekening.map(r => <option key={r.id} value={r.id}>{r.kode_rekening} - {r.nama_rekening}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nominal Pengeluaran (Rp)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-bold text-red-600" placeholder="Cth: 150000" value={nominal} onChange={(e) => setNominal(Number(e.target.value))} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Uraian / Keterangan Belanja</label>
            <textarea className="w-full px-4 py-2.5 rounded-lg border border-slate-300" rows={3} placeholder="Cth: Beli 5 rim kertas HVS" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Upload Bukti Nota / Kwitansi (Opsional)</label>
            <label htmlFor="file-upload" className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer block">
              {file ? (
                <><FileText size={32} className="mx-auto text-blue-500 mb-2" /><p className="text-sm text-blue-600 font-bold">{file.name}</p></>
              ) : (
                <><UploadCloud size={32} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-600 font-medium">Klik atau seret foto nota ke sini</p></>
              )}
              <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} />
            </label>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
            </button>
            <button type="button" onClick={() => router.push("/keuangan/pengeluaran")} className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100">Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}