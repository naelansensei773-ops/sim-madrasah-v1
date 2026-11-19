"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function EditSiswaContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [rombelId, setRombelId] = useState("");
  const [statusSiswa, setStatusSiswa] = useState("Aktif"); // STATE BARU UNTUK STATUS
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Ambil data siswa
      const { data: dataSiswa, error: errorSiswa } = await supabase
        .schema("master")
        .from("siswa")
        .select("*")
        .eq("id", id)
        .single();

      if (errorSiswa) {
        alert("Gagal memuat data siswa: " + errorSiswa.message);
      } else if (dataSiswa) {
        setNis(dataSiswa.nis || "");
        setNama(dataSiswa.nama_lengkap);
        setRombelId(dataSiswa.rombel_id || "");
        setStatusSiswa(dataSiswa.status_siswa || "Aktif"); // Ambil status dari DB
      }

      // 2. Ambil data rombel
      const { data: dataRombel } = await supabase
        .schema("master")
        .from("rombel")
        .select("id, nama_rombel")
        .eq("status_aktif", true)
        .order("nama_rombel");

      if (dataRombel) setDaftarRombel(dataRombel);

      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function simpanPerubahan() {
    if (!nama.trim()) {
      alert("Nama lengkap wajib diisi.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .schema("master")
      .from("siswa")
      .update({
        nis: nis,
        nama_lengkap: nama,
        rombel_id: rombelId === "" ? null : rombelId,
        status_siswa: statusSiswa, // SIMPAN STATUS KE DATABASE
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      alert("Gagal mengubah data: " + error.message);
      return;
    }

    router.push("/master-data/siswa");
  }

  if (loading) return <p className="p-6">Memuat data...</p>;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Edit Siswa</h1>

      <div className="max-w-md space-y-3">
        <input
          className="w-full border p-2"
          placeholder="NIS"
          value={nis}
          onChange={(e) => setNis(e.target.value)}
        />

        <input
          className="w-full border p-2"
          placeholder="Nama Lengkap"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        <select
          className="w-full border p-2 bg-white"
          value={rombelId}
          onChange={(e) => setRombelId(e.target.value)}
        >
          <option value="">-- Belum Masuk Kelas --</option>
          {daftarRombel.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nama_rombel}
            </option>
          ))}
        </select>

        {/* DROPDOWN STATUS SISWA BARU */}
        <select
          className="w-full border p-2 bg-white"
          value={statusSiswa}
          onChange={(e) => setStatusSiswa(e.target.value)}
        >
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
        </select>

        <div className="flex space-x-2">
          <button
            onClick={simpanPerubahan}
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          
          <button
            onClick={() => router.push("/master-data/siswa")}
            className="rounded bg-gray-500 px-4 py-2 text-white"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditSiswa() {
  return (
    <Suspense fallback={<p className="p-6">Memuat halaman edit...</p>}>
      <EditSiswaContent />
    </Suspense>
  );
}