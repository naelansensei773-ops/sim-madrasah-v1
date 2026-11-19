"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Inbox, Send, Printer, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardAdministrasi() {
  const [stats, setStats] = useState({
    suratMasuk: 0,
    suratBaru: 0,
    suratKeluar: 0,
    disposisi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      // 1. Total Surat Masuk
      const { count: countMasuk } = await supabase
        .schema("administrasi")
        .from("surat_masuk")
        .select("*", { count: "exact", head: true });

      // 2. Surat Masuk berstatus "Baru"
      const { count: countBaru } = await supabase
        .schema("administrasi")
        .from("surat_masuk")
        .select("*", { count: "exact", head: true })
        .eq("status", "Baru");

      // 3. Total Surat Keluar
      const { count: countKeluar } = await supabase
        .schema("administrasi")
        .from("surat_keluar")
        .select("*", { count: "exact", head: true });

      // 4. Total Disposisi
      const { count: countDisposisi } = await supabase
        .schema("administrasi")
        .from("disposisi")
        .select("*", { count: "exact", head: true });

      setStats({
        suratMasuk: countMasuk || 0,
        suratBaru: countBaru || 0,
        suratKeluar: countKeluar || 0,
        disposisi: countDisposisi || 0,
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Administrasi</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan aktivitas persuratan madrasah.</p>
      </div>

      {loading ? (
        <p className="text-slate-500">Memuat statistik...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card Surat Masuk */}
          <Link href="/administrasi/surat-masuk" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Surat Masuk</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.suratMasuk}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Inbox size={24} />
              </div>
            </div>
          </Link>

          {/* Card Surat Baru (Butuh Perhatian) */}
          <Link href="/administrasi/surat-masuk" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Surat Belum Diproses</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.suratBaru}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-red-600">
                <AlertCircle size={24} />
              </div>
            </div>
          </Link>

          {/* Card Surat Keluar */}
          <Link href="/administrasi/surat-keluar" className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-green-500 hover:shadow-md transition-shadow block">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Surat Keluar</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.suratKeluar}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <Send size={24} />
              </div>
            </div>
          </Link>

          {/* Card Disposisi */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Disposisi</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">{stats.disposisi}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <Printer size={24} />
              </div>
            </div>
          </div>

        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          Modul Administrasi Surat berjalan dengan baik. Pastikan untuk memeriksa surat baru secara berkala.
        </p>
      </div>
    </div>
  );
}