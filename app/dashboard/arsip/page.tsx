"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FolderArchive, FileText, CheckCircle, Award } from "lucide-react";

export default function DashboardArsip() {
  const [stats, setStats] = useState({
    total: 0,
    bulanIni: 0,
    sk: 0,
    akreditasi: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      // 1. Total semua dokumen
      const { count: total } = await supabase.schema("arsip").from("dokumen").select("*", { count: "exact", head: true });
      
      // 2. Dokumen bulan ini
      const { count: bulanIni } = await supabase.schema("arsip").from("dokumen").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth);
      
      // 3. Dokumen kategori SK (Surat Keputusan)
      const { data: katSk } = await supabase.schema("arsip").from("kategori").select("id").ilike("nama_kategori", "%keputusan%").single();
      let countSk = 0;
      if (katSk) {
        const { count } = await supabase.schema("arsip").from("dokumen").select("*", { count: "exact", head: true }).eq("kategori_id", katSk.id);
        countSk = count || 0;
      }

      // 4. Dokumen kategori Akreditasi
      const { data: katAkred } = await supabase.schema("arsip").from("kategori").select("id").ilike("nama_kategori", "%akreditasi%").single();
      let countAkred = 0;
      if (katAkred) {
        const { count } = await supabase.schema("arsip").from("dokumen").select("*", { count: "exact", head: true }).eq("kategori_id", katAkred.id);
        countAkred = count || 0;
      }

      setStats({
        total: total || 0,
        bulanIni: bulanIni || 0,
        sk: countSk,
        akreditasi: countAkred,
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Arsip Digital</h1>

      {loading ? (
        <p className="text-slate-500">Memuat statistik...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Dokumen</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{stats.total}</p>
            </div>
            <FolderArchive size={40} className="text-blue-100" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Dokumen Bulan Ini</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{stats.bulanIni}</p>
            </div>
            <FileText size={40} className="text-green-100" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Dokumen SK</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{stats.sk}</p>
            </div>
            <CheckCircle size={40} className="text-yellow-100" />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Dokumen Akreditasi</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">{stats.akreditasi}</p>
            </div>
            <Award size={40} className="text-purple-100" />
          </div>

        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
        <p className="text-blue-800 font-medium">
          Modul Arsip V1 Selesai. Semua dokumen penting madrasah kini tersimpan dengan aman.
        </p>
      </div>
    </div>
  );
}