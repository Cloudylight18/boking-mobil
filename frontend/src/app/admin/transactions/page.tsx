'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, FileText, Edit3, Calendar, Clock, MapPin, User, Navigation, Search, DollarSign, Activity, Percent, Phone, Car as CarIcon } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api'; 
import { useLoading } from '@/app/context/LoadingContext'; 

interface TransactionItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  address: string;
  carName: string;
  destination: string;
  driverName?: string;
  driverPhone?: string;
  travelDate: string;
  durationDays?: number;
  dateDetails?: string;
  shiftTime: string;
  dpAmount: number;
  remainingPay: number;
  discountAmount?: number; 
  serviceType: string;
  createdAt: string;
}

export default function AdminTransactionsPage() {
  const { showLoader, hideLoader } = useLoading();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    showLoader();
    try {
      const res = await API.get('/api/transactions');
      setTransactions(res.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat data transaksi POS.');
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus nota transaksi ini?')) return;
    showLoader();
    try {
      await API.delete(`/api/transactions/${id}`);
      toast.success('Transaksi berhasil dihapus.');
      fetchTransactions();
    } catch (error) {
      toast.error('Gagal menghapus transaksi.');
      hideLoader();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Nota Transaksi Travel & Rental</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">
            Kelola nota perjalanan, carter armada, jadwal sewa, kontak driver, dan status pelunasan pembayaran pelanggan secara real-time.
          </p>
        </div>
        <Link 
          href="/admin/transactions/create"
          className="w-full sm:w-auto justify-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus size={18} /> Buat Nota POS Baru
        </Link>
      </div>

      {/* Quick Financial Stats Cards - Diperbaiki menjadi Flex-Col agar rapi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 lg:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col gap-3 overflow-hidden">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold shrink-0">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] lg:text-xs font-extrabold uppercase tracking-wider opacity-60 mb-0.5 line-clamp-1">Total Pendapatan</p>
            <h4 className="text-lg lg:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate" title={formatRupiah(totalRevenue)}>
              {formatRupiah(totalRevenue)}
            </h4>
          </div>
        </div>
        <div className="p-4 lg:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col gap-3 overflow-hidden">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-[10px] lg:text-xs font-extrabold uppercase tracking-wider opacity-60 mb-0.5 line-clamp-1">Total DP Masuk</p>
            <h4 className="text-lg lg:text-2xl font-black truncate" title={formatRupiah(totalDp)}>
              {formatRupiah(totalDp)}
            </h4>
          </div>
        </div>
        <div className="p-4 lg:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col gap-3 overflow-hidden">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] lg:text-xs font-extrabold uppercase tracking-wider opacity-60 mb-0.5 line-clamp-1">Sisa Piutang / Pelunasan</p>
            <h4 className="text-lg lg:text-2xl font-black text-rose-600 dark:text-rose-400 truncate" title={formatRupiah(totalRemaining)}>
              {formatRupiah(totalRemaining)}
            </h4>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="p-5 lg:p-6 space-y-4">
                {/* Top Badge & Date */}
                <div className="flex justify-between items-center">
                  <span className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm line-clamp-1 truncate max-w-[60%]">
                    {tx.serviceType}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono opacity-60 shrink-0">
                    {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="overflow-hidden">
                  <h3 className="text-lg lg:text-xl font-black tracking-tight mb-0.5 flex items-center gap-2 truncate">
                    <User size={16} className="text-indigo-500 shrink-0" /> <span className="truncate">{tx.customerName}</span>
                  </h3>
                  {tx.customerPhone && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                      <Phone size={12} className="shrink-0" /> {tx.customerPhone}
                    </p>
                  )}
                  <p className="text-xs opacity-70 mt-1 line-clamp-2">
                    Alamat: {tx.address}
                  </p>
                </div>

                {/* Details List */}
                <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-[11px] lg:text-xs">
                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium shrink-0">
                      <Navigation size={13} className="text-indigo-500" /> Armada:
                    </span>
                    <span className="font-bold truncate text-right">{tx.carName}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium shrink-0">
                      <MapPin size={13} className="text-indigo-500" /> Tujuan:
                    </span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right line-clamp-1">{tx.destination}</span>
                  </div>

                  {/* Driver Info if exists */}
                  {(tx.driverName || tx.driverPhone) && (
                    <div className="flex justify-between items-center bg-emerald-500/5 dark:bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 gap-2">
                      <span className="opacity-75 flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <CarIcon size={13} /> Driver:
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 text-right truncate">
                        {tx.driverName || '-'} {tx.driverPhone ? `(${tx.driverPhone})` : ''}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium shrink-0">
                      <Calendar size={13} className="text-indigo-500" /> Jadwal:
                    </span>
                    <span className="font-medium truncate text-right">{tx.travelDate} ({tx.durationDays || 1} Hari)</span>
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <span className="opacity-70 flex items-center gap-1.5 font-medium shrink-0">
                      <Clock size={13} className="text-indigo-500" /> Jam/Shift:
                    </span>
                    <span className="font-medium truncate text-right">{tx.shiftTime}</span>
                  </div>

                  {/* Financial Summary inside Card */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 p-3 lg:p-3.5 rounded-2xl space-y-2">
                    {tx.discountAmount && tx.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                        <span className="font-medium flex items-center gap-1"><Percent size={12} /> Diskon:</span>
                        <span className="font-bold">(-) {formatRupiah(tx.discountAmount)}</span>
                      </div>
                    )}
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
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link 
                    href={`/admin/transactions/${tx.id}`}
                    className="px-3 py-2 lg:px-3.5 lg:py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={14} /> Cetak
                  </Link>
                  <Link 
                    href={`/admin/transactions/edit/${tx.id}`}
                    className="px-3 py-2 lg:px-3.5 lg:py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                </div>
                <button 
                  onClick={() => handleDelete(tx.id)}
                  className="px-3 py-2 lg:px-3.5 lg:py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
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