"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahRombel() {
  const router = useRouter();

  const [namaRombel, setNamaRombel] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [waliKelas, setWaliKelas] = useState("");
  const [loading, setLoading] = useState(false);

  async function simpanRombel() {
    if (!namaRombel.trim()) {
      alert("Nama Rombel wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("rombel")
      .insert([
        {
          nama_rombel: namaRombel,
          tingkat: tingkat,
          tahun_ajaran: tahunAjaran,
          wali_kelas: waliKelas,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan rombel: " + error.message);
      return;
    }

    router.push("/master-data/rombel");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tambah Rombel</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Nama Rombel (Cth: X IPA 1)"
          value={namaRombel}
          onChange={(e) => setNamaRombel(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Tingkat (Cth: 10)"
          value={tingkat}
          onChange={(e) => setTingkat(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Tahun Ajaran (Cth: 2024/2025)"
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Wali Kelas"
          value={waliKelas}
          onChange={(e) => setWaliKelas(e.target.value)}
        />

        <div className="flex space-x-2">
          <button
            onClick={simpanRombel}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          
          <button
            onClick={() => router.push("/master-data/rombel")}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}