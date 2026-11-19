"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahPengampu() {
  const router = useRouter();

  const [daftarGuru, setDaftarGuru] = useState<any[]>([]);
  const [daftarMapel, setDaftarMapel] = useState<any[]>([]);
  
  const [guruId, setGuruId] = useState("");
  const [mapelId, setMapelId] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [loading, setLoading] = useState(false);

  // Ambil data Guru dan Mapel saat halaman dibuka
  useEffect(() => {
    async function fetchDropdownData() {
      // Ambil Guru yang aktif saja
      const { data: guru } = await supabase
        .schema("master")
        .from("guru")
        .select("id, nama_lengkap")
        .eq("status_aktif", true)
        .order("nama_lengkap");
      if (guru) setDaftarGuru(guru);

      // Ambil Mapel yang aktif saja
      const { data: mapel } = await supabase
        .schema("master")
        .from("mata_pelajaran")
        .select("id, nama_mapel")
        .eq("aktif", true)
        .order("nama_mapel");
      if (mapel) setDaftarMapel(mapel);
    }

    fetchDropdownData();
  }, []);

  async function simpan() {
    if (!guruId || !mapelId || !tahunAjaran) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("akademik")
      .from("pengampu_mapel")
      .insert([
        {
          guru_id: guruId,
          mapel_id: mapelId,
          tahun_ajaran: tahunAjaran,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan: " + error.message);
      return;
    }

    router.push("/akademik/pengampu");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tambah Pengampu Mapel</h1>

      <div className="max-w-md space-y-3">
        
        {/* Dropdown Pilih Guru */}
        <select
          className="w-full border p-2 bg-white"
          value={guruId}
          onChange={(e) => setGuruId(e.target.value)}
        >
          <option value="">-- Pilih Guru --</option>
          {daftarGuru.map((g) => (
            <option key={g.id} value={g.id}>{g.nama_lengkap}</option>
          ))}
        </select>

        {/* Dropdown Pilih Mapel */}
        <select
          className="w-full border p-2 bg-white"
          value={mapelId}
          onChange={(e) => setMapelId(e.target.value)}
        >
          <option value="">-- Pilih Mata Pelajaran --</option>
          {daftarMapel.map((m) => (
            <option key={m.id} value={m.id}>{m.nama_mapel}</option>
          ))}
        </select>

        {/* Input Tahun Ajaran */}
        <select
          className="w-full border p-2 bg-white"
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
        >
          <option value="2024/2025">2024/2025</option>
          <option value="2025/2026">2025/2026</option>
          <option value="2026/2027">2026/2027</option>
        </select>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={simpan}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          
          <button
            onClick={() => router.push("/akademik/pengampu")}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}