'use client';
import React, { useEffect } from 'react';

interface GlobalLoaderProps {
  isLoading: boolean;
}

export default function GlobalLoader({ isLoading }: GlobalLoaderProps) {
  // Pengaman tambahan: Jika loader menyangkut lebih dari 10 detik, 
  // paksa sembunyikan agar pengguna tidak terjebak selamanya di layar loading.
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        const loaderElement = document.getElementById('global-loader-wrapper');
        if (loaderElement) {
          loaderElement.style.display = 'none';
        }
      }, 10000); // 10 detik timeout max
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div 
      id="global-loader-wrapper"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md transition-all duration-300"
    >
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Garis Melingkar Berputar */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
        
        {/* Logo Gambar /icon.png di Tengah */}
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-emerald-500/30 shadow-lg">
          <img 
            src="/icon.png" 
            alt="Hitsbah Logo" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <p className="mt-4 text-xs font-bold tracking-widest uppercase text-slate-300 animate-pulse">
        Sedang Memproses...
      </p>
    </div>
  );
}