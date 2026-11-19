"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, ShieldAlert, Check } from "lucide-react";

export default function ManajemenPenggunaPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const daftarRole = [
    { value: "kepala_madrasah", label: "Kepala Madrasah" },
    { value: "tu", label: "Tata Usaha (TU)" },
    { value: "bendahara", label: "Bendahara" },
    { value: "sarpras", label: "Operator Sarpras" },
    { value: "wali_kelas", label: "Wali Kelas" },
    { value: "guru", label: "Guru" },
    { value: "orang_tua", label: "Orang Tua" },
  ];

  async function loadUsers() {
    setLoading(true);
    // Ambil data dari tabel profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("role", { ascending: true });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Fungsi untuk mengubah role
  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    setUpdatingId(null);

    if (error) {
      alert("Gagal mengubah role: " + error.message);
    } else {
      // Update data di layar tanpa perlu refresh
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
        <p className="text-slate-500 text-sm mt-1">Atur hak akses (role) untuk setiap akun yang terdaftar.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Memuat data pengguna...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-500 flex flex-col items-center">
            <Users size={48} className="text-slate-300 mb-3" />
            <p>Belum ada pengguna yang terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nama / Email</th>
                  <th className="px-6 py-4">Role Saat Ini</th>
                  <th className="px-6 py-4">Ubah Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{user.nama_lengkap || "Tanpa Nama"}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 uppercase">
                        {user.role ? user.role.replace('_', ' ') : "BELUM DIATUR"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                          value={user.role || ""}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingId === user.id}
                        >
                          <option value="" disabled>-- Pilih Role --</option>
                          {daftarRole.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        {updatingId === user.id && <span className="text-blue-600 text-xs font-medium">Menyimpan...</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="text-blue-600 shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Perhatian:</strong> Mengubah role di sini akan langsung mempengaruhi menu apa yang bisa dilihat oleh pengguna tersebut saat mereka login. Pastikan Anda memberikan role yang tepat.
        </p>
      </div>
    </div>
  );
}