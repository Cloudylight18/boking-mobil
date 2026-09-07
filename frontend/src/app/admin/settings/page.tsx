'use client';
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/app/admin/dashboard/components/AdminLayout';
import toast, { Toaster } from 'react-hot-toast';
import { Shield, Lock, User, Save, Camera, Upload } from 'lucide-react';
import { API } from '@/app/utils/api'; // Menggunakan instance API global

export default function AdminSettingsPage() {
  const [adminId, setAdminId] = useState('');
  const [username, setUsername] = useState('superadmin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State untuk foto profil
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('/img/logo_histbah.png');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Mendapatkan Base URL dari environment variable atau default Hostinger untuk penanganan gambar profil
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

  useEffect(() => {
    fetchProfile();
  }, [backendUrl]);

  const fetchProfile = async () => {
    try {
      // Menggunakan instance API global
      const res = await API.get('/api/auth/profile');
      if (res.data.success && res.data.data) {
        const admin = res.data.data;
        setAdminId(admin.id);
        setUsername(admin.username || 'superadmin');
        if (admin.profileImage) {
          const imgUrl = admin.profileImage.startsWith('http') 
            ? admin.profileImage 
            : `${backendUrl}${admin.profileImage}`;
          setImagePreview(imgUrl);
        }
      }
    } catch (error) {
      console.error('Gagal memuat profil admin:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    if (adminId) formData.append('id', adminId);
    if (imageFile) formData.append('image', imageFile);

    try {
      // Menggunakan instance API global untuk memperbarui profil
      const res = await API.put('/api/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || 'Profil berhasil diperbarui!');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    setIsLoading(true);
    try {
      // Menggunakan instance API global untuk mengubah kata sandi
      const res = await API.put('/api/auth/update-password', {
        id: adminId,
        currentPassword,
        newPassword
      });
      toast.success(res.data.message || 'Kata sandi berhasil diubah!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengubah kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8 border-b border-slate-200/60 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">Pengaturan Sistem & Akun</h1>
        <p className="text-sm opacity-70">Kelola foto profil, kredensial login, dan keamanan panel administrasi Hitsbah Transport.</p>
      </div>

      {isFetching ? (
        <div className="text-center py-24 opacity-60 font-medium">Memuat data profil...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form Informasi Profil & Foto */}
          <div className="p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Profil & Foto Admin</h3>
                  <p className="text-xs opacity-60">Perbarui foto avatar dan nama pengguna.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                {/* Upload Foto Profil */}
                <div className="flex flex-col items-center sm:flex-row gap-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-lg group shrink-0">
                    <img src={imagePreview} alt="Admin Avatar" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
                      <Camera size={22} />
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Foto Profil Admin</p>
                    <p className="text-xs opacity-60 mb-3">Format yang didukung: JPG, PNG, atau JPEG. Ukuran maks 2MB.</p>
                    <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer inline-flex items-center gap-2 shadow-md shadow-indigo-600/20">
                      <Upload size={14} /> Pilih Foto Baru
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Username Admin</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold transition shadow-lg shadow-indigo-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={16} /> Simpan Profil
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Form Ganti Password */}
          <div className="p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xl shadow-slate-900/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">Keamanan & Kata Sandi</h3>
                  <p className="text-xs opacity-60">Ganti kata sandi berkala untuk keamanan sistem.</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Kata Sandi Saat Ini</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-2xl border text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider opacity-70 mb-2">Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border text-sm bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl text-sm font-bold transition shadow-lg shadow-rose-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Shield size={16} /> Perbarui Sandi
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}
    </AdminLayout>
  );
}