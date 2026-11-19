"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahJurnal() {
  const router = useRouter();

  // Dropdown states
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [daftarMapel, setDaftarMapel] = useState<any[]>([]);
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);

  // Form states
  const [tanggal, setTanggal] = useState("");
  const [guruId, setGuruId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [rombelId, setRombelId] = useState("");
  const [materi, setMateri] = useState("");
  const [metode, setMetode] = useState("");
  const [hadir, setHadir] = useState(0);
  const [tidakHadir, setTidakHadir] = useState(0);
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil data untuk dropdown
  useEffect(() => {
    async function fetchDropdownData() {
      const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
      if (guru) setDaftarGuru(guru);

      const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel").eq("aktif", true).order("nama_mapel");
      if (mapel) setDaftarMapel(mapel);

      const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (rombel) setDaftarRombel(rombel);
    }

    fetchDropdownData();
    
    // Set tanggal default ke hari ini
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);
  }, []);

  async function simpan() {
    if (!tanggal || !guruId || !mapelId || !rombelId || !materi) {
      alert("Tanggal, Guru, Mapel, Rombel, dan Materi wajib diisi!");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("akademik")
      .from("jurnal_mengajar")
      .insert([
        {
          tanggal: tanggal,
          guru_id: guruId,
          mapel_id: mapelId,
          rombel_id: rombelId,
          materi: materi,
          metode: metode,
          jumlah_hadir: hadir,
          jumlah_tidak_hadir: tidakHadir,
          catatan: catatan,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      return;
    }

    router.push("/akademik/jurnal");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tambah Jurnal Mengajar</h1>

      <div className="max-w-xl space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input className="w-full border p-2 rounded" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          
          {/* Rombel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas / Rombel</label>
            <select className="w-full border p-2 rounded bg-white" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
              <option value="">-- Pilih Rombel --</option>
              {daftarRombel.map((r) => (
                <option key={r.id} value={r.id}>{r.nama_rombel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Guru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengajar</label>
            <select className="w-full border p-2 rounded bg-white" value={guruId} onChange={(e) => setGuruId(e.target.value)}>
              <option value="">-- Pilih Guru --</option>
              {daftarGuru.map((g) => (
                <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
              ))}
            </select>
          </div>

          {/* Mapel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
            <select className="w-full border p-2 rounded bg-white" value={mapelId} onChange={(e) => setMapelId(e.target.value)}>
              <option value="">-- Pilih Mapel --</option>
              {daftarMapel.map((m) => (
                <option key={m.id} value={m.id}>{m.nama_mapel}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Materi Pembelajaran</label>
          <input className="w-full border p-2 rounded" placeholder="Cth: Teks Narasi" value={materi} onChange={(e) => setMateri(e.target.value)} />
        </div>

        {/* Metode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metode</label>
          <input className="w-full border p-2 rounded" placeholder="Cth: Diskusi Kelompok" value={metode} onChange={(e) => setMetode(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Hadir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hadir</label>
            <input className="w-full border p-2 rounded" type="number" value={hadir} onChange={(e) => setHadir(parseInt(e.target.value) || 0)} />
          </div>

          {/* Tidak Hadir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Tidak Hadir</label>
            <input className="w-full border p-2 rounded" type="number" value={tidakHadir} onChange={(e) => setTidakHadir(parseInt(e.target.value) || 0)} />
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
          <textarea className="w-full border p-2 rounded" rows={3} placeholder="Cth: Siswa aktif berdiskusi." value={catatan} onChange={(e) => setCatatan(e.target.value)} />
        </div>

        <div className="flex space-x-2 pt-2">
          <button onClick={simpan} disabled={loading} className="rounded bg-green-600 px-6 py-2 text-white disabled:opacity-50 font-semibold">
            {loading ? "Menyimpan..." : "Simpan Jurnal"}
          </button>
          <button onClick={() => router.push("/akademik/jurnal")} className="rounded bg-gray-500 px-6 py-2 text-white font-semibold">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}