'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, FileText, Edit3, Calendar, Clock, MapPin, User, Navigation, Search, DollarSign, Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { formatRupiah } from '@/app/utils/formatRupiah';

interface TransactionItem {
  id: string;
  customerName: string;
  address: string;
  carName: string;
  destination: string;
  travelDate: string;
  durationDays?: number;
  dateDetails?: string;
  shiftTime: string;
  dpAmount: number;
  remainingPay: number;
  serviceType: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(res.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat data transaksi POS.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus nota transaksi ini?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      toast.success('Transaksi berhasil dihapus.');
      fetchTransactions();
    } catch (error) {
      toast.error('Gagal menghapus transaksi.');
    }
  };

  // Filter pencarian berdasarkan nama customer, armada, atau tujuan
  const filteredTransactions = transactions.filter(tx => 
    tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Kalkulasi Statistik Keuangan Cepat
  const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.dpAmount + curr.remainingPay), 0);
  const totalDp = transactions.reduce((acc, curr) => acc + curr.dpAmount, 0);
  const totalRemaining = transactions.reduce((acc, curr) => acc + curr.remainingPay, 0);

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-500/20 shadow-sm">
            <FileText size={14} /> POS Kasir & Perjalanan
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Nota Transaksi Travel & Rental</h1>
          <p className="text-sm opacity-70 mt-1">
            Kelola nota perjalanan, carter armada, jadwal sewa, dan status pelunasan pembayaran pelanggan secara real-time.
          </p>
        </div>
        <Link 
          href="/admin/transactions/create"
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus size={18} /> Buat Nota POS Baru
        </Link>
      </div>

      {/* Quick Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Total Pendapatan</p>
            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(totalRevenue)}</h4>
          </div>
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Total DP Masuk</p>
            <h4 className="text-2xl font-black">{formatRupiah(totalDp)}</h4>
          </div>
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Sisa Piutang / Pelunasan</p>
            <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">{formatRupiah(totalRemaining)}</h4>
          </div>
        </div>
      </div>

      {/* Search Bar for Admin */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-indigo-500" size={18} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama pemesan, armada, atau tujuan..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="text-center py-28 opacity-60 font-medium tracking-wide">Memuat data transaksi dari database...</div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400">
          <FileText size={48} className="mx-auto mb-3 opacity-40 text-indigo-500" />
          <p className="font-bold text-base">Belum ada nota transaksi tercatat.</p>
          <p className="text-xs opacity-70 mt-1">Silakan buat nota pemesanan baru melalui tombol di atas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                {/* Top Badge & Date */}
                <div className="flex justify-between items-center">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm">
                    {tx.serviceType}
                  </span>
                  <span className="text-xs font-mono opacity-60">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-xl font-black tracking-tight mb-0.5 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> {tx.customerName}
                  </h3>
                  <p className="text-xs opacity-70 line-clamp-1">
                    Alamat: {tx.address}
                  </p>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium">
                      <Navigation size={13} className="text-indigo-500" /> Armada:
                    </span>
                    <span className="font-bold">{tx.carName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-indigo-500" /> Tujuan:
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right">{tx.destination}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium">
                      <Calendar size={13} className="text-indigo-500" /> Jadwal:
                    </span>
                    <span className="font-medium">{tx.travelDate} ({tx.durationDays || 1} Hari)</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-indigo-500" /> Jam / Shift:
                    </span>
                    <span className="font-medium">{tx.shiftTime}</span>
                  </div>

                  {/* Financial Summary inside Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-3.5 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 font-medium">DP (Uang Muka):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(tx.dpAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-75 font-medium">Sisa Pelunasan:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatRupiah(tx.remainingPay)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link 
                    href={`/admin/transactions/${tx.id}`}
                    className="px-3.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={14} /> Cetak
                  </Link>
                  <Link 
                    href={`/admin/transactions/edit/${tx.id}`}
                    className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                </div>
                <button 
                  onClick={() => handleDelete(tx.id)}
                  className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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