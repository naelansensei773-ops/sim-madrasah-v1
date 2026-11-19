"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Pengarang { id: string; nama: string; keterangan: string | null; }

export default function PengarangPage() {
  const [data, setData] = useState<Pengarang[]>([]);
  const [form, setForm] = useState({ nama: "", keterangan: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("pengarang").select("*").order("nama");
    setData(data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) return;
    if (editId) await supabase.schema("perpustakaan").from("pengarang").update(form).eq("id", editId);
    else await supabase.schema("perpustakaan").from("pengarang").insert(form);
    setForm({ nama: "", keterangan: "" });
    setEditId(null);
    setShowForm(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengarang ini?")) return;
    await supabase.schema("perpustakaan").from("pengarang").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Data Pengarang</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", keterangan: "" }); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2">
          <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama pengarang" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
            placeholder="Keterangan (opsional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Simpan</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-600">
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((k) => (
              <tr key={k.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{k.nama}</td>
                <td className="px-4 py-3 text-slate-500">{k.keterangan || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ nama: k.nama, keterangan: k.keterangan || "" }); setEditId(k.id); setShowForm(true); }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Belum ada pengarang</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}