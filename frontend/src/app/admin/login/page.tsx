'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function AnimatedLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulasi animasi sukses login
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1200);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#070b09] overflow-hidden px-4">
      
      {/* Background Tech Glow & Floating Code Symbols */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] translate-x-32 -translate-y-32" />
        
        {/* Floating background tech texts */}
        <motion.div 
          animate={{ y: [-20, 20, -20], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/4 text-emerald-500/20 font-mono text-sm"
        >
          &lt;/&gt; Next.js App
        </motion.div>
        <motion.div 
          animate={{ y: [15, -15, 15], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-24 right-1/4 text-cyan-500/20 font-mono text-sm"
        >
          const AUTH = true;
        </motion.div>
      </div>

      {/* Main Login Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        {/* Floating Logo Element on Top */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-28 h-28 rounded-full bg-gradient-to-b from-emerald-400/20 to-transparent p-1 backdrop-blur-md border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full bg-slate-900/90 flex items-center justify-center overflow-hidden p-2">
              <img 
                src="/img/logo-hitsbah.png" 
                alt="Logo Hitsbah" 
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
            </div>
          </motion.div>
        </div>

        {/* Glassmorphism Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-8 pt-16 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* Top Neon Border Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

          {/* Header Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white tracking-wide">AKSES AMAN</h1>
            <p className="text-xs text-emerald-400/70 tracking-widest uppercase mt-1">Sistem Booking Mobil</p>
          </div>

          {/* Success State Overlay Animation */}
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
              <h2 className="text-xl font-bold text-white">Akses Diberikan</h2>
              <p className="text-sm text-slate-400">Mengarahkan ke dashboard...</p>
            </motion.div>
          ) : (
            /* Form Input */
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Nama Pengguna</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan nama pengguna"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 ml-1">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 px-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <span>Masuk</span>
                )}
              </motion.button>
            </form>
          )}

          {/* Footer Subtext / Creator Info */}
          <div className="mt-8 text-center space-y-1">
            <div className="text-xs text-slate-500 tracking-wider">
              AMAN • HITSBAH • SISTEM
            </div>
            <div className="text-xs font-semibold text-emerald-400/80 tracking-wide">
              Dibuat oleh Rafi Darajat • 2026
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}