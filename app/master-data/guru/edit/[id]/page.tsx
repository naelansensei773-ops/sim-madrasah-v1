"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditGuruContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nama, setNama] = useState("");
  const [nuptk, setNuptk] = useState("");
  const [email, setEmail] = useState("");
  const [statusAktif, setStatusAktif] = useState(true); // STATE BARU UNTUK STATUS
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuru() {
      const { data, error } = await supabase
        .schema("master")
        .from("guru")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Gagal memuat data: " + error.message);
      } else if (data) {
        setNama(data.nama_lengkap);
        setNuptk(data.nuptk || "");
        setEmail(data.email || "");
        // Set status aktif dari database (jika null, anggap true)
        setStatusAktif(data.status_aktif ?? true); 
      }
      setLoading(false);
    }

    fetchGuru();
  }, [id]);

  async function simpanPerubahan() {
    if (!nama.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("guru")
      .update({
        nama_lengkap: nama,
        nuptk,
        email,
        status_aktif: statusAktif, // SIMPAN STATUS KE DATABASE
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Gagal mengubah data: " + error.message);
      return;
    }

    router.push("/master-data/guru");
  }

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Guru</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="NUPTK"
          value={nuptk}
          onChange={(e) => setNuptk(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            Guru Aktif (Centang jika masih aktif mengajar)
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
            onClick={() => router.push("/master-data/guru")}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditGuru() {
  return (
    <Suspense fallback={<p className="p-6">Memuat halaman edit...</p>}>
      <EditGuruContent />
    </Suspense>
  );
}