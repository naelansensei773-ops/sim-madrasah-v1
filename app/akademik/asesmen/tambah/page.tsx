"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function TambahAsesmen() {
  const router = useRouter();
  const [daftarMapel, setDaftarMapel] = useState<any[]>([]);
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);

  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("PTS");
  const [mapelId, setMapelId] = useState("");
  const [rombelId, setRombelId] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel").eq("aktif", true).order("nama_mapel");
      if (mapel) setDaftarMapel(mapel);
      
      const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (rombel) setDaftarRombel(rombel);
    }
    fetchData();
    setTanggal(new Date().toISOString().split("T")[0]);
  }, []);

  async function simpan() {
    if (!nama || !mapelId || !rombelId || !tanggal) return alert("Isi semua kolom!");
    setLoading(true);
    const { error } = await supabase.schema("akademik").from("asesmen").insert([{
      nama_asesmen: nama, jenis, mapel_id: mapelId, rombel_id: rombelId, tanggal
    }]);
    setLoading(false);

    if (error) alert(error.message);
    else router.push("/akademik/asesmen");
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Buat Asesmen Baru</h1>
      <div className="max-w-md space-y-3">
        <input className="w-full border p-2" placeholder="Nama Asesmen (Cth: PTS Ganjil)" value={nama} onChange={(e) => setNama(e.target.value)} />
        
        <select className="w-full border p-2 bg-white" value={jenis} onChange={(e) => setJenis(e.target.value)}>
          {["PTS", "PAS", "Formatif", "Sumatif", "Praktik", "Proyek"].map((j) => <option key={j} value={j}>{j}</option>)}
        </select>

        <select className="w-full border p-2 bg-white" value={mapelId} onChange={(e) => setMapelId(e.target.value)}>
          <option value="">-- Pilih Mapel --</option>
          {daftarMapel.map((m) => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)}
        </select>

        <select className="w-full border p-2 bg-white" value={rombelId} onChange={(e) => setRombelId(e.target.value)}>
          <option value="">-- Pilih Kelas --</option>
          {daftarRombel.map((r) => <option key={r.id} value={r.id}>{r.nama_rombel}</option>)}
        </select>

        <input type="date" className="w-full border p-2" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />

        <div className="flex space-x-2 pt-2">
          <button onClick={simpan} disabled={loading} className="rounded bg-green-600 px-4 py-2 text-white">{loading ? "Menyimpan..." : "Simpan"}</button>
          <button onClick={() => router.push("/akademik/asesmen")} className="rounded bg-gray-500 px-4 py-2 text-white">Batal</button>
        </div>
      </div>
    </div>
  );
}