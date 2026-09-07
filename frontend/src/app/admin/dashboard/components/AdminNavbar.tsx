'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Settings, LogOut, ChevronDown } from 'lucide-react';
import { API } from '@/app/utils/api'; // Menggunakan instance API global

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function AdminNavbar({ isDarkMode, toggleDarkMode }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [adminName, setAdminName] = useState('Super Admin');
  const [adminImage, setAdminImage] = useState<string | null>(null);

  // Mendapatkan Base URL dari instance API atau environment variable untuk penanganan gambar profil
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

  const isActive = (path: string) => pathname === path;

  // Ambil data profil admin secara real-time untuk navbar menggunakan instance API
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await API.get('/api/auth/profile');
        if (res.data.status === 'success' && res.data.data) {
          const data = res.data.data;
          if (data.username) setAdminName(data.username);
          if (data.image) {
            const imgUrl = data.image.startsWith('http') 
              ? data.image 
              : `${backendUrl}${data.image}`;
            setAdminImage(imgUrl);
          }
        }
      } catch (error) {
        console.error('Gagal memuat profil navbar:', error);
      }
    };
    fetchAdminProfile();
  }, [backendUrl]);

  // Tutup dropdown jika mengklik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi admin?')) {
      localStorage.removeItem('token'); 
      router.push('/admin/login'); 
    }
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md p-1">
              <img 
                src="/img/logo-hitsbah.png" 
                alt="Logo Admin" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold tracking-tight text-lg hidden sm:inline">Histbah Transport Admin</span>
          </div>

          {/* Menu Navigasi */}
          <div className="hidden md:flex items-center gap-2">
            <Link 
              href="/admin/dashboard" 
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${isActive('/admin/dashboard') ? 'bg-indigo-700 text-white shadow-inner' : 'text-indigo-100 hover:bg-indigo-500/50'}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/cars" 
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${isActive('/admin/cars') ? 'bg-indigo-700 text-white shadow-inner' : 'text-indigo-100 hover:bg-indigo-500/50'}`}
            >
              Armada Mobil
            </Link>
            <Link 
              href="/admin/transactions" 
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${isActive('/admin/transactions') ? 'bg-indigo-700 text-white shadow-inner' : 'text-indigo-100 hover:bg-indigo-500/50'}`}
            >
              Transaksi POS
            </Link>
            <Link 
              href="/admin/knowledge" 
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${isActive('/admin/knowledge') ? 'bg-indigo-700 text-white shadow-inner' : 'text-indigo-100 hover:bg-indigo-500/50'}`}
            >
              Knowledge
            </Link>
          </div>
        </div>

        {/* Right: Theme Toggle & Profile Dropdown */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 bg-indigo-700/60 hover:bg-indigo-700 text-indigo-100 rounded-xl transition flex items-center justify-center border border-indigo-500/40 cursor-pointer"
            title="Ubah Mode Terang / Gelap"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-300" /> : <Moon size={18} />}
          </button>

          {/* Profile Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-indigo-700/50 hover:bg-indigo-700 pl-2 pr-3 py-1.5 rounded-full border border-indigo-500/40 cursor-pointer transition"
            >
              {/* Dynamic Avatar Image or Initials Fallback */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-400 text-slate-950 font-bold flex items-center justify-center text-xs border border-white/30 shadow-sm shrink-0">
                {adminImage ? (
                  <img src={adminImage} alt="Admin Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{adminName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-semibold hidden sm:inline">{adminName}</span>
              <ChevronDown size={14} className="opacity-70" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold">{adminName}</p>
                  <p className="text-[10px] opacity-60">Administrator</p>
                </div>
                <Link 
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Settings size={15} className="text-indigo-500" /> Pengaturan Akun
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition text-left cursor-pointer"
                >
                  <LogOut size={15} /> Keluar (Logout)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </nav>
  );
}