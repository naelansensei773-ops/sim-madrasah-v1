"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin, Box, DoorOpen } from "lucide-react";

export default function LokasiAsetPage() {
  const [dataRuangan, setDataRuangan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Ambil data ruangan
      const { data: ruangan } = await supabase.schema("sarpras").from("ruangan").select("*").order("nama_ruangan");
      // Ambil data aset
      const { data: aset } = await supabase.schema("sarpras").from("aset").select("*");

      if (ruangan) {
        // Kelompokkan aset ke dalam ruangan masing-masing
        const merged = ruangan.map(r => {
          const asetRuangan = (aset || []).filter(a => a.ruangan_id === r.id);
          return { ...r, aset: asetRuangan };
        });
        setDataRuangan(merged);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Lokasi Aset</h1>
        <p className="text-slate-500 text-sm mt-1">Daftar ruangan beserta barang/aset yang ada di dalamnya.</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500">Memuat data...</div>
      ) : dataRuangan.length === 0 ? (
        <div className="p-10 text-center text-slate-500 flex flex-col items-center bg-white rounded-xl border border-slate-200">
          <DoorOpen size={48} className="text-slate-300 mb-3" />
          <p>Belum ada data ruangan. Silakan tambah ruangan terlebih dahulu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataRuangan.map((ruangan) => (
            <div key={ruangan.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Header Ruangan */}
              <div className="bg-slate-800 p-4 text-white">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <MapPin size={18} className="text-blue-400" /> {ruangan.nama_ruangan}
                </h3>
                <p className="text-xs text-slate-300 mt-1">Kode: {ruangan.kode_ruangan} | Jenis: {ruangan.jenis_ruangan}</p>
              </div>

              {/* List Aset */}
              <div className="p-4 flex-1">
                <p className="text-sm font-semibold text-slate-600 mb-3 border-b pb-2">Daftar Aset ({ruangan.aset.length})</p>
                {ruangan.aset.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Tidak ada aset di ruangan ini.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {ruangan.aset.map((aset: any) => (
                      <li key={aset.id} className="flex items-start gap-2 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Box size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-slate-800">{aset.nama_aset}</p>
                          <p className="text-xs text-slate-500">{aset.nomor_inventaris || aset.kode_aset}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}