'use client';
import { useState } from 'react';
import { Search, Sun, Moon, Bot, Menu, X } from 'lucide-react';
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
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
        isDarkMode 
          ? 'bg-slate-950/90 border-emerald-500/20 text-slate-100 shadow-md' 
          : 'bg-white/90 border-emerald-500/20 text-slate-800 shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex justify-between items-center gap-2">
        
        {/* Brand Logo & Nama Dikecilkan Sesuai Permintaan */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleTabClick('home')} 
          className="flex items-center gap-2 text-left group cursor-pointer shrink-0"
        >
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center shadow-sm p-1">
            <img 
              src="/img/logo-hitsbah.png" 
              alt="Logo" 
              className="relative z-10 w-full h-full object-contain"
              onError={() => console.error("Gagal memuat logo")}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black tracking-tight uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {formattedSiteName}
            </span>
          </div>
        </motion.button>

        {/* Navigation Links Desktop */}
        <nav 
          onMouseLeave={() => setHoveredTab(null)}
          className="hidden lg:flex items-center space-x-1 p-1 rounded-full bg-slate-500/5 border border-emerald-500/20 backdrop-blur-xl relative"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = hoveredTab === item.id;

            return (
              <button
                key={item.id}
                onMouseEnter={() => setHoveredTab(item.id)}
                onClick={() => handleTabClick(item.id)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold tracking-wide cursor-pointer transition-colors duration-300 z-10 ${
                  isActive 
                    ? 'text-white' 
                    : isDarkMode ? 'text-slate-300 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverPill"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-emerald-500/10 rounded-full z-[-1]"
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full shadow-md z-[-1]"
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search, AI, Theme, Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* Search Input Desktop */}
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:opacity-100 group-focus-within:text-emerald-500 transition-all" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari armada..." 
              className={`pl-9 pr-3 py-1.5 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-36 lg:w-48 border shadow-sm ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Tombol Tanya AI */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenVito}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-[11px] font-bold shadow-sm cursor-pointer"
          >
            <Bot size={13} /> 
            <span>Tanya AI</span>
          </motion.button>

          {/* Dark / Light Mode Toggle */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors border cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-300 text-slate-700'
            }`}
            aria-label="Ubah Mode"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </motion.button>

          {/* Tombol Hamburger Menu (Mobile) */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </motion.button>

        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`lg:hidden border-t px-4 py-4 space-y-2.5 shadow-xl overflow-hidden ${
              isDarkMode ? 'bg-slate-950 border-emerald-500/20 text-white' : 'bg-white border-emerald-500/20 text-slate-900'
            }`}
          >
            {/* Search Input Mobile */}
            <div className="relative md:hidden mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 text-emerald-500" size={14} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari armada mobil..." 
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left py-2.5 px-3.5 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                      : isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}