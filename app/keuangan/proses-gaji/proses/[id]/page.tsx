"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

function FormProsesGajiContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const guruId = params.id as string;
  const bulan = searchParams.get("bulan") || "";
  const tahun = searchParams.get("tahun") || "";
  const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const [namaGuru, setNamaGuru] = useState("");
  const [pendapatan, setPendapatan] = useState<{nama: string, nominal: number}[]>([]);
  const [potongan, setPotongan] = useState<{nama: string, nominal: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [sedangSimpan, setSedangSimpan] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: guru } = await supabase.schema("master").from("guru").select("nama_lengkap").eq("id", guruId).single();
      if (guru) setNamaGuru(guru.nama_lengkap);

      // Ambil setting gaji default
      const { data: set } = await supabase.schema("keuangan").from("setting_gaji").select("*").eq("guru_id", guruId).single();
      
      if (set) {
        // Masukkan default pendapatan
        const defaultPendapatan = [];
        if (set.gaji_pokok > 0) defaultPendapatan.push({ nama: "Gaji Pokok", nominal: set.gaji_pokok });
        if (set.tunj_fungsional > 0) defaultPendapatan.push({ nama: "Tunj. Fungsional", nominal: set.tunj_fungsional });
        if (set.tunj_keluarga > 0) defaultPendapatan.push({ nama: "Tunj. Keluarga", nominal: set.tunj_keluarga });
        if (set.tunj_beras > 0) defaultPendapatan.push({ nama: "Tunj. Beras", nominal: set.tunj_beras });
        setPendapatan(defaultPendapatan);

        // Masukkan default potongan
        const defaultPotongan = [];
        if (set.pot_bpjs > 0) defaultPotongan.push({ nama: "BPJS Kesehatan", nominal: set.pot_bpjs });
        if (set.pot_koperasi > 0) defaultPotongan.push({ nama: "Koperasi", nominal: set.pot_koperasi });
        setPotongan(defaultPotongan);
      }
      setLoading(false);
    }
    fetchData();
  }, [guruId]);

  const handleTambahBaris = (tipe: "pendapatan" | "potongan") => {
    if (tipe === "pendapatan") setPendapatan([...pendapatan, { nama: "", nominal: 0 }]);
    else setPotongan([...potongan, { nama: "", nominal: 0 }]);
  };

  const handleHapusBaris = (tipe: "pendapatan" | "potongan", index: number) => {
    if (tipe === "pendapatan") setPendapatan(pendapatan.filter((_, i) => i !== index));
    else setPotongan(potongan.filter((_, i) => i !== index));
  };

  const handleUbahBaris = (tipe: "pendapatan" | "potongan", index: number, field: "nama" | "nominal", val: any) => {
    if (tipe === "pendapatan") {
      const newArr = [...pendapatan];
      newArr[index][field] = val;
      setPendapatan(newArr);
    } else {
      const newArr = [...potongan];
      newArr[index][field] = val;
      setPotongan(newArr);
    }
  };

  async function handleSimpan() {
    setSedangSimpan(true);
    const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.nominal, 0);
    const totalPotongan = potongan.reduce((sum, item) => sum + item.nominal, 0);
    const gajiBersih = totalPendapatan - totalPotongan;

    const { error } = await supabase.schema("keuangan").from("slip_gaji").insert([{
      guru_id: guruId,
      bulan: namaBulan[Number(bulan) - 1],
      tahun: tahun,
      total_pendapatan: totalPendapatan,
      total_potongan: totalPotongan,
      gaji_bersih: gajiBersih,
      rincian_pendapatan: pendapatan,
      rincian_potongan: potongan
    }]);

    setSedangSimpan(false);
    if (error) alert(error.message);
    else router.push("/keuangan/proses-gaji");
  }

  const formatRupiah = (angka: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
  const totalPendapatan = pendapatan.reduce((sum, item) => sum + item.nominal, 0);
  const totalPotongan = potongan.reduce((sum, item) => sum + item.nominal, 0);

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Proses Gaji: {namaGuru}</h1>
          <p className="text-slate-500 text-sm mt-1">Periode: {namaBulan[Number(bulan) - 1]} {tahun}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KOLOM PENDAPATAN */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold text-green-700">Pendapatan</h2>
            <button onClick={() => handleTambahBaris("pendapatan")} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-green-100"><Plus size={14}/> Tambah</button>
          </div>
          <div className="space-y-3">
            {pendapatan.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Nama (Cth: Honor Pramuka)" className="flex-1 border p-2 rounded text-sm" value={item.nama} onChange={(e) => handleUbahBaris("pendapatan", i, "nama", e.target.value)} />
                <input type="number" className="w-28 border p-2 rounded text-sm text-right" value={item.nominal} onChange={(e) => handleUbahBaris("pendapatan", i, "nominal", Number(e.target.value))} />
                <button onClick={() => handleHapusBaris("pendapatan", i)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            ))}
            {pendapatan.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Belum ada pendapatan.</p>}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between font-bold text-green-700">
            <span>Total Pendapatan</span>
            <span>{formatRupiah(totalPendapatan)}</span>
          </div>
        </div>

        {/* KOLOM POTONGAN */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="font-bold text-red-700">Potongan</h2>
            <button onClick={() => handleTambahBaris("potongan")} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-100"><Plus size={14}/> Tambah</button>
          </div>
          <div className="space-y-3">
            {potongan.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder="Nama (Cth: Alpa 2 Hari)" className="flex-1 border p-2 rounded text-sm" value={item.nama} onChange={(e) => handleUbahBaris("potongan", i, "nama", e.target.value)} />
                <input type="number" className="w-28 border p-2 rounded text-sm text-right" value={item.nominal} onChange={(e) => handleUbahBaris("potongan", i, "nominal", Number(e.target.value))} />
                <button onClick={() => handleHapusBaris("potongan", i)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
              </div>
            ))}
            {potongan.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">Belum ada potongan.</p>}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-between font-bold text-red-700">
            <span>Total Potongan</span>
            <span>{formatRupiah(totalPotongan)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm">Gaji Bersih Diterima</p>
          <p className="text-3xl font-black">{formatRupiah(totalPendapatan - totalPotongan)}</p>
        </div>
        <button onClick={handleSimpan} disabled={sedangSimpan} className="bg-white text-blue-900 hover:bg-blue-50 px-8 py-3 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
          <Save size={20} /> {sedangSimpan ? "Menyimpan..." : "Selesaikan & Simpan Gaji"}
        </button>
      </div>
    </div>
  );
}

export default function FormProsesGaji() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Memuat halaman...</div>}>
      <FormProsesGajiContent />
    </Suspense>
  );
}