"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    guru: 0,
    siswa: 0,
    rombel: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      // 1. Hitung total guru (hanya yang aktif)
      const { count: countGuru } = await supabase
        .schema("master")
        .from("guru")
        .select("*", { count: "exact", head: true })
        .eq("status_aktif", true);

      // 2. Hitung total siswa (hanya yang aktif)
      const { count: countSiswa } = await supabase
        .schema("master")
        .from("siswa")
        .select("*", { count: "exact", head: true })
        .eq("status_siswa", "Aktif");

      // 3. Hitung total rombel (hanya yang aktif)
      const { count: countRombel } = await supabase
        .schema("master")
        .from("rombel")
        .select("*", { count: "exact", head: true })
        .eq("status_aktif", true);

      setStats({
        guru: countGuru || 0,
        siswa: countSiswa || 0,
        rombel: countRombel || 0,
      });

      setLoading(false);
    }

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Ringkasan data Master Sekolah saat ini.</p>
      
      {loading ? (
        <p>Memuat data statistik...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card Guru */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Guru Aktif</h2>
            <p className="text-5xl font-bold text-gray-800 mt-2">{stats.guru}</p>
            <Link href="/master-data/guru" className="text-blue-500 text-sm mt-4 inline-block hover:underline">
              Lihat Detail &rarr;
            </Link>
          </div>

          {/* Card Siswa */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Siswa Aktif</h2>
            <p className="text-5xl font-bold text-gray-800 mt-2">{stats.siswa}</p>
            <Link href="/master-data/siswa" className="text-green-500 text-sm mt-4 inline-block hover:underline">
              Lihat Detail &rarr;
            </Link>
          </div>

          {/* Card Rombel */}
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Rombel Aktif</h2>
            <p className="text-5xl font-bold text-gray-800 mt-2">{stats.rombel}</p>
            <Link href="/master-data/rombel" className="text-yellow-500 text-sm mt-4 inline-block hover:underline">
              Lihat Detail &rarr;
            </Link>
          </div>

        </div>
      )}

      <div className="mt-10 bg-blue-50 p-6 rounded-lg border border-blue-100">
        <h2 className="text-lg font-bold text-blue-900 mb-2">Selamat Datang di Sistem Informasi Sekolah</h2>
        <p className="text-blue-800">
          Gunakan menu di sebelah kiri untuk mengelola data Guru, Siswa, dan Rombongan Belajar.
        </p>
      </div>
    </div>
  );
}