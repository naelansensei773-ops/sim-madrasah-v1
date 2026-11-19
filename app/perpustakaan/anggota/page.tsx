"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Anggota {
  id: string; nomor_anggota: string; nama: string; tipe: string;
  kelas: string | null; no_hp: string | null; alamat: string | null; status: string | null;
}

const emptyForm = { nomor_anggota: "", nama: "", tipe: "siswa", kelas: "", no_hp: "", alamat: "", status: "aktif" };

export default function AnggotaPage() {
  const [data, setData] = useState<Anggota[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    const { data } = await supabase.schema("perpustakaan").from("anggota").select("*").order("nama");
    setData(data || []);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim() || !form.nomor_anggota.trim()) return;
    if (editId) await supabase.schema("perpustakaan").from("anggota").update(form).eq("id", editId);
    else await supabase.schema("perpustakaan").from("anggota").insert(form);
    setForm(emptyForm); setEditId(null); setShowForm(false); fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus anggota ini?")) return;
    await supabase.schema("perpustakaan").from("anggota").delete().eq("id", id);
    fetchData();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Anggota Perpustakaan</h2>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input value={form.nomor_anggota} onChange={(e) => setForm({ ...form, nomor_anggota: e.target.value })}
            placeholder="Nomor anggota *" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
            placeholder="Nama lengkap *" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" required />
          <select value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="siswa">Siswa</option>
            <option value="guru">Guru</option>
            <option value="karyawan">Karyawan</option>
          </select>
          <input value={form.kelas} onChange={(e) => setForm({ ...form, kelas: e.target.value })}
            placeholder="Kelas (untuk siswa)" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
            placeholder="No HP" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
            placeholder="Alamat" className="border border-slate-300 rounded-lg px-3 py-2 text-sm" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
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
              <th className="px-4 py-3">No. Anggota</th>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Kelas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 w-24 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-700">{a.nomor_anggota}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{a.nama}</td>
                <td className="px-4 py-3 text-slate-500 capitalize">{a.tipe}</td>
                <td className="px-4 py-3 text-slate-500">{a.kelas || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${a.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ ...emptyForm, ...a }); setEditId(a.id); setShowForm(true); }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400">Belum ada anggota</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}