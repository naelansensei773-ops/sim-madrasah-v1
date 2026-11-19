"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AsesmenPage() {
  const [asesmen, setAsesmen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.schema("akademik").from("asesmen").select("*").order("tanggal", { ascending: false });
    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");
    const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel");

    const merged = (data || []).map((a) => ({
      ...a,
      nama_mapel: mapel?.find((m) => m.id === a.mapel_id)?.nama_mapel || "-",
      nama_rombel: rombel?.find((r) => r.id === a.rombel_id)?.nama_rombel || "-",
    }));

    setAsesmen(merged);
    setLoading(false);
  }

  async function hapusAsesmen(id: string) {
    if (!confirm("Hapus asesmen ini beserta seluruh nilainya?")) return;
    await supabase.schema("akademik").from("asesmen").delete().eq("id", id);
    loadData();
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Asesmen</h1>
        <Link href="/akademik/asesmen/tambah" className="rounded bg-blue-600 px-4 py-2 text-white">
          Buat Asesmen
        </Link>
      </div>

      {loading ? <p>Memuat...</p> : (
        <table className="w-full border-collapse border text-sm bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">Nama Asesmen</th>
              <th className="border p-2 text-left">Jenis</th>
              <th className="border p-2 text-left">Mapel</th>
              <th className="border p-2 text-left">Kelas</th>
              <th className="border p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {asesmen.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.tanggal}</td>
                <td className="border p-2 font-medium">{row.nama_asesmen}</td>
                <td className="border p-2">{row.jenis}</td>
                <td className="border p-2">{row.nama_mapel}</td>
                <td className="border p-2">{row.nama_rombel}</td>
                <td className="border p-2 text-center">
                  <button onClick={() => hapusAsesmen(row.id)} className="text-red-600 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}