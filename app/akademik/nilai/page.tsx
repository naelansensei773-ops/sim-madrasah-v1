"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function InputNilaiPage() {
  const [daftarAsesmen, setDaftarAsesmen] = useState<any[]>([]);
  const [asesmenId, setAsesmenId] = useState("");
  
  const [listSiswa, setListSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // Ambil daftar asesmen
  useEffect(() => {
    async function fetchAsesmen() {
      const { data } = await supabase.schema("akademik").from("asesmen").select("*").order("tanggal", { ascending: false });
      const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel");
      const { data: rombel } = await supabase.schema("master").from("rombel").select("id, nama_rombel");

      const merged = (data || []).map((a) => ({
        ...a,
        label: `${a.nama_asesmen} - ${mapel?.find((m) => m.id === a.mapel_id)?.nama_mapel} (${rombel?.find((r) => r.id === a.rombel_id)?.nama_rombel})`
      }));
      setDaftarAsesmen(merged);
    }
    fetchAsesmen();
  }, []);

  // Muat siswa ketika asesmen dipilih
  async function handlePilihAsesmen(id: string) {
    setAsesmenId(id);
    if (!id) return setListSiswa([]);

    setLoading(true);
    const asesmenTerpilih = daftarAsesmen.find((a) => a.id === id);

    // Ambil siswa di rombel tersebut
    const { data: siswa } = await supabase.schema("master").from("siswa").select("id, nama_lengkap").eq("rombel_id", asesmenTerpilih.rombel_id).eq("status_siswa", "Aktif").order("nama_lengkap");
    
    // Ambil nilai yang sudah ada
    const { data: nilai } = await supabase.schema("akademik").from("nilai_siswa").select("*").eq("asesmen_id", id);

    const merged = (siswa || []).map((s) => {
      const nilaiSiswa = nilai?.find((n) => n.siswa_id === s.id);
      return {
        id: s.id,
        nama_lengkap: s.nama_lengkap,
        nilai: nilaiSiswa ? nilaiSiswa.nilai : "", // Kosong jika belum ada
      };
    });

    setListSiswa(merged);
    setLoading(false);
  }

  const handleNilaiChange = (siswaId: string, val: string) => {
    setListSiswa((prev) => prev.map((s) => (s.id === siswaId ? { ...s, nilai: val } : s)));
  };

  async function simpanNilai() {
    if (!asesmenId) return;
    
    // Filter hanya siswa yang nilainya diisi
    const dataToInsert = listSiswa
      .filter((s) => s.nilai !== "" && !isNaN(Number(s.nilai)))
      .map((s) => ({
        asesmen_id: asesmenId,
        siswa_id: s.id,
        nilai: parseInt(s.nilai),
      }));

    if (dataToInsert.length === 0) return alert("Belum ada nilai yang diisi.");

    setSedangSimpan(true);
    const { error } = await supabase.schema("akademik").from("nilai_siswa").upsert(dataToInsert, { onConflict: "asesmen_id,siswa_id" });
    setSedangSimpan(false);

    if (error) alert(error.message);
    else alert("Nilai berhasil disimpan!");
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Input Nilai Siswa</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Asesmen</label>
        <select className="border p-2 rounded bg-white w-full max-w-2xl" value={asesmenId} onChange={(e) => handlePilihAsesmen(e.target.value)}>
          <option value="">-- Pilih Asesmen --</option>
          {daftarAsesmen.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
        </select>
      </div>

      {loading && <p>Memuat data siswa...</p>}

      {!loading && asesmenId && listSiswa.length === 0 && <p className="text-red-500">Tidak ada siswa di kelas ini.</p>}

      {!loading && listSiswa.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden max-w-2xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-3 w-12 text-center">No</th>
                <th className="border p-3">Nama Siswa</th>
                <th className="border p-3 w-32">Nilai (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {listSiswa.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="border p-3 text-center">{i + 1}</td>
                  <td className="border p-3 font-medium">{s.nama_lengkap}</td>
                  <td className="border p-3">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full border p-2 rounded text-center font-bold text-blue-600"
                      value={s.nilai}
                      onChange={(e) => handleNilaiChange(s.id, e.target.value)}
                      placeholder="-"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button onClick={simpanNilai} disabled={sedangSimpan} className="rounded bg-blue-600 px-6 py-2 text-white font-semibold disabled:opacity-50">
              {sedangSimpan ? "Menyimpan..." : "Simpan Semua Nilai"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}