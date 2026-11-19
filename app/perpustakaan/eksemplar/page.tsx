"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Eksemplar {
  id: string; buku_id: string; kode_eksemplar: string;
  kondisi: string | null; status: string | null;
  tanggal_masuk: string | null; keterangan: string | null;
  buku?: { judul: string } | null;
}
interface BukuRef { id: string; judul: string; }

export default function EksemplarPage() {
  const [data, setData] = useState<Eksemplar[]>([]);
  const [buku, setBuku] = useState<BukuRef[]>([]);
  const [form, setForm] = useState({ buku_id: "", kode_eksemplar: "", kondisi: "baik", status: "tersedia", keterangan: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("eksemplar")
      .select(`*, buku:buku_id(judul)`).order("kode_eksemplar");
    setData(data || []);
  }, []);

  const fetchBuku = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("buku").select("id,judul").order("judul");
    setBuku(data || []);
  }, []);

  useEffect(() => { fetchData(); fetchBuku(); }, [fetchData, fetchBuku]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.buku_id || !form.kode_eksemplar.trim()) return;
    if (editId) await supabase.schema("perpustakaan").from("eksemplar").update(form).eq("id", editId);
    else await supabase.schema("perpustakaan").from("eksemplar").insert(form);
    setForm({ buku_id: "", kode_eksemplar: "", kondisi: "baik", status: "tersedia", keterangan: "" });
    setEditId(null); setShowForm(false); fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus eksemplar ini?")) return;
    await supabase.schema("perpustakaan").from("eksemplar").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Eksemplar Buku</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ buku_id: "", kode_eksemplar: "", kondisi: "baik", status: "tersedia", keterangan: "" }); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <select value={form.buku_id} onChange={(e) => setForm({ ...form, buku_id: e.target.value })}
            className="md:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm" required>
            <option value="">-- Pilih Buku --</option>
            {buku.map((b) => <option key={b.id} value={b.id}>{b.judul}</option>)}
          </select>
          <input value={form.kode_eksemplar} onChange={(e) => setForm({ ...form, kode_eksemplar: e.target.value })}
            placeholder="Kode eksemplar (contoh: BK-001)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <select value={form.kondisi} onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="baik">Baik</option>
            <option value="rusak_ringan">Rusak Ringan</option>
            <option value="rusak_berat">Rusak Berat</option>
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="tersedia">Tersedia</option>
            <option value="dipinjam">Dipinjam</option>
            <option value="hilang">Hilang</option>
            <option value="rusak">Rusak</option>
          </select>
          <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            placeholder="Keterangan" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Simpan</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Judul Buku</th>
              <th className="px-4 py-3">Kondisi</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((e) => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{e.kode_eksemplar}</td>
                <td className="px-4 py-3 text-slate-800">{e.buku?.judul || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{e.kondisi}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    e.status === "tersedia" ? "bg-emerald-100 text-emerald-700" :
                    e.status === "dipinjam" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                  }`}>{e.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ buku_id: e.buku_id, kode_eksemplar: e.kode_eksemplar, kondisi: e.kondisi || "baik", status: e.status || "tersedia", keterangan: e.keterangan || "" }); setEditId(e.id); setShowForm(true); }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Belum ada eksemplar</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}