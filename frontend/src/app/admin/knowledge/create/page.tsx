'use client';
import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../dashboard/components/AdminNavbar';

export default function AdminKnowledgeCreatePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FAQ');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/knowledge', { title, category, content });
      toast.success('Knowledge berhasil ditambahkan ke AI!');
      setTimeout(() => router.push('/admin/knowledge'), 1000);
    } catch (error) {
      toast.error('Gagal menyimpan knowledge.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/admin/knowledge" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition">
            <ArrowLeft size={16} /> Kembali ke Knowledge
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Tambah Knowledge Baru</h1>
          <p className="text-sm opacity-70">Masukkan informasi agar Hitsbah AI dapat membaca dan menjawab pelanggan.</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 opacity-70">Judul / Topik</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Jam Operasional & Ketentuan Sewa" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2 opacity-70">Kategori</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="FAQ">FAQ / Tanya Jawab</option>
                <option value="SOP">SOP / Ketentuan</option>
                <option value="Rute">Rute & Destinasi</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Isi Pengetahuan (Content)</label>
            <textarea 
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan detail informasi selengkap-lengkapnya agar AI paham..." 
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-700">
            <Link 
              href="/admin/knowledge"
              className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Save size={18} /> Simpan Knowledge
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}