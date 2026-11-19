"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahJadwal() {
  const router = useRouter();

  // State untuk Dropdown
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [daftarMapel, setDaftarMapel] = useState<any[]>([]);

  // State untuk Form
  const [hari, setHari] = useState("Senin");
  const [jamKe, setJamKe] = useState("1");
  const [jamMulai, setJamMulai] = useState("07:00");
  const [jamSelesai, setJamSelesai] = useState("07:45");
  const [rombelId, setRombelId] = useState("");
  const [guruId, setGuruId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [loading, setLoading] = useState(false);

  // Ambil data untuk dropdown
  useEffect(() => {
    async function fetchDropdownData() {
      const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (rombel) setDaftarRombel(rombel);

      const { data: guru } = await supabase.schema("master").from("guru").select("id, nama_lengkap").eq("status_aktif", true).order("nama_lengkap");
      if (guru) setDaftarGuru(guru);

      const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel").eq("aktif", true).order("nama_mapel");
      if (mapel) setDaftarMapel(mapel);
    }

    fetchDropdownData();
  }, []);

  async function simpan() {
    if (!rombelId || !guruId || !mapelId || !hari || !jamMulai || !jamSelesai) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("akademik")
      .from("jadwal_pelajaran")
      .insert([
        {
          hari: hari,
          jam_ke: jamKe,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          rombel_id: rombelId,
          guru_id: guruId,
          mapel_id: mapelId,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      return;
    }

    router.push("/akademik/jadwal");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tambah Jadwal Pelajaran</h1>

      <div className="max-w-md space-y-3">
        
        {/* Pilih Hari */}
        <select className="w-full border p-2 bg-white" value={hari} onChange={(e) => setHari(e.target.value)}>
          {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        {/* Jam Ke */}
        <input className="w-full border p-2" placeholder="Jam Ke (Cth: 1)" type="number" value={jamKe} onChange={(e) => setJamKe(e.target.value)} />

        {/* Jam Mulai & Selesai */}
        <div className="flex space-x-2">
          <input className="w-1/2 border p-2" placeholder="Mulai (07:00)" type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} />
          <input className="w-1/2 border p-2" placeholder="Selesai (07:45)" type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} />
        </div>

        {/* Pilih Rombel */}
        <select className="w-full border p-2 bg-white" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
          <option value="">-- Pilih Rombel --</option>
          {daftarRombel.map((r) => (
            <option key={r.id} value={r.id}>{r.nama_rombel}</option>
          ))}
        </select>

        {/* Pilih Mapel */}
        <select className="w-full border p-2 bg-white" value={mapelId} onChange={(e) => setMapelId(e.target.value)}>
          <option value="">-- Pilih Mata Pelajaran --</option>
          {daftarMapel.map((m) => (
            <option key={m.id} value={m.id}>{m.nama_mapel}</option>
          ))}
        </select>

        {/* Pilih Guru */}
        <select className="w-full border p-2 bg-white" value={guruId} onChange={(e) => setGuruId(e.target.value)}>
          <option value="">-- Pilih Guru Pengampu --</option>
          {daftarGuru.map((g) => (
            <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
          ))}
        </select>

        <div className="flex space-x-2 pt-2">
          <button onClick={simpan} disabled={loading} className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          <button onClick={() => router.push("/akademik/jadwal")} className="rounded bg-gray-500 px-4 py-2 text-white">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}