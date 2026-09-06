'use client';
import { useState } from 'react';
import { Search, Sun, Moon, Bot, Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  siteName?: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenVito: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ 
  siteName = 'RentCar', 
  isDarkMode, 
  toggleDarkMode, 
  searchQuery, 
  setSearchQuery,
  onOpenVito,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'tentang', label: 'Tentang' },
    { id: 'katalog', label: 'Mobil Rental' },
    { id: 'lokasi', label: 'Lokasi & Kontak' },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false); 
  };

  const formattedSiteName = siteName && siteName.includes('.') ? siteName.split('.')[0] : siteName;

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`sticky top-0 z-50 backdrop-blur-3xl border-b transition-colors duration-700 ${
        isDarkMode 
          ? 'bg-slate-950/80 border-emerald-500/20 text-slate-100 shadow-2xl shadow-emerald-950/40' 
          : 'bg-white/80 border-emerald-500/20 text-slate-800 shadow-2xl shadow-emerald-500/10'
      }`}
    >
      {/* Garis Neon Bergeser di Atas Navbar (Efek Futuristic 2026) */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-80 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
        
        {/* Brand Logo dengan Efek Hologram 3D */}
        <motion.button 
          whileHover={{ scale: 1.05, rotateZ: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleTabClick('home')} 
          className="flex items-center gap-3.5 text-left group cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shadow-xl shadow-emerald-500/20 p-2 group-hover:border-emerald-400 transition-all duration-500">
            {/* Glow Belakang */}
            <div className="absolute inset-0 bg-emerald-400/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img 
              src="/img/logo-hitsbah.png" 
              alt="Logo" 
              className="relative z-10 w-full h-full object-contain transform group-hover:rotate-45 group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={() => {
                console.error("Gagal memuat /img/logo-hitsbah.png");
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-black tracking-wider uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-md group-hover:brightness-125 transition-all duration-300">
              {formattedSiteName}
            </span>
            <span className="text-[9px] font-extrabold tracking-widest text-emerald-500 uppercase opacity-80 flex items-center gap-1">
              <Sparkles size={8} /> Luxury & Trusted Transport
            </span>
          </div>
        </motion.button>

        {/* Navigation Links Desktop (Liquid Morphing Pill dengan Spring Physics Ekstrem) */}
        <nav 
          onMouseLeave={() => setHoveredTab(null)}
          className="hidden lg:flex items-center space-x-2 p-2 rounded-full bg-slate-500/5 border border-emerald-500/20 backdrop-blur-2xl relative shadow-inner"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredTab(item.id)}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-6 py-2.5 rounded-full text-xs font-extrabold tracking-wide cursor-pointer transition-colors duration-300 z-10 ${
                  isActive 
                    ? 'text-white' 
                    : isDarkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                {/* Efek Hover Halus di Belakang Kursor */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverPill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-emerald-500/10 rounded-full z-[-1]"
                  />
                )}

                {/* Pill Utama Aktif dengan Neon Glow Super Terang */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.7)] z-[-1]"
                  >
                    {/* Partikel Kilau di dalam Pill */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                  </motion.div>
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search, AI, Theme Toggle, Mobile Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Search Input Desktop */}
          <div className="relative hidden md:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 group-focus-within:text-emerald-500 transition-all duration-300" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari armada mobil..." 
              className={`pl-10 pr-4 py-2.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-500 w-48 lg:w-60 border shadow-md ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:bg-slate-900' : 'bg-slate-100/90 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
              }`}
            />
          </div>

          {/* Tombol Tanya Hitsbah AI dengan Efek Glow Berputar */}
          <motion.button 
            whileHover={{ scale: 1.08, y: -2, boxShadow: "0 0 30px rgba(16, 185, 129, 0.6)" }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenVito}
            className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-full text-xs font-black shadow-xl shadow-emerald-600/30 cursor-pointer overflow-hidden group"
          >
            {/* Efek Sinar Cahaya Berjalan */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            
            <Bot size={16} className="relative z-10 group-hover:rotate-45 transition-transform duration-500" /> 
            <span className="relative z-10 tracking-wider">Tanya Hitsbah</span>
          </motion.button>

          {/* Dark / Light Mode Toggle */}
          <motion.button 
            whileHover={{ scale: 1.15, rotate: 180 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-colors border cursor-pointer shadow-lg ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 shadow-amber-500/10' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Ubah Mode"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </motion.button>

          {/* Tombol Hamburger Menu (Mobile) */}
          <motion.button 
            whileTap={{ scale: 0.85 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-3 rounded-2xl border transition-colors cursor-pointer shadow-md ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>

        </div>
      </div>

      {/* Dropdown Menu Mobile dengan Efek Scaling & Blur Super Halus */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`lg:hidden border-t px-6 py-6 space-y-4 shadow-2xl overflow-hidden ${
              isDarkMode ? 'bg-slate-950/95 border-emerald-500/20 text-white backdrop-blur-3xl' : 'bg-white/95 border-emerald-500/20 text-slate-900 backdrop-blur-3xl'
            }`}
          >
            {/* Kolom Pencarian Mobile */}
            <div className="relative md:hidden mb-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40 text-emerald-500" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari armada mobil..." 
                className={`w-full pl-10 pr-4 py-3.5 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 border shadow-inner ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Daftar Menu Mobile dengan Efek Slide ke Kanan */}
            {navItems.map((item, index) => {
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left py-4 px-6 rounded-2xl text-sm font-extrabold flex items-center justify-between border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/40 scale-[1.02]' 
                      : isDarkMode ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_white] animate-ping" />}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}