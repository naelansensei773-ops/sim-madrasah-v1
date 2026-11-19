"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Penerbit { id: string; nama: string; kota: string | null; keterangan: string | null; }

export default function PenerbitPage() {
  const [data, setData] = useState<Penerbit[]>([]);
  const [form, setForm] = useState({ nama: "", kota: "", keterangan: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("penerbit").select("*").order("nama");
    setData(data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim()) return;
    if (editId) await supabase.schema("perpustakaan").from("penerbit").update(form).eq("id", editId);
    else await supabase.schema("perpustakaan").from("penerbit").insert(form);
    setForm({ nama: "", kota: "", keterangan: "" });
    setEditId(null);
    setShowForm(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus penerbit ini?")) return;
    await supabase.schema("perpustakaan").from("penerbit").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Data Penerbit</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ nama: "", kota: "", keterangan: "" }); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-lg mb-4 space-y-2">
          <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama penerbit" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })}
            placeholder="Kota (opsional)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
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
              <th className="px-4 py-3">Kota</th>
              <th className="px-4 py-3">Keterangan</th>
              <th className="px-4 py-3 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((k) => (
              <tr key={k.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{k.nama}</td>
                <td className="px-4 py-3 text-slate-500">{k.kota || "-"}</td>
                <td className="px-4 py-3 text-slate-500">{k.keterangan || "-"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ nama: k.nama, kota: k.kota || "", keterangan: k.keterangan || "" }); setEditId(k.id); setShowForm(true); }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(k.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Belum ada penerbit</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}