"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditMapelContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [aktif, setAktif] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMapel() {
      const { data, error } = await supabase
        .schema("master")
        .from("mata_pelajaran")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Gagal memuat data: " + error.message);
      } else if (data) {
        setKode(data.kode_mapel || "");
        setNama(data.nama_mapel || "");
        setAktif(data.aktif ?? true);
      }
      setLoading(false);
    }

    fetchMapel();
  }, [id]);

  async function simpanPerubahan() {
    if (!kode.trim() || !nama.trim()) {
      alert("Kode dan Nama Mapel wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .update({
        kode_mapel: kode,
        nama_mapel: nama,
        aktif: aktif,
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Gagal mengubah data: " + error.message);
      return;
    }

    router.push("/master-data/mapel");
  }

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Mata Pelajaran</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Kode Mapel"
          value={kode}
          onChange={(e) => setKode(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Nama Mapel"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="aktif"
            checked={aktif}
            onChange={(e) => setAktif(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <label htmlFor="aktif" className="cursor-pointer font-medium text-gray-700">
            Mapel Aktif
          </label>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={simpanPerubahan}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
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

export default function EditMapel() {
  return (
    <Suspense fallback={<p className="p-6">Memuat halaman edit...</p>}>
      <EditMapelContent />
    </Suspense>
  );
}