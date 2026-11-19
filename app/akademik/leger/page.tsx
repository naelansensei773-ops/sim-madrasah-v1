"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LegerPage() {
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [rombelId, setRombelId] = useState("");
  
  const [daftarMapel, setDaftarMapel] = useState<any[]>([]);
  const [dataSiswa, setDataSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil data rombel saat halaman dibuka
  useEffect(() => {
    async function fetchRombel() {
      const { data } = await supabase
        .schema("master")
        .from("rombel")
        .select("id, nama_rombel")
        .eq("status_aktif", true)
        .order("nama_rombel");
      if (data) setDaftarRombel(data);
    }
    fetchRombel();
  }, []);

  // 2. Fungsi saat Rombel dipilih
  async function handlePilihRombel(id: string) {
    setRombelId(id);
    if (!id) {
      setDataSiswa([]);
      setDaftarMapel([]);
      return;
    }

    setLoading(true);

    // A. Ambil semua siswa aktif di rombel ini
    const { data: siswa } = await supabase
      .schema("master")
      .from("siswa")
      .select("id, nama_lengkap")
      .eq("rombel_id", id)
      .eq("status_siswa", "Aktif")
      .order("nama_lengkap");

    if (!siswa || siswa.length === 0) {
      setDataSiswa([]);
      setLoading(false);
      return;
    }

    // B. Ambil semua mapel aktif (untuk judul kolom)
    const { data: mapel } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .select("id, nama_mapel")
      .eq("aktif", true)
      .order("nama_mapel");
    
    if (mapel) setDaftarMapel(mapel);

    // C. Ambil asesmen khusus untuk rombel ini
    const { data: asesmen } = await supabase
      .schema("akademik")
      .from("asesmen")
      .select("id, mapel_id")
      .eq("rombel_id", id);

    const asesmenIds = asesmen?.map((a) => a.id) || [];

    // D. Ambil semua nilai dari asesmen tersebut
    let nilaiData: any[] = [];
    if (asesmenIds.length > 0) {
      const { data: nilai } = await supabase
        .schema("akademik")
        .from("nilai_siswa")
        .select("asesmen_id, siswa_id, nilai")
        .in("asesmen_id", asesmenIds);
      nilaiData = nilai || [];
    }

    // E. Olah data menjadi bentuk Matriks (Siswa x Mapel)
    const processedSiswa = siswa.map((s) => {
      const nilaiPerMapel: Record<string, number[]> = {};
      
      // Cari semua nilai milik siswa ini
      const nilaiSiswa = nilaiData.filter((n) => n.siswa_id === s.id);

      nilaiSiswa.forEach((n) => {
        // Cari mapel_id dari asesmen_id
        const asesmenInfo = asesmen?.find((a) => a.id === n.asesmen_id);
        if (asesmenInfo && asesmenInfo.mapel_id) {
          if (!nilaiPerMapel[asesmenInfo.mapel_id]) {
            nilaiPerMapel[asesmenInfo.mapel_id] = [];
          }
          nilaiPerMapel[asesmenInfo.mapel_id].push(n.nilai);
        }
      });

      // Hitung rata-rata per mapel
      const rataRataMapel: Record<string, number> = {};
      let totalKeseluruhan = 0;
      let jumlahMapelAdaNilai = 0;

      Object.keys(nilaiPerMapel).forEach((mapelId) => {
        const arrNilai = nilaiPerMapel[mapelId];
        const rataRata = arrNilai.reduce((a, b) => a + b, 0) / arrNilai.length;
        rataRataMapel[mapelId] = Math.round(rataRata); // Bulatkan
        totalKeseluruhan += rataRata;
        jumlahMapelAdaNilai++;
      });

      // Hitung rata-rata keseluruhan
      const rataRataAkhir = jumlahMapelAdaNilai > 0 ? (totalKeseluruhan / jumlahMapelAdaNilai).toFixed(1) : "-";

      return {
        id: s.id,
        nama_lengkap: s.nama_lengkap,
        nilai: rataRataMapel,
        rataRata: rataRataAkhir
      };
    });

    setDataSiswa(processedSiswa);
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Leger Nilai (Rekap Rata-rata)</h1>

      <div className="bg-white p-4 rounded shadow mb-6 flex items-center space-x-4">
        <label className="font-semibold text-gray-700">Pilih Rombel / Kelas:</label>
        <select
          className="border p-2 rounded bg-white w-64"
          value={rombelId}
          onChange={(e) => handlePilihRombel(e.target.value)}
        >
          <option value="">-- Pilih Kelas --</option>
          {daftarRombel.map((r) => (
            <option key={r.id} value={r.id}>{r.nama_rombel}</option>
          ))}
        </select>
      </div>

      {loading && <p>Menghitung Leger...</p>}

      {!loading && rombelId && dataSiswa.length === 0 && (
        <p className="text-red-500">Belum ada siswa aktif di kelas ini.</p>
      )}

      {!loading && dataSiswa.length > 0 && (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100 text-gray-800">
                <th className="border p-3 text-left sticky left-0 bg-gray-100 z-10 w-12 text-center">No</th>
                <th className="border p-3 text-left sticky left-12 bg-gray-100 z-10 min-w-[200px]">Nama Siswa</th>
                
                {/* Kolom Mapel Dinamis */}
                {daftarMapel.map((m) => (
                  <th key={m.id} className="border p-3 text-center min-w-[100px]">{m.nama_mapel}</th>
                ))}
                
                <th className="border p-3 text-center bg-blue-50 font-bold min-w-[100px]">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {dataSiswa.map((siswa, index) => (
                <tr key={siswa.id} className="hover:bg-gray-50">
                  <td className="border p-3 text-center sticky left-0 bg-white">{index + 1}</td>
                  <td className="border p-3 font-medium sticky left-12 bg-white">{siswa.nama_lengkap}</td>
                  
                  {/* Nilai per mapel */}
                  {daftarMapel.map((m) => (
                    <td key={m.id} className="border p-3 text-center">
                      {siswa.nilai[m.id] !== undefined ? (
                        <span className="font-semibold text-gray-700">{siswa.nilai[m.id]}</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                  
                  {/* Rata-rata Akhir */}
                  <td className="border p-3 text-center bg-blue-50 font-bold text-blue-700">
                    {siswa.rataRata}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}