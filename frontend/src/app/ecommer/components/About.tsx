'use client';
import { ShieldCheck, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface AboutProps {
  isDarkMode: boolean;
}

export default function About({ isDarkMode }: AboutProps) {
  const features = [
    {
      icon: <Sparkles size={24} className="text-emerald-500" />,
      title: 'Armada Prima, Bersih & Wangi',
      description: 'Setiap unit mobil selalu dalam kondisi steril, rutin diservis, dan wangi demi kenyamanan maksimal perjalanan Anda, baik di dalam maupun luar kota.'
    },
    {
      icon: <UserCheck size={24} className="text-emerald-500" />,
      title: 'Mobil + Supir & Carter All-In',
      description: 'Bebas pilih! Nikmati perjalanan santai bersama supir profesional atau ambil paket Carter All-in Bersih tanpa perlu pusing mikirin biaya tambahan di jalan.'
    },
    {
      icon: <ShieldCheck size={24} className="text-emerald-500" />,
      title: 'Transparan & Terpercaya 24/7',
      description: 'Sistem ketersediaan real-time, harga jujur tanpa biaya tersembunyi, serta layanan siap sedia 24 jam penuh untuk menemani setiap agenda penting Anda.'
    }
  ];

  return (
    <section className={`relative py-20 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-extrabold uppercase tracking-widest shadow-sm">
            <CheckCircle2 size={14} /> Standar Pelayanan Tertinggi
          </div>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Kenapa Ribuan Pelanggan Mempercayai <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Hitsbah Transport</span>?
          </h2>
          <p className={`text-base sm:text-lg leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Kami hadir untuk memberikan solusi mobilitas terbaik yang aman, nyaman, dan bebas ribet untuk setiap perjalanan Anda dan keluarga.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <div 
              key={index}
              className={`group relative p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isDarkMode 
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-100 hover:border-emerald-500/50 hover:bg-slate-900/90' 
                  : 'bg-slate-50/80 border-slate-200/80 text-slate-800 hover:border-emerald-500/40 hover:bg-white'
              }`}
            >
              {/* Top Icon with Glowing Ring */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-md'
                }`}>
                  {item.icon}
                </div>
              </div>

              {/* Card Title */}
              <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-emerald-500 transition-colors duration-300">
                {item.title}
              </h3>

              {/* Card Description */}
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {item.description}
              </p>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}