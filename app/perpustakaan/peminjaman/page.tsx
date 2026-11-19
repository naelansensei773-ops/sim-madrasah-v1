"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, BookCheck, Trash2 } from "lucide-react";

interface Peminjaman {
  id: string; eksemplar_id: string; anggota_id: string;
  tanggal_pinjam: string; tanggal_jatuh_tempo: string;
  tanggal_kembali: string | null; status: string | null;
  denda: number | null; keterangan: string | null;
  eksemplar?: { kode_eksemplar: string; buku?: { judul: string } | null } | null;
  anggota?: { nama: string; nomor_anggota: string; tipe: string } | null;
}

export default function PeminjamanPage() {
  const [data, setData] = useState<Peminjaman[]>([]);
  const [eksemplarList, setEksemplarList] = useState<any[]>([]);
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [form, setForm] = useState({ eksemplar_id: "", anggota_id: "", tanggal_jatuh_tempo: "" });
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("peminjaman")
      .select(`*, eksemplar:eksemplar_id(kode_eksemplar, buku:buku_id(judul)), anggota:anggota_id(nama, nomor_anggota, tipe)`)
      .order("created_at", { ascending: false });
    setData(data || []);
  }, []);

  const fetchRefs = useCallback(async () => {
    const [e, a] = await Promise.all([
      supabase.schema("perpustakaan").from("eksemplar").select("id,kode_eksemplar,status,buku:buku_id(judul)").eq("status", "tersedia").order("kode_eksemplar"),
      supabase.schema("perpustakaan").from("anggota").select("id,nama,nomor_anggota").eq("status", "aktif").order("nama"),
    ]);
    setEksemplarList(e.data || []);
    setAnggotaList(a.data || []);
  }, []);

  useEffect(() => {
    fetchData(); fetchRefs();
    const d = new Date(); d.setDate(d.getDate() + 7);
    setForm((f) => ({ ...f, tanggal_jatuh_tempo: d.toISOString().slice(0, 10) }));
  }, [fetchData, fetchRefs]);

  async function handlePinjam(e: React.FormEvent) {
    e.preventDefault();
    if (!form.eksemplar_id || !form.anggota_id || !form.tanggal_jatuh_tempo) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.schema("perpustakaan").from("peminjaman").insert({
      eksemplar_id: form.eksemplar_id,
      anggota_id: form.anggota_id,
      tanggal_pinjam: today,
      tanggal_jatuh_tempo: form.tanggal_jatuh_tempo,
      status: "dipinjam",
    });
    if (error) { alert("Gagal: " + error.message); return; }
    await supabase.schema("perpustakaan").from("eksemplar").update({ status: "dipinjam" }).eq("id", form.eksemplar_id);
    setForm({ eksemplar_id: "", anggota_id: "", tanggal_jatuh_tempo: "" });
    setShowForm(false); fetchData(); fetchRefs();
  }

  async function handleKembali(p: Peminjaman) {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date(p.tanggal_jatuh_tempo);
    const back = new Date(today);
    const diffDays = Math.max(0, Math.floor((back.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
    const denda = diffDays * 1000;

    await supabase.schema("perpustakaan").from("peminjaman").update({
      status: "dikembalikan",
      tanggal_kembali: today,
      denda,
    }).eq("id", p.id);
    await supabase.schema("perpustakaan").from("eksemplar").update({ status: "tersedia" }).eq("id", p.eksemplar_id);
    fetchData(); fetchRefs();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan peminjaman ini?")) return;
    await supabase.schema("perpustakaan").from("peminjaman").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Peminjaman Buku</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Pinjam Buku
        </button>
      </div>

      {showForm && (
        <form onSubmit={handlePinjam} className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={form.anggota_id} onChange={(e) => setForm({ ...form, anggota_id: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required>
            <option value="">-- Pilih Anggota --</option>
            {anggotaList.map((a) => <option key={a.id} value={a.id}>{a.nama} ({a.nomor_anggota})</option>)}
          </select>
          <select value={form.eksemplar_id} onChange={(e) => setForm({ ...form, eksemplar_id: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required>
            <option value="">-- Pilih Eksemplar --</option>
            {eksemplarList.map((e) => <option key={e.id} value={e.id}>{e.kode_eksemplar} — {e.buku?.judul}</option>)}
          </select>
          <input type="date" value={form.tanggal_jatuh_tempo}
            onChange={(e) => setForm({ ...form, tanggal_jatuh_tempo: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <div className="md:col-span-3 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Simpan Peminjaman</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3">Anggota</th>
              <th className="px-4 py-3">Buku / Kode</th>
              <th className="px-4 py-3">Pinjam</th>
              <th className="px-4 py-3">Jatuh Tempo</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{p.anggota?.nama}</div>
                  <div className="text-xs text-slate-500">{p.anggota?.nomor_anggota}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-800">{p.eksemplar?.buku?.judul}</div>
                  <div className="text-xs font-mono text-slate-500">{p.eksemplar?.kode_eksemplar}</div>
                </td>
                <td className="px-4 py-3 text-slate-500">{p.tanggal_pinjam}</td>
                <td className="px-4 py-3 text-slate-500">{p.tanggal_jatuh_tempo}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    p.status === "dipinjam" ? "bg-amber-100 text-amber-700" :
                    p.status === "dikembalikan" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>{p.status}</span>
                  {p.denda && p.denda > 0 ? <div className="text-xs text-red-600 mt-1">Denda: Rp {p.denda.toLocaleString("id-ID")}</div> : null}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.status === "dipinjam" && (
                    <button onClick={() => handleKembali(p)} title="Kembalikan"
                      className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded"><BookCheck size={14} /></button>
                  )}
                  <button onClick={() => handleDelete(p.id)} title="Hapus"
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Belum ada peminjaman</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}