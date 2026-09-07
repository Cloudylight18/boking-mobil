'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowRight, Navigation, Sparkles, Car as CarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
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
  status: string;
  images: { imageUrl: string }[];
  destinationPrices: DestinationPrice[];
}

interface CatalogProps {
  searchQuery: string;
  isDarkMode: boolean;
}

export default function CarCatalog({ searchQuery, isDarkMode }: CatalogProps) {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // HARDCODE URL BACKEND PRODUKSI: Tidak bergantung pada .env / localhost lagi
        const backendUrl = 'https://steelblue-fox-791845.hostingersite.com';
        
        const response = await axios.get(`${backendUrl}/api/cars`);
        setCars(response.data.data || []);
      } catch (error) {
        toast.error('Gagal memuat katalog mobil');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCars();
  }, []);

  // Filter mobil berdasarkan input pencarian nama mobil
  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="katalog" className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      
      {/* Header Section */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b pb-6 gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-extrabold uppercase tracking-widest mb-3 shadow-sm">
            <Sparkles size={14} /> Armada Pilihan Terbaik
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Katalog Mobil & <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Status Ketersediaan</span>
          </h2>
          <p className={`text-xs sm:text-sm md:text-base mt-2 max-w-2xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Pilih unit kendaraan impianmu, nikmati perjalanan aman bersama supir profesional atau ambil paket Carter All-in Bersih anti ribet.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className={`text-center py-28 font-medium animate-pulse ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Sedang menyiapkan armada terbaik untuk Anda...
        </div>
      ) : filteredCars.length === 0 ? (
        <div className={`text-center py-16 px-4 rounded-3xl border border-dashed ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-600'}`}>
          <CarIcon size={48} className="mx-auto mb-3 opacity-40 text-emerald-500" />
          <p className="font-bold text-base">Tidak ada armada mobil yang cocok dengan pencarian Anda.</p>
          <p className="text-xs opacity-70 mt-1">Coba gunakan kata kunci nama mobil yang lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredCars.map((car) => {
            const activeImg = car.images?.[0]?.imageUrl;
            const backendUrl = 'https://steelblue-fox-791845.hostingersite.com';
            const mainImg = activeImg 
              ? (activeImg.startsWith('http') ? activeImg : `${backendUrl}${activeImg}`)
              : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80';

            return (
              <Link 
                href={`/mobil/${car.id}`} 
                key={car.id} 
                className={`rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col justify-between group shadow-xl hover:shadow-2xl hover:-translate-y-2 ${
                  isDarkMode 
                    ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/50 text-white' 
                    : 'bg-white border-slate-200/80 hover:border-emerald-500/50 text-slate-900'
                }`}
              >
                <div>
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-slate-950">
                    <img 
                      src={mainImg} 
                      alt={car.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                    
                    <span className={`absolute top-4 right-4 backdrop-blur-xl px-3.5 py-1 rounded-full text-xs font-bold shadow-lg border transition-transform duration-300 group-hover:scale-105 ${
                      car.status === 'AVAILABLE' 
                        ? 'bg-emerald-500/90 text-white border-emerald-400/30' 
                        : car.status === 'MAINTENANCE'
                        ? 'bg-amber-500/90 text-white border-amber-400/30'
                        : 'bg-rose-500/90 text-white border-rose-400/30'
                    }`}>
                      {car.status === 'AVAILABLE' ? '🟢 Tersedia' : car.status === 'MAINTENANCE' ? '🔧 Maintenance' : '🔴 Disewa'}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className={`text-xl sm:text-2xl font-black tracking-tight mb-4 group-hover:text-emerald-500 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {car.name}
                    </h3>
                    
                    <div className={`space-y-2.5 border-t pt-4 sm:pt-5 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5 mb-3">
                        <Navigation size={13} /> Tarif Rute & Layanan:
                      </span>
                      {car.destinationPrices && car.destinationPrices.length > 0 ? (
                        <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {car.destinationPrices.map((item) => (
                            <div 
                              key={item.id} 
                              className={`flex justify-between items-center text-xs p-3 rounded-2xl border transition-colors ${
                                isDarkMode ? 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/80'
                              }`}
                            >
                              <div>
                                <p className="font-bold text-sm">{item.destination}</p>
                                <span className="text-[10px] font-medium opacity-70">
                                  {item.serviceType === 'WITH_DRIVER' ? '🚗 Mobil + Supir' : '✨ Carter All-in Bersih'}
                                </span>
                              </div>
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                {formatRupiah(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs opacity-50 italic py-2">Hubungi admin untuk info tarif rute khusus.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800/80 group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 text-slate-800 dark:text-white group-hover:text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 text-sm shadow-md group-hover:shadow-lg group-hover:shadow-emerald-600/30">
                    <span>Lihat Detail & Rute</span> 
                    <ArrowRight size={16} className="transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}