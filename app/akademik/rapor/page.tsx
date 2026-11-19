"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

export default function RaporPage() {
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  
  const [rombelId, setRombelId] = useState("");
  const [siswaId, setSiswaId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [dataRapor, setDataRapor] = useState<any>(null);
  
  const [catatanWali, setCatatanWali] = useState("");
  const [tahunAjaran, setTahunAjaran] = useState("2024/2025");
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // 1. Ambil Rombel
  useEffect(() => {
    async function fetchRombel() {
      const { data } = await supabase.schema("master").from("rombel").select("id, nama_rombel").eq("status_aktif", true).order("nama_rombel");
      if (data) setDaftarRombel(data);
    }
    fetchRombel();
  }, []);

  // 2. Ambil Siswa saat Rombel dipilih
  async function handlePilihRombel(id: string) {
    setRombelId(id);
    setSiswaId("");
    setDataRapor(null);
    if (!id) return setDaftarSiswa([]);

    const { data } = await supabase.schema("master").from("siswa").select("id, nama_lengkap, nis").eq("rombel_id", id).eq("status_siswa", "Aktif").order("nama_lengkap");
    if (data) setDaftarSiswa(data);
  }

  // 3. Generate Rapor saat Siswa dipilih
  async function handlePilihSiswa(id: string) {
    setSiswaId(id);
    if (!id) return setDataRapor(null);

    setLoading(true);
    const siswaTerpilih = daftarSiswa.find((s) => s.id === id);

    // A. Ambil Nilai
    const { data: asesmen } = await supabase.schema("akademik").from("asesmen").select("id, mapel_id").eq("rombel_id", rombelId);
    const asesmenIds = asesmen?.map((a) => a.id) || [];
    
    let nilaiData: any[] = [];
    if (asesmenIds.length > 0) {
      const { data: nilai } = await supabase.schema("akademik").from("nilai_siswa").select("asesmen_id, nilai").eq("siswa_id", id).in("asesmen_id", asesmenIds);
      nilaiData = nilai || [];
    }

    const { data: mapel } = await supabase.schema("master").from("mata_pelajaran").select("id, nama_mapel").eq("aktif", true).order("nama_mapel");

    // Gabungkan Nilai per Mapel
    const nilaiPerMapel = (mapel || []).map((m) => {
      const asesmenMapel = asesmen?.filter((a) => a.mapel_id === m.id).map((a) => a.id) || [];
      const nilaiMapelIni = nilaiData.filter((n) => asesmenMapel.includes(n.asesmen_id));
      const rataRata = nilaiMapelIni.length > 0 ? Math.round(nilaiMapelIni.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiMapelIni.length) : 0;
      return { nama_mapel: m.nama_mapel, nilai: rataRata };
    }).filter((m) => m.nilai > 0); // Hanya tampilkan mapel yang ada nilainya

    // B. Ambil Absensi
    const { data: absensi } = await supabase.schema("akademik").from("kehadiran_siswa").select("status").eq("siswa_id", id);
    const rekapAbsensi = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 };
    absensi?.forEach((a) => {
      if (a.status === "Hadir") rekapAbsensi.Hadir++;
      else if (a.status === "Izin") rekapAbsensi.Izin++;
      else if (a.status === "Sakit") rekapAbsensi.Sakit++;
      else if (a.status === "Alpa") rekapAbsensi.Alpa++;
    });

    // C. Ambil Catatan Wali Kelas
    const { data: catatan } = await supabase.schema("akademik").from("rapor_catatan").select("*").eq("siswa_id", id).eq("tahun_ajaran", tahunAjaran).single();

    if (catatan) setCatatanWali(catatan.catatan_wali);
    else setCatatanWali("");

    setDataRapor({
      siswa: siswaTerpilih,
      nilai: nilaiPerMapel,
      absensi: rekapAbsensi,
    });
    setLoading(false);
  }

  // 4. Simpan Catatan Wali Kelas
  async function simpanCatatan() {
    if (!siswaId) return;
    setSedangSimpan(true);

    const { error } = await supabase.schema("akademik").from("rapor_catatan").upsert({
      siswa_id: siswaId,
      tahun_ajaran: tahunAjaran,
      catatan_wali: catatanWali
    }, { onConflict: "siswa_id,tahun_ajaran" });

    setSedangSimpan(false);
    if (error) alert("Gagal simpan catatan: " + error.message);
    else alert("Catatan wali kelas tersimpan!");
  }

  // 5. Fungsi Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 print:p-0">
      {/* HEADER FILTER (Disembunyikan saat di-print) */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold">Cetak Rapor Siswa</h1>
        <div className="flex space-x-3">
          <select className="border p-2 rounded bg-white" value={rombelId} onChange={(e) => handlePilihRombel(e.target.value)}>
            <option value="">-- Pilih Kelas --</option>
            {daftarRombel.map((r) => <option key={r.id} value={r.id}>{r.nama_rombel}</option>)}
          </select>
          
          <select className="border p-2 rounded bg-white" value={siswaId} onChange={(e) => handlePilihSiswa(e.target.value)} disabled={!rombelId}>
            <option value="">-- Pilih Siswa --</option>
            {daftarSiswa.map((s) => <option key={s.id} value={s.id}>{s.nama_lengkap}</option>)}
          </select>
        </div>
      </div>

      {loading && <p className="print:hidden">Memuat data rapor...</p>}

      {/* KERTAS RAPOR */}
      {dataRapor && (
        <div className="bg-white mx-auto shadow-lg print:shadow-none border print:border-none max-w-4xl p-8 print:p-0">
          
          {/* Kop Rapor */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold uppercase">Madrasah Ibtidaiyah/Sekolah</h2>
            <h1 className="text-2xl font-bold uppercase">Laporan Hasil Belajar Siswa</h1>
            <p className="text-gray-600">Tahun Pelajaran: {tahunAjaran}</p>
          </div>

          {/* Identitas Siswa */}
          <div className="mb-6 flex justify-between">
            <div>
              <table className="text-sm">
                <tbody>
                  <tr><td className="font-semibold w-32">Nama Siswa</td><td>: {dataRapor.siswa.nama_lengkap}</td></tr>
                  <tr><td className="font-semibold">NIS</td><td>: {dataRapor.siswa.nis}</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="text-sm">
                <tbody>
                  <tr><td className="font-semibold w-32">Kelas</td><td>: {daftarRombel.find(r => r.id === rombelId)?.nama_rombel}</td></tr>
                  <tr><td className="font-semibold">Tahun Ajaran</td><td>: {tahunAjaran}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabel Nilai */}
          <h3 className="font-bold mb-2">A. Nilai Mata Pelajaran</h3>
          <table className="w-full border-collapse border border-black text-sm mb-6">
            <thead>
              <tr className="bg-gray-200 print:bg-gray-100">
                <th className="border border-black p-2 w-12 text-center">No</th>
                <th className="border border-black p-2 text-left">Mata Pelajaran</th>
                <th className="border border-black p-2 w-32 text-center">Nilai Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {dataRapor.nilai.map((n: any, i: number) => (
                <tr key={i}>
                  <td className="border border-black p-2 text-center">{i + 1}</td>
                  <td className="border border-black p-2">{n.nama_mapel}</td>
                  <td className="border border-black p-2 text-center font-bold">{n.nilai}</td>
                </tr>
              ))}
              {dataRapor.nilai.length === 0 && (
                <tr><td colSpan={3} className="border border-black p-2 text-center text-gray-500 italic">Belum ada data nilai</td></tr>
              )}
            </tbody>
          </table>

          {/* Tabel Absensi */}
          <h3 className="font-bold mb-2">B. Ketidakhadiran</h3>
          <table className="w-1/2 border-collapse border border-black text-sm mb-6">
            <tbody>
              <tr><td className="border border-black p-2">Sakit</td><td className="border border-black p-2 text-center w-16">{dataRapor.absensi.Sakit} hari</td></tr>
              <tr><td className="border border-black p-2">Izin</td><td className="border border-black p-2 text-center">{dataRapor.absensi.Izin} hari</td></tr>
              <tr><td className="border border-black p-2">Tanpa Keterangan</td><td className="border border-black p-2 text-center">{dataRapor.absensi.Alpa} hari</td></tr>
            </tbody>
          </table>

          {/* Catatan Wali Kelas */}
          <h3 className="font-bold mb-2">C. Catatan Wali Kelas</h3>
          
          {/* Form input catatan (Hanya muncul di layar, tidak saat print) */}
          <div className="mb-4 print:hidden flex items-end space-x-2">
            <textarea 
              className="border p-2 rounded w-full" 
              rows={2} 
              placeholder="Tulis catatan untuk siswa..."
              value={catatanWali}
              onChange={(e) => setCatatanWali(e.target.value)}
            />
            <button onClick={simpanCatatan} disabled={sedangSimpan} className="bg-blue-600 text-white px-4 py-2 rounded h-full disabled:opacity-50">
              Simpan
            </button>
          </div>

          {/* Tampilan Catatan (Hanya muncul saat print / preview) */}
          <div className="border border-black p-4 min-h-[80px] text-sm mb-8 print:block hidden">
            {catatanWali || "-"}
          </div>
          <div className="hidden print:block text-sm">
             {/* Area Tanda Tangan */}
             <div className="flex justify-between mt-12">
               <div className="text-center">
                 <p>Orang Tua/Wali</p>
                 <div className="h-20"></div>
                 <p>(...................................)</p>
               </div>
               <div className="text-center">
                 <p>Wali Kelas</p>
                 <div className="h-20"></div>
                 <p>(...................................)</p>
               </div>
             </div>
          </div>

          {/* Tombol Cetak (Disembunyikan saat print) */}
          <div className="mt-8 text-right print:hidden border-t pt-4">
            <button onClick={handlePrint} className="bg-green-600 text-white px-6 py-2 rounded font-bold">
              🖨️ Cetak / Simpan PDF
            </button>
          </div>

        </div>
      )}
    </div>
  );
}