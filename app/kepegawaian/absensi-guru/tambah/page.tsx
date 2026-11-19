"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";

export default function TambahAbsensiGuru() {
  const router = useRouter();
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  
  const [guruId, setGuruId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [jamMasuk, setJamMasuk] = useState("07:00");
  const [jamPulang, setJamPulang] = useState("14:00");
  const [status, setStatus] = useState("Hadir");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTanggal(new Date().toISOString().split("T")[0]);
    
    async function fetchGuru() {
      const { data } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
      if (data) setDaftarGuru(data);
    }
    fetchGuru();
  }, []);

  async function handleSimpan(e: React.FormEvent) {
    e.preventDefault();
    if (!guruId || !tanggal) return alert("Pilih Guru dan Tanggal!");
    
    setLoading(true);
    const { error } = await supabase.schema("kepegawaian").from("absensi_guru").insert([{
      guru_id: guruId,
      tanggal: tanggal,
      jam_masuk: status === "Hadir" ? jamMasuk : null,
      jam_pulang: status === "Hadir" ? jamPulang : null,
      status: status,
      keterangan: keterangan
    }]);

    setLoading(false);
    if (error) {
      if (error.code === '23505') alert("Guru ini sudah diinput absensinya untuk tanggal tersebut!");
      else alert("Gagal menyimpan: " + error.message);
    } else {
      router.push("/kepegawaian/absensi-guru");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Input Absensi Guru</h1>
          <p className="text-slate-500 text-sm mt-1">Catat kehadiran guru pada hari ini.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSimpan} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Guru</label>
              <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white" value={guruId} onChange={(e) => setGuruId(e.target.value)} required>
                <option value="">-- Pilih Guru --</option>
                {daftarGuru.map(g => <option key={g.id} value={g.id}>{g.nama_lengkap}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Kehadiran</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white font-bold text-blue-700" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Hadir">Hadir</option>
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Tugas Luar">Tugas Luar</option>
              <option value="Alpa">Alpa (Tanpa Keterangan)</option>
            </select>
          </div>

          {/* Jam hanya muncul jika Hadir */}
          {status === "Hadir" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jam Masuk</label>
                <input type="time" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={jamMasuk} onChange={(e) => setJamMasuk(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Jam Pulang</label>
                <input type="time" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" value={jamPulang} onChange={(e) => setJamPulang(e.target.value)} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan Tambahan (Opsional)</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-300" placeholder="Cth: Sakit demam, izin urusan keluarga" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50">
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Absensi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}