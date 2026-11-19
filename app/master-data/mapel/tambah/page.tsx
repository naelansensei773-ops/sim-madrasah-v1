"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahMapel() {
  const router = useRouter();

  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  async function simpanMapel() {
    if (!kode.trim() || !nama.trim()) {
      alert("Kode dan Nama Mapel wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .insert([
        {
          kode_mapel: kode,
          nama_mapel: nama,
        },
      ]);

    setLoading(false);

    if (error) {
      alert("Gagal menyimpan mapel: " + error.message);
      return;
    }

    router.push("/master-data/mapel");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Tambah Mata Pelajaran</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Kode Mapel (Cth: MAP001)"
          value={kode}
          onChange={(e) => setKode(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Nama Mapel (Cth: Matematika)"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <div className="flex space-x-2">
          <button
            onClick={simpanMapel}
            disabled={loading}
            className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
          
          <button
            onClick={() => router.push("/master-data/mapel")}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}