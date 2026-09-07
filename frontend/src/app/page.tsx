'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './ecommer/components/navbar';
import Hero from './ecommer/components/Hero';
import About from './ecommer/components/About';
import CarCatalog from './ecommer/components/CarCatalog';
import LocationContact from './ecommer/components/LocationContact';
import Footer from './ecommer/components/Footer';
import WhatsAppFloat from './ecommer/components/WhatsAppFloat';
import HitsbahAIModal from './ecommer/components/HitsbahAIModal';

export default function PublicCatalog() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHitsbahAIOpen, setIsHitsbahAIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';
    axios.post(`${backendUrl}/api/dashboard/visit`).catch(() => {});
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col justify-between overflow-x-hidden ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      <Toaster position="top-right" />

      {/* Navbar Terkunci Rapi di Atas */}
      <div className="w-full sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
        <Navbar 
          siteName="Hitsbah Transport" 
          isDarkMode={isDarkMode} 
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenVito={() => setIsHitsbahAIOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative pt-3 sm:pt-4">
        <AnimatePresence mode="wait">
          
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full"
            >
              <Hero isDarkMode={isDarkMode} setActiveTab={setActiveTab} />
            </motion.div>
          )}

          {activeTab === 'tentang' && (
            <motion.div
              key="tentang"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
            >
              <About isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === 'katalog' && (
            <motion.div
              key="katalog"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
            >
              <CarCatalog searchQuery={searchQuery} isDarkMode={isDarkMode} />
            </motion.div>
          )}

          {activeTab === 'lokasi' && (
            <motion.div
              key="lokasi"
              initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
            >
              <LocationContact 
                address="Hitsbah transport, H66V+47M, Pangauban, Kec. Lelea, Kabupaten Indramayu, Jawa Barat 45261" 
                whatsapp="6289623021975" 
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

          {activeTab === 'kontak' && (
            <motion.div
              key="kontak"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
            >
              <div className="mb-6 text-center max-w-2xl mx-auto px-2">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Kontak Kami</h1>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Hubungi admin kami secara langsung melalui WhatsApp untuk konsultasi cepat dan pemesanan unit.</p>
              </div>
              <LocationContact 
                address="Hitsbah transport, H66V+47M, Pangauban, Kec. Lelea, Kabupaten Indramayu, Jawa Barat 45261" 
                whatsapp="6289623021975" 
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <Footer isDarkMode={isDarkMode} />
      <WhatsAppFloat whatsapp="6289623021975" />
      <HitsbahAIModal 
        isOpen={isHitsbahAIOpen} 
        onClose={() => setIsHitsbahAIOpen(false)} 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
}