'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, ArrowLeft, CheckCircle2, Moon, Sun, Navigation, Video, Maximize2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
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

export default function DetailMobilPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { showLoader, hideLoader } = useLoading();

  const [car, setCar] = useState<CarDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'terms'>('description');
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Popup Modal Video Fullscreen
  const [activeVideoPopup, setActiveVideoPopup] = useState<string | null>(null);
  
  // Default awal dimulai dari mode Terang (Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mendapatkan Base URL dari environment variable atau default Hostinger untuk penanganan gambar dan video
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

  useEffect(() => {
    if (!id) return;
    const fetchCarDetail = async () => {
      showLoader(); // Nyalakan animasi loading logo Hitsbah berputar
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
        toast.error('Gagal memuat detail mobil');
      } finally {
        setIsLoading(false);
        hideLoader(); // Matikan loading logo Hitsbah berputar
      }
    };
    fetchCarDetail();
  }, [id, backendUrl]);

  const handleBookingWa = (item: DestinationPrice) => {
    if (!car) return;
    const phone = '6289623021975'; // Nomor WhatsApp resmi Hitsbah Transport
    const serviceLabel = item.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih';
    const text = `Halo Admin, saya ingin memesan mobil *${car.name}* dengan tujuan *${item.destination}* (${serviceLabel}) seharga ${formatRupiah(item.price)}. Mohon ketersediaannya.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-600'}`}>
        Memuat detail armada...
      </div>
    );
  }

  if (!car) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <p>Mobil tidak ditemukan.</p>
        <Link href="/?tab=katalog" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Kembali ke Katalog</Link>
      </div>
    );
  }

  const activeImg = selectedImage || (car.images && car.images.length > 0 ? car.images[0].imageUrl : '');
  const mainImgUrl = activeImg 
    ? (activeImg.startsWith('http') 
        ? activeImg 
        : `${backendUrl}${activeImg.startsWith('/') ? '' : '/'}${activeImg}`)
    : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Toaster position="top-right" />

      {/* Top Navigation & Dark Mode Toggle - Mengarahkan kembali langsung ke Katalog */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link 
          href="/?tab=katalog" 
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <ArrowLeft size={16} /> Kembali ke Katalog
        </Link>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Detail Section */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        
        {/* Kolom Kiri: Galeri Foto & Video */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {/* Foto Utama */}
            <div className={`w-full rounded-3xl overflow-hidden border h-[400px] sm:h-[450px] shadow-xl ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
              <img 
                src={mainImgUrl} 
                alt={car.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
              />
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
                        isSelected ? 'border-indigo-600 dark:border-indigo-500 scale-95 ring-2 ring-indigo-500/30' : 'border-slate-300 dark:border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={thumbUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Galeri Video (Jika Ada) */}
          {car.videos && car.videos.length > 0 && (
            <div className="pt-4">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Video size={16} className="text-indigo-500" /> Video Dokumentasi Unit (Resolusi HD)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {car.videos.map((vid) => {
                  const vidUrl = vid.videoUrl.startsWith('http') 
                    ? vid.videoUrl 
                    : `${backendUrl}${vid.videoUrl.startsWith('/') ? '' : '/'}${vid.videoUrl}`;
                  return (
                    <div 
                      key={vid.id} 
                      className="group relative h-72 sm:h-96 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-xl"
                    >
                      {/* Video Player dengan object-contain agar murni tidak terpotong */}
                      <video 
                        src={vidUrl} 
                        controls 
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-contain bg-black" 
                      />
                      
                      {/* Tombol Klik Popup Perbesar Video */}
                      <button 
                        onClick={() => setActiveVideoPopup(vidUrl)}
                        className="absolute top-4 right-4 bg-slate-900/80 hover:bg-emerald-600 text-white p-3 rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg flex items-center gap-2 text-xs font-bold cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Perbesar Video"
                      >
                        <Maximize2 size={16} /> Perbesar Layar
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Informasi & Daftar Tarif Tujuan */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <h1 className={`text-3xl font-extrabold mt-2 mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{car.name}</h1>

            {/* Daftar Tarif Tujuan & Tombol Booking per Tujuan */}
            <div className={`border p-6 rounded-3xl mb-6 space-y-4 shadow-sm ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
                <Navigation size={14} /> Pilih Rute / Tujuan & Booking via WA:
              </h4>

              {car.destinationPrices && car.destinationPrices.length > 0 ? (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {car.destinationPrices.map((item) => (
                    <div key={item.id} className={`p-4 rounded-2xl border transition flex flex-col gap-3 ${isDarkMode ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm">{item.destination}</p>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 mt-1 inline-block">
                            {item.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'}
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(item.price)}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleBookingWa(item)}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <MessageCircle size={15} /> Pesan Rute Ini via WhatsApp
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs opacity-50 italic">Hubungi admin untuk informasi tarif tujuan khusus.</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bagian Bawah: Tab Deskripsi & Syarat */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <div className={`border-b flex gap-8 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button 
            onClick={() => setActiveTab('description')}
            className={`pb-4 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
              activeTab === 'description' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Deskripsi & Kondisi
          </button>
          <button 
            onClick={() => setActiveTab('terms')}
            className={`pb-4 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
              activeTab === 'terms' 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            Persyaratan Sewa
          </button>
        </div>

        <div className="py-8 leading-relaxed max-w-4xl">
          {activeTab === 'description' ? (
            <div className={`p-8 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Spesifikasi & Fasilitas Armada</h3>
              <p className="whitespace-pre-line text-sm">{car.condition}</p>
            </div>
          ) : (
            <div className={`p-8 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900/40 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
              <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ketentuan dan Syarat Penyewaan</h3>
              {car.terms && car.terms.length > 0 ? (
                <div className="space-y-3">
                  {car.terms.map((t) => (
                    <div key={t.id} className="flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} />
                      <p className="text-sm">{t.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={18} />
                  <p className="text-sm">Wajib melampirkan identitas resmi (KTP/SIM) yang valid.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* POPUP MODAL VIDEO FULLSCREEN (IG/Shorts Style) */}
      {activeVideoPopup && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="relative w-full max-w-5xl h-[80vh] bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
            
            {/* Tombol Close Popup */}
            <button 
              onClick={() => setActiveVideoPopup(null)}
              className="absolute top-4 right-4 z-50 bg-slate-900/80 hover:bg-rose-600 text-white p-3 rounded-full transition-all duration-300 shadow-lg cursor-pointer"
              title="Tutup"
            >
              <X size={22} />
            </button>

            {/* Video Player Fullscreen Murni */}
            <video 
              src={activeVideoPopup} 
              controls 
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}