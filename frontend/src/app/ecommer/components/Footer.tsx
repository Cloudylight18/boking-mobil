'use client';
import { Globe, MapPin } from 'lucide-react';

interface FooterProps {
  isDarkMode: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  return (
    <footer className={`border-t mt-20 transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Kolom Kiri: Brand & Deskripsi */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-15 h-15 rounded-2xl overflow-hidden bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-md p-1.5">
                <img 
                  src="/img/logo-hitsbah.png" 
                  alt="Logo Hitsbah Transport" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight">Hitsbah Transport.</span>
            </div>
            <p className="text-sm max-w-md opacity-70 leading-relaxed">
  Hitsbah Transport adalah platform penyewaan kendaraan terpercaya yang siap memenuhi segala kebutuhan mobilitas Anda. Didukung oleh armada berkualitas tinggi yang selalu prima, bersih, dan wangi, serta pilihan layanan fleksibel mulai dari Mobil + Supir profesional hingga Carter All-in Bersih yang transparan dan anti ribet. Kami berkomitmen memberikan pengalaman berkendara yang aman, nyaman, dan memuaskan dengan pelayanan prima selama 24 jam penuh.
</p>
          </div>

          {/* Kolom Kanan: Alamat & Sosial Media */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">Garasi & Sosial Media</h4>
            
            <div className="flex items-center gap-3 text-sm opacity-80">
              <MapPin size={16} className="text-emerald-500 shrink-0" />
              <span>Hitsbah transport, H66V+47M, Pangauban, Kec. Lelea, Kabupaten Indramayu, Jawa Barat 45261</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Instagram SVG */}
              <a 
                href="https://www.instagram.com/hitsbah_transport?utm_source=qr&igsi=MXN0dm8zZ3RzdGx4Ng==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-emerald-400 hover:border-emerald-500/50 transition flex items-center gap-2 text-xs font-medium text-slate-300"
              >
                <svg className="w-4 h-4 text-pink-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg> Instagram
              </a>

              {/* TikTok */}
              <a 
                href="https://tiktok.com/@hitsbah_transport" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-emerald-400 hover:border-emerald-500/50 transition flex items-center gap-2 text-xs font-medium text-slate-300"
              >
                <Globe size={15} className="text-cyan-400" /> TikTok
              </a>

              {/* Facebook SVG */}
              <a 
                href="https://www.facebook.com/share/1C5kvLCAzR/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-emerald-400 hover:border-emerald-500/50 transition flex items-center gap-2 text-xs font-medium text-slate-300"
              >
                <svg className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.5 0 9 1.5 9 4.75V8z"/>
                </svg> Facebook
              </a>
            </div>
          </div>

        </div>

        {/* Bagian Bawah: Copyright & Credit */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs opacity-70 gap-4">
          <p>&copy; 2026 Hitsbah Transport, Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5 font-medium text-slate-300">
            Dibuat dengan ❤️ dan ✌️ oleh <span className="text-emerald-400 font-bold">Rafi Darajat</span> 2026
          </p>
        </div>
      </div>
    </footer>
  );
}