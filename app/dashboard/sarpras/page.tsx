"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Building, Box, AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

export default function DashboardSarpras() {
  const [stats, setStats] = useState({
    ruangan: 0,
    aset: 0,
    rusak: 0,
    dipinjam: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const { count: countRuangan } = await supabase.schema("sarpras").from("ruangan").select("*", { count: "exact", head: true });
      const { count: countAset } = await supabase.schema("sarpras").from("aset").select("*", { count: "exact", head: true });
      const { count: countRusak } = await supabase.schema("sarpras").from("kerusakan").select("*", { count: "exact", head: true }).neq("status", "Selesai");
      const { count: countPinjam } = await supabase.schema("sarpras").from("peminjaman").select("*", { count: "exact", head: true }).eq("status", "Dipinjam");

      setStats({
        ruangan: countRuangan || 0,
        aset: countAset || 0,
        rusak: countRusak || 0,
        dipinjam: countPinjam || 0,
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Sarpras</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan data sarana dan prasarana madrasah.</p>
      </div>

      {loading ? <p className="text-slate-500">Memuat statistik...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/sarpras/ruangan" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Ruangan</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.ruangan}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Building size={24} /></div>
            </div>
          </Link>

          <Link href="/sarpras/aset" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Aset</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.aset}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600"><Box size={24} /></div>
            </div>
          </Link>

          <Link href="/sarpras/kerusakan" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Aset Rusak (Belum Selesai)</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.rusak}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600"><AlertTriangle size={24} /></div>
            </div>
          </Link>

          <Link href="/sarpras/peminjaman" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Aset Dipinjam</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.dipinjam}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600"><RotateCcw size={24} /></div>
            </div>
          </Link>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          Modul Sarpras V1 Selesai. Data inventaris, ruangan, dan pemeliharaan sudah terpusat dengan baik.
        </p>
      </div>
    </div>
  );
}