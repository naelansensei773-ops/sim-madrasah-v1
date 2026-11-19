"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AbsensiPage() {
  const [daftarRombel, setDaftarRombel] = useState<any[]>([]);
  const [rombelId, setRombelId] = useState("");
  const [tanggal, setTanggal] = useState("");
  
  // State untuk menampung daftar siswa & status absensinya
  const [listSiswa, setListSiswa] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  // 1. Ambil data rombel saat halaman pertama dibuka
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
    
    // Set tanggal default hari ini
    const today = new Date().toISOString().split("T")[0];
    setTanggal(today);
  }, []);

  // 2. Fungsi memuat siswa ketika Rombel dipilih
  async function handlePilihRombel(id: string) {
    setRombelId(id);
    if (!id) {
      setListSiswa([]);
      return;
    }

    setLoading(true);

    // Ambil data siswa yang aktif di rombel tersebut
    const { data: siswa } = await supabase
      .schema("master")
      .from("siswa")
      .select("id, nama_lengkap")
      .eq("rombel_id", id)
      .eq("status_siswa", "Aktif")
      .order("nama_lengkap");

    // Ambil data absensi yang mungkin sudah pernah diinput di tanggal ini
    const { data: absensi } = await supabase
      .schema("akademik")
      .from("kehadiran_siswa")
      .select("*")
      .eq("rombel_id", id)
      .eq("tanggal", tanggal);

    // Gabungkan data siswa dengan status absensinya
    const merged = (siswa || []).map((s) => {
      const absenHariIni = absensi?.find((a) => a.siswa_id === s.id);
      return {
        id: s.id,
        nama_lengkap: s.nama_lengkap,
        status: absenHariIni ? absenHariIni.status : "Hadir", // Default: Hadir
        keterangan: absenHariIni ? absenHariIni.keterangan : "",
      };
    });

    setListSiswa(merged);
    setLoading(false);
  }

  // 3. Fungsi mengubah status siswa di form
  const handleStatusChange = (siswaId: string, newStatus: string) => {
    setListSiswa((prev) =>
      prev.map((s) => (s.id === siswaId ? { ...s, status: newStatus } : s))
    );
  };

  // 4. Fungsi Simpan ke Database
  async function simpanAbsensi() {
    if (!rombelId || !tanggal) {
      alert("Pilih Rombel dan Tanggal terlebih dahulu!");
      return;
    }
    if (listSiswa.length === 0) {
      alert("Tidak ada siswa di rombel ini.");
      return;
    }

    setSedangSimpan(true);

    // Siapkan data untuk dimasukkan ke database
    const dataToInsert = listSiswa.map((s) => ({
      tanggal: tanggal,
      rombel_id: rombelId,
      siswa_id: s.id,
      status: s.status,
      keterangan: s.keterangan,
    }));

    // Gunakan .upsert() agar jika sudah ada, data diupdate. Jika belum, dibuat baru.
    const { error } = await supabase
      .schema("akademik")
      .from("kehadiran_siswa")
      .upsert(dataToInsert, { onConflict: "tanggal,siswa_id" });

    setSedangSimpan(false);

    if (error) {
      alert("Gagal menyimpan absensi: " + error.message);
    } else {
      alert("Absensi berhasil disimpan!");
    }
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Absensi Siswa</h1>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded shadow mb-6 flex space-x-4 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input
            type="date"
            className="border p-2 rounded"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              if (rombelId) handlePilihRombel(rombelId); // Reload data jika tanggal diganti
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Rombel / Kelas</label>
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
      </div>

      {/* LIST SISWA SECTION */}
      {loading && <p>Memuat data siswa...</p>}

      {!loading && rombelId && listSiswa.length === 0 && (
        <p className="text-red-500">Belum ada siswa aktif di kelas ini.</p>
      )}

      {!loading && listSiswa.length > 0 && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="border p-3 w-12 text-center">No</th>
                <th className="border p-3">Nama Siswa</th>
                <th className="border p-3 w-64 text-center">Status Kehadiran</th>
                <th className="border p-3">Keterangan (Opsional)</th>
              </tr>
            </thead>
            <tbody>
              {listSiswa.map((siswa, index) => (
                <tr key={siswa.id} className="hover:bg-gray-50">
                  <td className="border p-3 text-center">{index + 1}</td>
                  <td className="border p-3 font-medium">{siswa.nama_lengkap}</td>
                  <td className="border p-3 text-center space-x-2">
                    {["Hadir", "Izin", "Sakit", "Alpa"].map((st) => (
                      <label key={st} className="inline-flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`status_${siswa.id}`}
                          value={st}
                          checked={siswa.status === st}
                          onChange={() => handleStatusChange(siswa.id, st)}
                          className="form-radio text-blue-600"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                  </td>
                  <td className="border p-3">
                    <input
                      type="text"
                      className="w-full border p-1 rounded"
                      placeholder="Cth: Surat dokter"
                      value={siswa.keterangan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setListSiswa((prev) =>
                          prev.map((s) => (s.id === siswa.id ? { ...s, keterangan: val } : s))
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 border-t bg-gray-50 flex justify-end">
            <button
              onClick={simpanAbsensi}
              disabled={sedangSimpan}
              className="rounded bg-blue-600 px-6 py-2 text-white font-semibold disabled:opacity-50"
            >
              {sedangSimpan ? "Menyimpan..." : "Simpan Absensi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}