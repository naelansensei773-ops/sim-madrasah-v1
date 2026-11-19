"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PortalOrangTua() {
  const [nis, setNis] = useState("");
  const [tahun, setTahun] = useState<number | null>(null); // State untuk tahun
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // State untuk menampung data siswa
  const [dataSiswa, setDataSiswa] = useState<any>(null);
  const [dataNilai, setDataNilai] = useState<any[]>([]);
  const [dataAbsensi, setDataAbsensi] = useState({ Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 });
  const [catatanWali, setCatatanWali] = useState("");

  // Ambil tahun saat ini setelah komponen dimuat di browser
  useEffect(() => {
    setTahun(new Date().getFullYear());
  }, []);

  async function cariData() {
    if (!nis) return alert("Masukkan NIS terlebih dahulu!");
    setLoading(true);
    setErrorMsg("");
    setDataSiswa(null);

    // 1. Cari Siswa berdasarkan NIS
    const { data: siswa, error: errSiswa } = await supabase
      .schema("master")
      .from("siswa")
      .select("*, rombel(nama_rombel)")
      .eq("nis", nis)
      .single();

    if (errSiswa || !siswa) {
      setErrorMsg("Siswa dengan NIS tersebut tidak ditemukan. Pastikan NIS benar.");
      setLoading(false);
      return;
    }

    setDataSiswa(siswa);

    // 2. Ambil Rekap Absensi
    const { data: absensi } = await supabase
      .schema("akademik")
      .from("kehadiran_siswa")
      .select("status")
      .eq("siswa_id", siswa.id);

    const rekap = { Hadir: 0, Izin: 0, Sakit: 0, Alpa: 0 };
    absensi?.forEach((a) => {
      if (a.status === "Hadir") rekap.Hadir++;
      else if (a.status === "Izin") rekap.Izin++;
      else if (a.status === "Sakit") rekap.Sakit++;
      else if (a.status === "Alpa") rekap.Alpa++;
    });
    setDataAbsensi(rekap);

    // 3. Ambil Nilai (Sama seperti logika di Rapor)
    const { data: asesmen } = await supabase
      .schema("akademik")
      .from("asesmen")
      .select("id, mapel_id")
      .eq("rombel_id", siswa.rombel_id);

    const asesmenIds = asesmen?.map((a) => a.id) || [];
    
    let nilaiData: any[] = [];
    if (asesmenIds.length > 0) {
      const { data: nilai } = await supabase
        .schema("akademik")
        .from("nilai_siswa")
        .select("asesmen_id, nilai")
        .eq("siswa_id", siswa.id)
        .in("asesmen_id", asesmenIds);
      nilaiData = nilai || [];
    }

    const { data: mapel } = await supabase
      .schema("master")
      .from("mata_pelajaran")
      .select("id, nama_mapel")
      .eq("aktif", true)
      .order("nama_mapel");

    const nilaiPerMapel = (mapel || []).map((m) => {
      const asesmenMapel = asesmen?.filter((a) => a.mapel_id === m.id).map((a) => a.id) || [];
      const nilaiMapelIni = nilaiData.filter((n) => asesmenMapel.includes(n.asesmen_id));
      const rataRata = nilaiMapelIni.length > 0 
        ? Math.round(nilaiMapelIni.reduce((acc, curr) => acc + curr.nilai, 0) / nilaiMapelIni.length) 
        : 0;
      return { nama_mapel: m.nama_mapel, nilai: rataRata };
    }).filter((m) => m.nilai > 0); // Hanya tampilkan yang ada nilainya

    setDataNilai(nilaiPerMapel);

    // 4. Ambil Catatan Wali Kelas
    const { data: catatan } = await supabase
      .schema("akademik")
      .from("rapor_catatan")
      .select("catatan_wali")
      .eq("siswa_id", siswa.id)
      .single();
    
    if (catatan) setCatatanWali(catatan.catatan_wali);

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-4 md:p-10">
      <div className="w-full max-w-2xl">
        
        {/* HEADER PORTAL */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Portal Orang Tua</h1>
          <p className="text-gray-600">Masukkan NIS (Nomor Induk Siswa) untuk melihat hasil belajar anak Anda.</p>
        </div>

        {/* FORM PENCARIAN */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Masukkan NIS (Contoh: 2024001)"
            className="border p-3 rounded flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
            value={nis}
            onChange={(e) => setNis(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && cariData()}
          />
          <button
            onClick={cariData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded font-semibold disabled:opacity-50"
          >
            {loading ? "Mencari..." : "Cari Data"}
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-8 text-center">
            {errorMsg}
          </div>
        )}

        {/* HASIL PENCARIAN */}
        {dataSiswa && (
          <div className="space-y-6">
            
            {/* Kartu Identitas Siswa */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-800 p-4 text-white">
                <h2 className="text-xl font-bold">{dataSiswa.nama_lengkap}</h2>
                <p className="text-blue-200">NIS: {dataSiswa.nis} | Kelas: {dataSiswa.rombel?.nama_rombel || "-"}</p>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-green-50 p-3 rounded border border-green-100">
                  <p className="text-sm text-gray-500">Hadir</p>
                  <p className="text-xl font-bold text-green-600">{dataAbsensi.Hadir}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                  <p className="text-sm text-gray-500">Izin</p>
                  <p className="text-xl font-bold text-yellow-600">{dataAbsensi.Izin}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-100">
                  <p className="text-sm text-gray-500">Sakit</p>
                  <p className="text-xl font-bold text-blue-600">{dataAbsensi.Sakit}</p>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-100">
                  <p className="text-sm text-gray-500">Alpa</p>
                  <p className="text-xl font-bold text-red-600">{dataAbsensi.Alpa}</p>
                </div>
              </div>
            </div>

            {/* Kartu Nilai */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Laporan Nilai (Rata-rata)</h3>
              {dataNilai.length === 0 ? (
                <p className="text-gray-500 italic">Belum ada nilai yang masuk.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataNilai.map((n, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <span className="font-medium text-gray-700">{n.nama_mapel}</span>
                      <span className="font-bold text-blue-700 text-lg">{n.nilai}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kartu Catatan Wali Kelas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Catatan Wali Kelas</h3>
              {catatanWali ? (
                <p className="text-gray-700 italic">"{catatanWali}"</p>
              ) : (
                <p className="text-gray-500 italic">Belum ada catatan dari wali kelas.</p>
              )}
            </div>

          </div>
        )}

        <div className="mt-10 text-center text-sm text-gray-400">
          &copy; {tahun || ""} Sistem Informasi Sekolah. Dibuat dengan ❤️
        </div>
      </div>
    </div>
  );
}