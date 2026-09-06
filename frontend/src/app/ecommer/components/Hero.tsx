'use client';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroProps {
  isDarkMode: boolean;
  setActiveTab?: (tab: string) => void;
}

export default function Hero({ isDarkMode, setActiveTab }: HeroProps) {
  // Daftar slide banner dengan gambar lokal / URL
const slides = [
    {
      image: '/img/gambar 1.jpeg',
      tag: 'Travele wong lelea',
      title: 'Duduk Manis, Biar Driver Profesional yang Nyetir!',
      description: 'Mau jalan-jalan atau roadtrip tanpa capek hadapin macet? Tinggal pilih layanan **Mobil + Supir** kami, dijamin kamu tinggal rebahan santai sampai tujuan dengan aman.'
    },
    {
      image: '/img/gambar 2.jpeg',
      tag: 'Travele wong lelea',
      title: 'Carter All-In Bersih: Duduk Tenang, Semua Beres!',
      description: 'Nggak usah overthinking mikirin biaya tambahan di jalan. Paket **Carter All-in Bersih** siap bikin agenda hajatan, liburan, atau urusan bisnis jadi super smooth dan anti ribet.'
    },
    {
      image: '/img/gambar 3.jpeg',
      tag: 'Travele wong lelea',
      title: 'Armada Hits & Wangi, Siap Nemenin Vibe Liburanmu!',
      description: 'Semua unit dijamin dalam kondisi prima, bersih, dan wangi. Booking kilat 24 jam penuh, siap jadi partner setia buat mobilitas jarak dekat maupun luar kota.'
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Efek Auto-Slide otomatis bergeser ke kanan setiap 5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={`relative w-full h-[500px] md:h-[600px] overflow-hidden flex items-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'}`}>
      
      {/* Background Slideshow dengan Animasi Transisi */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover scale-105"
          />
          {/* Gradient Overlay Gelap agar Teks Terbaca Sempurna di atas Gambar */}
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent' : 'bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-transparent'}`}></div>
        </div>
      ))}

      {/* Konten Teks Utama */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col items-start justify-center text-white">
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase inline-flex items-center gap-1.5 mb-4 shadow-sm backdrop-blur-md">
          <Sparkles size={14} /> {slides[currentIndex].tag}
        </span>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight drop-shadow-lg max-w-2xl transition-all duration-500">
          {slides[currentIndex].title}
        </h1>

        <p className="text-slate-100 text-sm md:text-base lg:text-lg mb-8 max-w-xl leading-relaxed drop-shadow-md transition-all duration-500">
          {slides[currentIndex].description}
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab && setActiveTab('katalog')}
            className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-semibold text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
          >
            Lihat Katalog Mobil <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Tombol Panah Navigasi Kiri & Kanan */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition border border-white/10 hidden md:block cursor-pointer"
        aria-label="Previous Slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition border border-white/10 hidden md:block cursor-pointer"
        aria-label="Next Slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Indikator Titik (Dots) di Bagian Bawah */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              index === currentIndex ? 'w-8 bg-emerald-500' : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}