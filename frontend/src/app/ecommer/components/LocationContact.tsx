'use client';
import { MapPin, Phone, MessageCircle, QrCode, ExternalLink, Compass } from 'lucide-react';

interface LocationProps {
  address?: string;
  whatsapp?: string;
  isDarkMode: boolean;
}

export default function LocationContact({ address, whatsapp, isDarkMode }: LocationProps) {
  const defaultAddress = address || 'Hitsbah Transport, H66V+47M, Pangauban, Kec. Lelea, Kabupaten Indramayu, Jawa Barat 45261';
  const defaultWa = whatsapp || '6289623021975';
  const mapsUrl = 'https://maps.app.goo.gl/wMsVeDhE9FxPC6cd6?g_st=awb';
  const waUrl = `https://wa.me/${defaultWa}?text=Halo%20Admin,%20saya%20ingin%20bertanya%20tentang%20layanan%20sewa%20mobil%20Hitsbah%20Transport.`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(waUrl)}`;

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      
      {/* Header Judul Section */}
      <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-extrabold uppercase tracking-widest shadow-sm">
          <Compass size={14} /> Akses & Layanan Pelanggan
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
          Lokasi Garasi & <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Kontak Resmi</span>
        </h2>
        <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Kunjungi garasi utama kami atau terhubung langsung dengan tim layanan pelanggan 24 jam untuk konsultasi rute dan pemesanan armada.
        </p>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* Card 1: Lokasi & Google Maps */}
        <div 
          id="lokasi" 
          className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl group ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/50' 
              : 'bg-white border-slate-200/80 hover:border-emerald-500/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Garasi Utama</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pusat operasional dan titik penjemputan</p>
              </div>
            </div>
            
            <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Garasi utama kami berlokasi strategis, siap melayani penjemputan langsung ke rumah, hotel, stasiun, maupun bandara dengan armada yang selalu bersih dan wangi.
            </p>
            
            <div className={`p-4 rounded-2xl border mb-6 flex items-start gap-3 ${isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
              <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
              <p className="font-semibold text-xs sm:text-sm leading-relaxed">
                {defaultAddress}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Peta Google Maps */}
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/80 relative shadow-inner group/map">
              <iframe
                title="Google Maps Garasi Hitsbah Transport"
                src="https://maps.google.com/maps?q=Hitsbah+transport+Pangauban+Lelea+Indramayu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                className="w-full h-full object-cover filter contrast-105"
              ></iframe>
            </div>

            <a 
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-300 shadow-sm cursor-pointer hover:-translate-y-0.5 ${
                isDarkMode 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <ExternalLink size={16} className="text-emerald-500" /> Buka Google Maps Lengkap
            </a>
          </div>
        </div>

        {/* Card 2: Kontak & Barcode WhatsApp */}
        <div 
          id="kontak" 
          className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-2xl group ${
            isDarkMode 
              ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/50' 
              : 'bg-white border-slate-200/80 hover:border-emerald-500/40'
          }`}
        >
          <div>
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Layanan Pelanggan</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Konsultasi & Booking 24/7</p>
              </div>
            </div>

            <p className={`text-sm leading-relaxed mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Butuh konsultasi rute perjalanan, konfirmasi unit kosong, atau pemesanan kilat? Tim admin kami siap melayani Anda kapan saja dengan cepat dan ramah.
            </p>

            {/* Container Barcode / QR Code */}
            <div className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl border border-dashed mb-6 transition-all duration-300 ${
              isDarkMode ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-500/40 bg-emerald-500/5'
            }`}>
              <div className="bg-white p-3.5 rounded-2xl shadow-xl shrink-0 transform hover:scale-105 transition-transform duration-300">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WhatsApp" 
                  className="w-32 h-32 object-contain"
                />
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-extrabold uppercase tracking-wider border border-emerald-500/20">
                  <QrCode size={14} /> Scan Barcode WhatsApp
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Arahkan kamera smartphone Anda ke QR code di samping untuk langsung terhubung ke WhatsApp admin tanpa perlu repot menyimpan nomor.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageCircle size={20} /> Chat WhatsApp Admin Sekarang
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}