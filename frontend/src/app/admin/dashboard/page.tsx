'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  Wrench, 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Car, 
  BookOpen, 
  Activity, 
  Calendar as CalendarIcon, 
  MapPin,
  User,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/app/utils/formatRupiah';

interface DashboardStats {
  totalCars: number;
  availableCars: number;
  maintenanceCars: number;
  unavailableCars: number;
  totalRevenue: number;
  totalDp: number;
  totalRemaining: number;
  totalTransactions: number;
  knowledgeCount: number;
  visitorCount: number;
}

interface TransactionItem {
  id: string;
  customerName: string;
  carName: string;
  destination: string;
  travelDate: string; // Format: 'YYYY-MM-DD'
  durationDays?: number;
  dpAmount: number;
  remainingPay: number;
  createdAt: string;
}

export default function DashboardAdmin() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // State untuk Navigasi Kalender (Bulan & Tanggal yang dipilih)
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDateStr(todayStr);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, txRes] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard/stats'),
        axios.get('http://localhost:5000/api/transactions')
      ]);
      setStats(statsRes.data.data);
      setTransactions(txRes.data.data || []);
    } catch (error) {
      console.error('Gagal mengambil data dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigasi Bulan Sebelumnya / Berikutnya
  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Kalkulasi Hari dalam Bulan yang sedang dilihat
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // Hari pertama dalam minggu (0=Minggu)

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

  // Filter transaksi berdasarkan tanggal yang diklik di kalender
  const filteredTransactions = transactions.filter(tx => {
    if (!selectedDateStr) return true;
    return tx.travelDate === selectedDateStr;
  });

  return (
    <AdminLayout>
      {/* Title & Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-500/20 shadow-sm">
            <Clock size={12} /> {formattedTodayDate || 'Memuat Tanggal...'}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Sistem</h1>
          <p className="text-sm opacity-70 mt-1">Kelola armada mobil, transaksi POS, dan kalender jadwal perjalanan secara real-time.</p>
        </div>
        <Link 
          href="/admin/transactions/create" 
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} /> Buat Transaksi POS
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-28 opacity-60 font-medium tracking-wide">Memuat data real-time dari database...</div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (Spans 8) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Row 1: Keuangan & Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Total Pendapatan POS */}
              <div className="col-span-1 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-wider opacity-60 font-extrabold">Total Pendapatan</p>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <DollarSign size={18} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-black tracking-tight">{formatRupiah(stats?.totalRevenue || 0)}</h2>
                  </div>
                </div>
                <div className="flex justify-between text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="opacity-50 mb-0.5 font-medium">Total DP</p>
                    <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{formatRupiah(stats?.totalDp || 0)}</p>
                  </div>
                  <div>
                    <p className="opacity-50 mb-0.5 font-medium">Sisa Piutang</p>
                    <p className="font-bold text-xs text-rose-600 dark:text-rose-400">{formatRupiah(stats?.totalRemaining || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Statistik Transaksi Summary */}
              <div className="col-span-2 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold uppercase tracking-wider mb-2 border border-indigo-500/20">
                      <Activity size={12} /> Live Database Sync
                    </div>
                    <h3 className="text-4xl font-black tracking-tight mt-1">{stats?.totalTransactions || 0} <span className="text-lg font-bold opacity-70">Nota Transaksi</span></h3>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                  <span className="opacity-70">Model Tabel: <code className="text-indigo-500 font-mono font-bold">Transaction</code></span>
                  <Link href="/admin/transactions" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">Lihat Semua Nota <ChevronRight size={14}/></Link>
                </div>
              </div>

            </div>

            {/* Row 2: Status Armada & AI Knowledge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Status Armada Mobil */}
              <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                    <Car size={16} className="text-indigo-500" /> Status Armada ({stats?.totalCars || 0} Unit)
                  </h3>
                  <Link href="/admin/cars" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">Kelola Mobil</Link>
                </div>
                <div className="flex flex-col gap-3.5 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 size={16}/></div>
                    <div className="flex-1 font-bold text-xs">AVAILABLE (Tersedia)</div>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">{stats?.availableCars || 0} Unit</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Wrench size={16}/></div>
                    <div className="flex-1 font-bold text-xs">MAINTENANCE (Servis)</div>
                    <span className="font-black text-orange-600 dark:text-orange-400">{stats?.maintenanceCars || 0} Unit</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0"><ShieldAlert size={16}/></div>
                    <div className="flex-1 font-bold text-xs">UNAVAILABLE (Disewa)</div>
                    <span className="font-black text-rose-600 dark:text-rose-400">{stats?.unavailableCars || 0} Unit</span>
                  </div>
                </div>
              </div>

              {/* AI Knowledge Base */}
              <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-500" /> Knowledge Base AI
                    </h3>
                    <Link href="/admin/knowledge" className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">Atur Knowledge</Link>
                  </div>
                  <p className="text-xs opacity-70 leading-relaxed">Manajemen SOP dan Berita Acara agar asisten AI dapat menjawab pelanggan dengan akurat.</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex justify-between items-center mt-4">
                  <span className="text-xs font-bold">Total Topik / SOP Aktif</span>
                  <span className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold shadow-sm">{stats?.knowledgeCount || 0} Topik</span>
                </div>
              </div>

            </div>

            {/* Row 3: Jadwal Keberangkatan Berdasarkan Tanggal Terpilih */}
            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={16} className="text-indigo-500" /> 
                  Jadwal Keberangkatan ({selectedDateStr ? selectedDateStr : 'Semua Tanggal'})
                </h3>
                {selectedDateStr && (
                  <button 
                    onClick={() => setSelectedDateStr('')}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20 cursor-pointer"
                  >
                    Tampilkan Semua
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition hover:border-indigo-500/40">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono border border-indigo-500/20">
                            📅 {tx.travelDate}
                          </span>
                          <span className="text-xs font-semibold opacity-70">({tx.durationDays || 1} Hari)</span>
                        </div>
                        <p className="font-bold text-sm flex items-center gap-1.5 mt-1">
                          <User size={14} className="text-emerald-500" /> {tx.customerName} — <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{tx.carName}</span>
                        </p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-2xl border border-emerald-500/20">
                          <MapPin size={13} /> Tujuan: {tx.destination}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs opacity-50 text-center py-8">Tidak ada jadwal keberangkatan pada tanggal {selectedDateStr || 'ini'}.</p>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Spans 4) - Interactive Calendar with Prev/Next */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            
            {/* Widget Kalender Interaktif Lengkap */}
            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <CalendarIcon size={16} className="text-indigo-500" /> Navigasi Kalender
                </h3>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/10 transition cursor-pointer"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-500/10 transition cursor-pointer"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="text-center mb-5 font-black text-sm text-indigo-600 dark:text-indigo-400 tracking-wide">
                {monthNames[month]} {year}
              </div>

              {/* Grid Hari */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold opacity-60 mb-2">
                <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
              </div>

              {/* Grid Tanggal Bulan */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {/* Spasi untuk hari kosong di awal bulan */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Render Tanggal */}
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
                      className={`h-10 rounded-2xl font-bold flex flex-col items-center justify-center transition-all relative cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30 scale-105' 
                          : isToday
                          ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{dayNum}</span>
                      {hasBooking && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between opacity-70 font-medium">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Ada Jadwal Sewa</span>
                <span>Klik tanggal untuk filter</span>
              </div>
            </div>

            {/* Website Visitor Counter */}
            <div className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                  <Users size={16} className="text-indigo-500" /> Pengunjung E-commerce
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center border border-indigo-500/20">
                <div>
                  <p className="text-xs text-indigo-300 font-bold mb-1">Total Kunjungan Toko</p>
                  <h4 className="text-4xl font-black tracking-tight">{stats?.visitorCount || 0}</h4>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <Users size={26} className="text-emerald-400" />
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </AdminLayout>
  );
}