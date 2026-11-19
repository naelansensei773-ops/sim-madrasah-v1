"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Buku {
  id: string;
  isbn: string | null;
  judul: string;
  kategori_id: string | null;
  pengarang_id: string | null;
  penerbit_id: string | null;
  tahun_terbit: number | null;
  bahasa: string | null;
  jumlah_halaman: number | null;
  sinopsis: string | null;
  cover_url: string | null;
  kategori?: { nama: string } | null;
  pengarang?: { nama: string } | null;
  penerbit?: { nama: string } | null;
}

interface Ref { id: string; nama: string; }

const emptyForm = {
  isbn: "", judul: "", kategori_id: "", pengarang_id: "", penerbit_id: "",
  tahun_terbit: "", bahasa: "Indonesia", jumlah_halaman: "", sinopsis: "", cover_url: "",
};

export default function BukuPage() {
  const [data, setData] = useState<Buku[]>([]);
  const [kategori, setKategori] = useState<Ref[]>([]);
  const [pengarang, setPengarang] = useState<Ref[]>([]);
  const [penerbit, setPenerbit] = useState<Ref[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("buku")
      .select(`*, kategori:kategori_id(nama), pengarang:pengarang_id(nama), penerbit:penerbit_id(nama)`)
      .order("judul");
    setData(data || []);
  }, []);

  const fetchRefs = useCallback(async () => {
    const [k, p, pn] = await Promise.all([
      supabase.schema("perpustakaan").from("kategori").select("id,nama").order("nama"),
      supabase.schema("perpustakaan").from("pengarang").select("id,nama").order("nama"),
      supabase.schema("perpustakaan").from("penerbit").select("id,nama").order("nama"),
    ]);
    setKategori(k.data || []);
    setPengarang(p.data || []);
    setPenerbit(pn.data || []);
  }, []);

  useEffect(() => { fetchData(); fetchRefs(); }, [fetchData, fetchRefs]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim()) return;
    const payload = {
      ...form,
      kategori_id: form.kategori_id || null,
      pengarang_id: form.pengarang_id || null,
      penerbit_id: form.penerbit_id || null,
      tahun_terbit: form.tahun_terbit ? Number(form.tahun_terbit) : null,
      jumlah_halaman: form.jumlah_halaman ? Number(form.jumlah_halaman) : null,
    };
    if (editId) await supabase.schema("perpustakaan").from("buku").update(payload).eq("id", editId);
    else await supabase.schema("perpustakaan").from("buku").insert(payload);
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus buku ini? Semua eksemplar terkait akan ikut terhapus.")) return;
    await supabase.schema("perpustakaan").from("buku").delete().eq("id", id);
    fetchData();
  }

  const filtered = data.filter((b) =>
    b.judul.toLowerCase().includes(search.toLowerCase()) ||
    (b.isbn || "").includes(search)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Katalog Buku</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Tambah Buku
        </button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Cari judul / ISBN..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4" />

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })}
            placeholder="Judul buku *" className="md:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })}
            placeholder="ISBN" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <select value={form.kategori_id} onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">-- Kategori --</option>
            {kategori.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <select value={form.pengarang_id} onChange={(e) => setForm({ ...form, pengarang_id: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">-- Pengarang --</option>
            {pengarang.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
          <select value={form.penerbit_id} onChange={(e) => setForm({ ...form, penerbit_id: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="">-- Penerbit --</option>
            {penerbit.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
          </select>
          <input value={form.tahun_terbit} onChange={(e) => setForm({ ...form, tahun_terbit: e.target.value })}
            type="number" placeholder="Tahun terbit" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.jumlah_halaman} onChange={(e) => setForm({ ...form, jumlah_halaman: e.target.value })}
            type="number" placeholder="Jumlah halaman" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.bahasa} onChange={(e) => setForm({ ...form, bahasa: e.target.value })}
            placeholder="Bahasa" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
            placeholder="URL cover (opsional)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <textarea value={form.sinopsis} onChange={(e) => setForm({ ...form, sinopsis: e.target.value })}
            placeholder="Sinopsis" rows={2} className="md:col-span-2 border border-slate-300 rounded-lg px-3 py-2 text-sm" />
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
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Pengarang</th>
              <th className="px-4 py-3">Penerbit</th>
              <th className="px-4 py-3">Tahun</th>
              <th className="px-4 py-3 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{b.judul}</td>
                <td className="px-4 py-3 text-slate-500">{b.kategori?.nama || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{b.pengarang?.nama || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{b.penerbit?.nama || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{b.tahun_terbit || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => {
                    setForm({ ...emptyForm, ...b, kategori_id: b.kategori_id || "", pengarang_id: b.pengarang_id || "", penerbit_id: b.penerbit_id || "" });
                    setEditId(b.id); setShowForm(true);
                  }} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Belum ada buku</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}