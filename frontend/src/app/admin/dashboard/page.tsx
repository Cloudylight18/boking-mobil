'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  DollarSign, 
  BookOpen, 
  Activity, 
  Calendar as CalendarIcon, 
  MapPin,
  User,
  Clock,
  TrendingUp,
  RotateCcw,
  CalendarDays,
  Users
} from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api'; 
import { useLoading } from '@/app/context/LoadingContext'; // Memanggil konteks loading global

interface DashboardStats {
  totalRevenue: number;
  totalDp: number;
  totalRemaining: number;
  currentMonthRevenue: number; 
  monthlyRevenueData: number[]; // Data array pendapatan [Jan, Feb, Mar, ..., Des]
  totalTransactions: number;
  knowledgeCount: number;
  visitorStats: {
    total: number;
    today: number;
    month: number;
    year: number;
  };
}

interface TransactionItem {
  id: string;
  customerName: string;
  carName: string;
  destination: string;
  travelDate: string; 
  durationDays?: number;
  dpAmount: number;
  remainingPay: number;
  createdAt: string;
}

export default function DashboardAdmin() {
  const { showLoader, hideLoader } = useLoading();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  // State untuk melacak pilihan bulan pada fitur tracking pendapatan bulanan (Default ke bulan aktif saat ini)
  const [selectedTrackingMonth, setSelectedTrackingMonth] = useState<number>(new Date().getMonth());

  useEffect(() => {
    setIsMounted(true);
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDateStr(todayStr);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    showLoader(); // Nyalakan loading logo Hitsbah berputar
    try {
      const [statsRes, txRes] = await Promise.all([
        API.get('/api/dashboard/stats'),
        API.get('/api/transactions')
      ]);
      setStats(statsRes.data.data);
      setTransactions(txRes.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
      toast.error('Gagal memuat data dari server.');
    } finally {
      setIsLoading(false);
      hideLoader(); // Matikan loading
    }
  };

  const handleResetVisitors = async () => {
    const isConfirm = window.confirm(
      'AWAS! Apakah Anda yakin ingin mereset/menghapus SEMUA data pengunjung menjadi 0?'
    );
    if (!isConfirm) return;
    
    showLoader(); // Nyalakan loading saat proses reset
    try {
      await API.delete('/api/dashboard/visit/reset');
      toast.success('Angka pengunjung berhasil di-restart ke 0!');
      await fetchData(); // Muat ulang data terbaru (loading otomatis tertangani di dalam fetchData)
    } catch (error) {
      toast.error('Gagal mereset pengunjung.');
      hideLoader(); // Matikan loading jika error
    }
  };

  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); 

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const formattedTodayDate = isMounted ? new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) : '';

  const filteredTransactions = transactions.filter(tx => {
    if (!selectedDateStr) return true;
    return tx.travelDate === selectedDateStr;
  });

  // Mendapatkan nominal pendapatan berdasarkan bulan yang dipilih di dropdown tracking
  const trackedMonthRevenue = stats?.monthlyRevenueData 
    ? stats.monthlyRevenueData[selectedTrackingMonth] 
    : 0;

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-6">
        <div className="w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-500/20 shadow-sm">
            <Clock size={12} /> {formattedTodayDate || 'Memuat Tanggal...'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dashboard Sistem</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">Kelola transaksi POS, laporan keuangan bulanan, dan kalender jadwal.</p>
        </div>
        <Link 
          href="/admin/transactions/create" 
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} /> Buat Transaksi POS
        </Link>
      </div>

      {/* Jika masih memuat data awal, sembunyikan layout inti agar tidak berantakan (digantikan oleh overlay loading) */}
      {isLoading ? (
        <div className="text-center py-28 opacity-60 font-medium tracking-wide text-sm">
          Menyiapkan data dashboard Anda...
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6">
            
            {/* --- KEUANGAN & STATISTIK --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="md:col-span-1 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] sm:text-xs uppercase tracking-wider opacity-60 font-extrabold">Total Pendapatan</p>
                    <div className="p-2 sm:p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">{formatRupiah(stats?.totalRevenue || 0)}</h2>
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
                  <div>
                    <p className="opacity-50 mb-0.5 font-medium text-[10px] sm:text-xs">Total DP</p>
                    <p className="font-bold text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400">{formatRupiah(stats?.totalDp || 0)}</p>
                  </div>
                  <div>
                    <p className="opacity-50 mb-0.5 font-medium text-[10px] sm:text-xs">Sisa Piutang</p>
                    <p className="font-bold text-[11px] sm:text-xs text-rose-600 dark:text-rose-400">{formatRupiah(stats?.totalRemaining || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-indigo-500/20">
                      <Activity size={12} /> Live Database Sync
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
                      {stats?.totalTransactions || 0} <span className="text-base sm:text-lg font-bold opacity-70">Nota</span>
                    </h3>
                  </div>
                  <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <TrendingUp size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] sm:text-xs">
                  <span className="opacity-70">Model Tabel: <code className="text-indigo-500 font-mono font-bold">Transaction</code></span>
                  <Link href="/admin/transactions" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    Lihat Semua <span className="hidden sm:inline">Nota</span> <ChevronRight size={14}/>
                  </Link>
                </div>
              </div>
            </div>

            {/* --- TRACKING PENDAPATAN BULANAN & AI KNOWLEDGE --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Kartu Tracking Pendapatan Per Bulan dengan Pilihan Interaktif */}
              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                    <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                      <CalendarDays size={18} className="text-indigo-500" /> Tracking Bulanan
                    </h3>
                    
                    {/* Dropdown Pilihan Bulan (Mulai Januari s.d Desember, termasuk September) */}
                    <select
                      value={selectedTrackingMonth}
                      onChange={(e) => setSelectedTrackingMonth(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
                    >
                      {monthNames.map((mName, idx) => (
                        <option key={idx} value={idx}>
                          Bulan: {mName} {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] sm:text-xs opacity-70 leading-relaxed mb-4">
                    Akumulasi nilai nota yang dibuat admin pada bulan <strong className="text-indigo-500">{monthNames[selectedTrackingMonth]}</strong>.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex justify-between items-center">
                  <span className="text-xs font-bold opacity-80">Pendapatan {monthNames[selectedTrackingMonth]}</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(trackedMonthRevenue)}
                  </span>
                </div>
              </div>

              {/* AI Knowledge Base */}
              <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                      <BookOpen size={16} className="text-indigo-500" /> Knowledge AI
                    </h3>
                    <Link href="/admin/knowledge" className="text-indigo-600 dark:text-indigo-400 text-[11px] sm:text-xs font-bold hover:underline">Atur Knowledge</Link>
                  </div>
                  <p className="text-[11px] sm:text-xs opacity-70 leading-relaxed">Manajemen SOP dan Berita Acara agar asisten AI dapat menjawab pelanggan dengan akurat.</p>
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex justify-between items-center mt-4">
                  <span className="text-[11px] sm:text-xs font-bold">Total SOP Aktif</span>
                  <span className="bg-indigo-600 text-white text-[11px] sm:text-xs px-3 py-1 sm:py-1.5 rounded-xl font-bold shadow-sm">{stats?.knowledgeCount || 0} Topik</span>
                </div>
              </div>

            </div>

            {/* --- JADWAL KEBERANGKATAN --- */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 sm:mb-6 gap-3">
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <CalendarIcon size={16} className="text-indigo-500" /> 
                  <span className="truncate">Jadwal Keberangkatan {selectedDateStr && `(${selectedDateStr})`}</span>
                </h3>
                {selectedDateStr && (
                  <button 
                    onClick={() => setSelectedDateStr('')}
                    className="text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-500/10 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl border border-indigo-500/20 cursor-pointer"
                  >
                    Tampilkan Semua
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:border-indigo-500/40">
                      <div className="space-y-1.5 sm:space-y-1 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-bold font-mono border border-indigo-500/20">
                            📅 {tx.travelDate}
                          </span>
                          <span className="text-[10px] sm:text-xs font-semibold opacity-70">({tx.durationDays || 1} Hari)</span>
                        </div>
                        <p className="font-bold text-xs sm:text-sm flex flex-wrap items-center gap-1.5 mt-1">
                          <User size={13} className="text-emerald-500" /> {tx.customerName} <span className="hidden sm:inline">—</span> <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{tx.carName}</span>
                        </p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right flex items-center sm:justify-end gap-2 mt-1 sm:mt-0">
                        <span className="w-full sm:w-auto text-[11px] sm:text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 rounded-xl sm:rounded-2xl border border-emerald-500/20">
                          <MapPin size={12} className="shrink-0" /> <span className="truncate">Tujuan: {tx.destination}</span>
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] sm:text-xs opacity-50 text-center py-6 sm:py-8">Tidak ada jadwal keberangkatan pada tanggal {selectedDateStr || 'ini'}.</p>
                )}
              </div>
            </div>

          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6">
            
            {/* --- KALENDER NAVIGASI --- */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <CalendarIcon size={16} className="text-indigo-500" /> Kalender
                </h3>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/10 transition cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/10 transition cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="text-center mb-4 sm:mb-5 font-black text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 tracking-wide">
                {monthNames[month]} {year}
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-extrabold opacity-60 mb-2">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-[11px] sm:text-xs">
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                  const formattedMonth = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;
                  const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

                  const hasBooking = transactions.some(tx => tx.travelDate === dateStr);
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`h-9 sm:h-10 rounded-xl sm:rounded-2xl font-bold flex flex-col items-center justify-center transition-all relative cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-105' 
                          : isToday
                          ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasBooking && (
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full absolute bottom-1 sm:bottom-1.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] sm:text-xs flex items-center justify-between opacity-70 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 inline-block" /> Ada Jadwal</span>
                <span>Klik tanggal untuk filter</span>
              </div>
            </div>

            {/* --- DATA PENGUNJUNG REAL TIME --- */}
            <div className="p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 sm:gap-2">
                  <Users size={16} className="text-indigo-500" /> Analisis pengujung website e-commerce
                </h3>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Sistem Aktif"></span>
                  <button 
                    onClick={handleResetVisitors}
                    title="Manual Reset Kunjungan"
                    className="p-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-indigo-500/20">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="text-[10px] sm:text-xs text-indigo-300 font-bold mb-1">Semua Pengunjung (Total)</p>
                    <h4 className="text-3xl sm:text-4xl font-black tracking-tight">{stats?.visitorStats?.total || 0}</h4>
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                    <Users size={24} className="text-emerald-400 sm:w-[26px] sm:h-[26px]" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 mt-2">
                  <div className="text-center sm:text-left">
                    <p className="text-[9px] sm:text-[10px] text-indigo-300 font-semibold mb-0.5 opacity-80">Hari Ini</p>
                    <p className="text-sm sm:text-base font-extrabold text-emerald-400">+{stats?.visitorStats?.today || 0}</p>
                  </div>
                  <div className="text-center sm:text-left border-l border-white/10 pl-2">
                    <p className="text-[9px] sm:text-[10px] text-indigo-300 font-semibold mb-0.5 opacity-80">Bulan Ini</p>
                    <p className="text-sm sm:text-base font-bold">{stats?.visitorStats?.month || 0}</p>
                  </div>
                  <div className="text-center sm:text-left border-l border-white/10 pl-2">
                    <p className="text-[9px] sm:text-[10px] text-indigo-300 font-semibold mb-0.5 opacity-80">Tahun Ini</p>
                    <p className="text-sm sm:text-base font-bold">{stats?.visitorStats?.year || 0}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </AdminLayout>
  );
}