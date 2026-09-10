'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, Edit3, BookOpen, Search } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { API } from '@/app/utils/api'; // Menggunakan instance API global
import { useLoading } from '@/app/context/LoadingContext'; // Memanggil konteks loading global

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

export default function AdminKnowledgePage() {
  const { showLoader, hideLoader } = useLoading(); // Inisialisasi fungsi loading global
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    showLoader(); // Nyalakan animasi loading global saat mengambil data
    try {
      // Menggunakan instance API global
      const res = await API.get('/api/knowledge');
      setItems(res.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat database knowledge.');
    } finally {
      setIsLoading(false);
      hideLoader(); // Matikan animasi loading global
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus informasi knowledge ini?')) return;
    
    showLoader(); // Nyalakan animasi loading global saat proses hapus
    try {
      // Menggunakan instance API global untuk hapus data
      await API.delete(`/api/knowledge/${id}`);
      toast.success('Knowledge berhasil dihapus.');
      await fetchKnowledge(); // Memuat ulang data (loading ditangani di dalam fetchKnowledge)
    } catch (error) {
      toast.error('Gagal menghapus knowledge.');
      hideLoader(); // Matikan loading jika terjadi error
    }
  };

  // Filter pencarian berdasarkan judul, kategori, atau isi konten
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-wider mb-2 border border-emerald-500/20 shadow-sm">
            <BookOpen size={14} /> AI Knowledge Base
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Database Knowledge Hitsbah AI</h1>
          <p className="text-sm opacity-70 mt-1">
            Kelola informasi, SOP, rute, dan FAQ agar asisten AI dapat menjawab pelanggan dengan akurat dan profesional.
          </p>
        </div>
        <Link 
          href="/admin/knowledge/create"
          className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus size={18} /> Tambah Knowledge Baru
        </Link>
      </div>

      {/* Search Bar for Admin */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-emerald-500" size={18} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari topik, kategori, atau isi SOP..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="text-center py-28 opacity-60 font-medium tracking-wide">Memuat data knowledge dari database...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400">
          <BookOpen size={48} className="mx-auto mb-3 opacity-40 text-emerald-500" />
          <p className="font-bold text-base">Belum ada data knowledge tersimpan.</p>
          <p className="text-xs opacity-70 mt-1">Silakan tambahkan topik SOP atau FAQ baru melalui tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1 p-6"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                    <BookOpen size={12} /> {item.category}
                  </span>
                  <span className="text-xs font-mono opacity-60">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs opacity-80 line-clamp-4 leading-relaxed whitespace-pre-wrap mb-6">
                  {item.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <Link 
                  href={`/admin/knowledge/edit/${item.id}`}
                  className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 size={14} /> Edit
                </Link>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}