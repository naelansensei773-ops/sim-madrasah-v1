"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { href: "/perpustakaan", label: "Dashboard", exact: true },
  { href: "/perpustakaan/kategori", label: "Kategori" },
  { href: "/perpustakaan/pengarang", label: "Pengarang" },
  { href: "/perpustakaan/penerbit", label: "Penerbit" },
  { href: "/perpustakaan/buku", label: "Katalog Buku" },
  { href: "/perpustakaan/eksemplar", label: "Eksemplar" },
  { href: "/perpustakaan/anggota", label: "Anggota" },
  { href: "/perpustakaan/peminjaman", label: "Peminjaman" },
];

export default function PerpusLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-4">📚 Perpustakaan</h1>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {menus.map((m) => {
          const active = m.exact ? pathname === m.href : pathname.startsWith(m.href);
          return (
            <Link key={m.href} href={m.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}>
              {m.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}