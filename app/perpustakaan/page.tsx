"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookOpen, Layers, Users, BookMarked } from "lucide-react";

export default function PerpusDashboard() {
  const [stats, setStats] = useState({ buku: 0, eksemplar: 0, anggota: 0, dipinjam: 0 });

  useEffect(() => {
    async function load() {
      const [b, e, a, p] = await Promise.all([
        supabase.schema("perpustakaan").from("buku").select("*", { count: "exact", head: true }),
        supabase.schema("perpustakaan").from("eksemplar").select("*", { count: "exact", head: true }),
        supabase.schema("perpustakaan").from("anggota").select("*", { count: "exact", head: true }),
        supabase.schema("perpustakaan").from("peminjaman").select("*", { count: "exact", head: true }).eq("status", "dipinjam"),
      ]);
      setStats({
        buku: b.count || 0,
        eksemplar: e.count || 0,
        anggota: a.count || 0,
        dipinjam: p.count || 0,
      });
    }
    load();
  }, []);

  const cards = [
    { label: "Judul Buku", value: stats.buku, icon: BookOpen, color: "bg-blue-50 text-blue-600" },
    { label: "Total Eksemplar", value: stats.eksemplar, icon: Layers, color: "bg-emerald-50 text-emerald-600" },
    { label: "Anggota", value: stats.anggota, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "Sedang Dipinjam", value: stats.dipinjam, icon: BookMarked, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
              <Icon size={20} />
            </div>
            <p className="text-sm text-slate-500 mt-3">{c.label}</p>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
          </div>
        );
      })}
    </div>
  );
}