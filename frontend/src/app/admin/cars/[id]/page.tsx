'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, Tag, ImageIcon, Video, Navigation } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api'; 
import { useLoading } from '@/app/context/LoadingContext'; // Menggunakan global loading logo Hitsbah berputar

interface DestinationPrice {
  id: string;
  destination: string;
  serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN';
  price: number;
}

interface CarImage {
  id: string;
  imageUrl: string;
}

interface CarVideo {
  id: string;
  videoUrl: string;
}

interface RentalTerm {
  id: string;
  description: string;
}

interface CarDetail {
  id: string;
  name: string;
  condition: string;
  status: string;
  images: CarImage[];
  videos?: CarVideo[];
  destinationPrices: DestinationPrice[];
  terms: RentalTerm[];
}

export default function AdminCarDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { showLoader, hideLoader } = useLoading();

  const [car, setCar] = useState<CarDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mendapatkan Base URL dari environment variable atau default Hostinger untuk penanganan file gambar/video
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

  useEffect(() => {
    if (!id) return;
    const fetchCarDetail = async () => {
      showLoader(); // Nyalakan animasi loading berputar logo Hitsbah
      try {
        const response = await API.get('/api/cars');
        const foundCar = response.data.data.find((item: CarDetail) => item.id === id);
        if (foundCar) {
          setCar(foundCar);
          if (foundCar.images && foundCar.images.length > 0) {
            setSelectedImage(foundCar.images[0].imageUrl);
          }
        }
      } catch (error) {
        toast.error('Gagal memuat detail armada');
      } finally {
        setIsLoading(false);
        hideLoader(); // Matikan loading
      }
    };
    fetchCarDetail();
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-bold">Memuat detail armada...</div>;
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center gap-4">
        <p className="font-semibold text-lg">Armada tidak ditemukan.</p>
        <Link href="/admin/cars" className="text-indigo-600 underline font-medium">Kembali ke Daftar Armada</Link>
      </div>
    );
  }

  // Penanganan URL gambar utama yang aman dari error slash ganda / patah
  const activeImg = selectedImage || (car.images && car.images.length > 0 ? car.images[0].imageUrl : '');
  const mainImgUrl = activeImg 
    ? (activeImg.startsWith('http') 
        ? activeImg 
        : `${backendUrl}${activeImg.startsWith('/') ? '' : '/'}${activeImg}`)
    : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'} pb-24 font-sans`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Kembali ke Daftar Armada
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 pt-2">
        
        {/* Kolom Kiri: Galeri Foto & Video */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="w-full h-[400px] sm:h-[450px] bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xl relative group">
            <img 
              src={mainImgUrl} 
              alt={car.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
              <ImageIcon size={14} className="text-indigo-400" /> {car.images?.length || 0} Foto Tersedia
            </div>
          </div>

          {/* Thumbnail Grid Foto */}
          {car.images && car.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {car.images.map((img) => {
                const thumbUrl = img.imageUrl.startsWith('http') 
                  ? img.imageUrl 
                  : `${backendUrl}${img.imageUrl.startsWith('/') ? '' : '/'}${img.imageUrl}`;
                const isSelected = selectedImage === img.imageUrl;
                return (
                  <button 
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`h-24 rounded-2xl overflow-hidden border-2 transition-all shadow-md relative cursor-pointer ${
                      isSelected ? 'border-indigo-600 dark:border-indigo-500 scale-95 ring-2 ring-indigo-500/30' : 'border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Galeri Video (Resolusi Full Cover) */}
          {car.videos && car.videos.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Video size={16} className="text-indigo-500" /> Video Dokumentasi Armada (Resolusi HD)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {car.videos.map((vid) => {
                  const vidUrl = vid.videoUrl.startsWith('http') 
                    ? vid.videoUrl 
                    : `${backendUrl}${vid.videoUrl.startsWith('/') ? '' : '/'}${vid.videoUrl}`;
                  return (
                    <div key={vid.id} className="h-72 sm:h-96 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-xl">
                      {/* Tampilan video di-set full object-cover agar HD dan proporsional */}
                      <video src={vidUrl} controls className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Informasi & Daftar Tarif Tujuan */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className={`p-8 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold opacity-50 uppercase tracking-widest">Katalog VIP</span>
            </div>

            <h1 className="text-3xl font-extrabold mb-6 tracking-tight">{car.name}</h1>

            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 mb-2 flex items-center gap-1.5">
                <Navigation size={14} /> Daftar Tarif Berdasarkan Tujuan
              </h4>
              
              {car.destinationPrices && car.destinationPrices.length > 0 ? (
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {car.destinationPrices.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{item.destination}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-indigo-500/10 text-indigo-500 mt-1 inline-block">
                          {item.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'}
                        </span>
                      </div>
                      <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-50 italic">Belum ada rincian tarif tujuan untuk armada ini.</p>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Link 
              href={`/admin/cars/edit/${car.id}`}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all text-sm cursor-pointer"
            >
              Edit Data Armada Ini
            </Link>
          </div>
        </div>
      </main>

      {/* Bagian Spesifikasi & Syarat */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="border-b border-slate-200 dark:border-slate-800 flex gap-8 mb-6">
          <span className="pb-4 font-semibold text-sm text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-500">
            Spesifikasi & Ketentuan Sewa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className={`p-8 rounded-3xl border shadow-md ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600 dark:text-indigo-400" /> Kondisi Kendaraan
            </h3>
            <p className="opacity-80 whitespace-pre-line leading-relaxed text-sm">{car.condition}</p>
          </div>

          <div className={`p-8 rounded-3xl border shadow-md ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Tag size={20} className="text-indigo-600 dark:text-indigo-400" /> Ketentuan Penyewaan
            </h3>
            {car.terms && car.terms.length > 0 ? (
              <div className="space-y-3">
                {car.terms.map((t) => (
                  <div key={t.id} className="flex items-start gap-3">
                    <CheckCircle2 className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                    <p className="opacity-80 text-sm">{t.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" size={16} />
                <p className="opacity-80 text-sm">Wajib melampirkan KTP/SIM yang valid.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}