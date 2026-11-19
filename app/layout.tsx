import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistem Informasi Sekolah",
  description: "Aplikasi Manajemen Sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 flex h-screen overflow-hidden text-slate-800`}>
        
        {/* Kita bungkus Sidebar dengan Suspense agar aman dari error Next.js 16 */}
        <Suspense fallback={<div className="w-64 bg-slate-900 h-full border-r border-slate-800"></div>}>
          <Sidebar />
        </Suspense>

        {/* Konten Utama */}
        <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}