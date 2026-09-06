'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2, Edit3, Eye, Navigation, Car as CarIcon, Search, CheckCircle2, Wrench, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import { formatRupiah } from '@/app/utils/formatRupiah';

interface DestinationPrice {
  id: string;
  destination: string;
  serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN';
  price: number;
}

interface CarItem {
  id: string;
  name: string;
  condition: string;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  images: { id: string; imageUrl: string }[];
  destinationPrices: DestinationPrice[];
  terms: { id: string; description: string }[];
}

export default function AdminCarsPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cars');
      setCars(res.data.data || []);
    } catch (error) {
      toast.error('Gagal memuat data armada.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus armada ini beserta seluruh data tarifnya?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/cars/${id}`);
      toast.success('Armada berhasil dihapus.');
      fetchCars();
    } catch (error) {
      toast.error('Gagal menghapus armada.');
    }
  };

  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableCount = cars.filter(c => c.status === 'AVAILABLE').length;
  const maintenanceCount = cars.filter(c => c.status === 'MAINTENANCE').length;
  const unavailableCount = cars.filter(c => c.status === 'UNAVAILABLE').length;

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-6 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-wider mb-2 border border-indigo-500/20 shadow-sm">
            <CarIcon size={14} /> Panel Kontrol Armada
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Manajemen Armada Kendaraan</h1>
          <p className="text-sm opacity-70 mt-1">
            Kelola katalog mobil, rute tujuan fleksibel, tarif layanan, dan status ketersediaan operasional secara real-time.
          </p>
        </div>
        <Link 
          href="/admin/cars/create"
          className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 hover:-translate-y-0.5 cursor-pointer shrink-0 transition-all"
        >
          <Plus size={18} /> Tambah Armada Baru
        </Link>
      </div>

      {/* Quick Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <CarIcon size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Total Unit</p>
            <h4 className="text-2xl font-black">{cars.length}</h4>
          </div>
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Tersedia</p>
            <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{availableCount}</h4>
          </div>
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Wrench size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Maintenance</p>
            <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">{maintenanceCount}</h4>
          </div>
        </div>
        <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">Disewa</p>
            <h4 className="text-2xl font-black text-rose-600 dark:text-rose-400">{unavailableCount}</h4>
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
          placeholder="Cari nama armada mobil..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 shadow-sm"
        />
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div className="text-center py-28 opacity-60 font-medium tracking-wide">Memuat data armada dari database...</div>
      ) : filteredCars.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/40 text-slate-500 dark:text-slate-400">
          <CarIcon size={48} className="mx-auto mb-3 opacity-40 text-indigo-500" />
          <p className="font-bold text-base">Tidak ada armada mobil yang ditemukan.</p>
          <p className="text-xs opacity-70 mt-1">Coba gunakan kata kunci pencarian lain atau tambahkan armada baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCars.map((car) => {
            const mainImage = car.images?.[0]?.imageUrl 
              ? (car.images[0].imageUrl.startsWith('http') ? car.images[0].imageUrl : `http://localhost:5000${car.images[0].imageUrl}`)
              : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80';

            return (
              <div 
                key={car.id} 
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1"
              >
                <div>
                  {/* Gambar & Status Badge */}
                  <div className="relative h-56 w-full bg-slate-950 overflow-hidden group">
                    <img 
                      src={mainImage} 
                      alt={car.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-95" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-85"></div>
                    
                    <span className={`absolute top-4 right-4 px-3.5 py-1.5 rounded-full text-xs font-black uppercase backdrop-blur-xl shadow-lg border ${
                      car.status === 'AVAILABLE' 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/30' 
                        : car.status === 'MAINTENANCE'
                        ? 'bg-amber-500/90 text-white border-amber-400/30'
                        : 'bg-rose-500/90 text-white border-rose-400/30'
                    }`}>
                      {car.status === 'AVAILABLE' ? '🟢 Tersedia' : car.status === 'MAINTENANCE' ? '🔧 Maintenance' : '🔴 Disewa'}
                    </span>

                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-black/50 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 shadow-sm">
                        {car.images?.length || 0} Foto • {car.destinationPrices?.length || 0} Rute
                      </span>
                    </div>
                  </div>

                  {/* Informasi Kendaraan & Rute Harga */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-black tracking-tight mb-1">{car.name}</h3>
                      <p className="text-xs line-clamp-2 leading-relaxed opacity-70">
                        {car.condition}
                      </p>
                    </div>
                    
                    {/* Daftar Tarif Berdasarkan Tujuan */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                          <Navigation size={12} /> Tarif Berdasarkan Tujuan:
                        </span>
                      </div>

                      {car.destinationPrices && car.destinationPrices.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {car.destinationPrices.map((item) => (
                            <div 
                              key={item.id} 
                              className="flex justify-between items-center text-xs p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition"
                            >
                              <div className="space-y-0.5 pr-2">
                                <p className="font-bold">{item.destination}</p>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 inline-block">
                                  {item.serviceType === 'WITH_DRIVER' ? '🚗 Mobil + Supir' : '✨ Carter All-in Bersih'}
                                </span>
                              </div>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm shrink-0">
                                {formatRupiah(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs opacity-50 italic py-2 text-center">Belum ada rincian tarif tujuan.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi Bawah */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-2">
                  <Link 
                    href={`/admin/cars/${car.id}`}
                    className="px-3.5 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} /> Detail
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <Link 
                      href={`/admin/cars/edit/${car.id}`}
                      className="px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 size={14} /> Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(car.id)}
                      className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}