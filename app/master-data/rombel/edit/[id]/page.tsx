"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditRombelContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [namaRombel, setNamaRombel] = useState("");
  const [tingkat, setTingkat] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [waliKelas, setWaliKelas] = useState("");
  const [statusAktif, setStatusAktif] = useState(true); // STATE BARU UNTUK STATUS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRombel() {
      const { data, error } = await supabase
        .schema("master")
        .from("rombel")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Gagal memuat data: " + error.message);
      } else if (data) {
        setNamaRombel(data.nama_rombel || "");
        setTingkat(data.tingkat || "");
        setTahunAjaran(data.tahun_ajaran || "");
        setWaliKelas(data.wali_kelas || "");
        setStatusAktif(data.status_aktif ?? true); // Ambil status dari DB
      }
      setLoading(false);
    }

    fetchRombel();
  }, [id]);

  async function simpanPerubahan() {
    if (!namaRombel.trim()) {
      alert("Nama Rombel wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("rombel")
      .update({
        nama_rombel: namaRombel,
        tingkat: tingkat,
        tahun_ajaran: tahunAjaran,
        wali_kelas: waliKelas,
        status_aktif: statusAktif, // SIMPAN STATUS KE DATABASE
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Gagal mengubah data: " + error.message);
      return;
    }

    router.push("/master-data/rombel");
  }

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Rombel</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Nama Rombel"
          value={namaRombel}
          onChange={(e) => setNamaRombel(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Tingkat"
          value={tingkat}
          onChange={(e) => setTingkat(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Tahun Ajaran"
          value={tahunAjaran}
          onChange={(e) => setTahunAjaran(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Wali Kelas"
          value={waliKelas}
          onChange={(e) => setWaliKelas(e.target.value)}
        />

        {/* CHECKBOX UNTUK STATUS AKTIF */}
        <div className="flex items-center space-x-2 py-2">
          <input
            type="checkbox"
            id="statusAktif"
            checked={statusAktif}
            onChange={(e) => setStatusAktif(e.target.checked)}
            className="w-5 h-5 cursor-pointer"
          />
          <label htmlFor="statusAktif" className="cursor-pointer font-medium text-gray-700">
            Rombel Aktif
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

export default function EditRombel() {
  return (
    <Suspense fallback={<p className="p-6">Memuat halaman edit...</p>}>
      <EditRombelContent />
    </Suspense>
  );
}