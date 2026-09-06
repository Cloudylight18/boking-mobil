'use client';

import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save, Upload, X, Plus, Video } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';

export default function AdminCarCreatePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE'>('AVAILABLE');
  
  // State untuk daftar harga berdasarkan tujuan & jenis layanan
  const [destinationPrices, setDestinationPrices] = useState<Array<{ destination: string; serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN'; price: string }>>([]);
  const [destInput, setDestInput] = useState('');
  const [serviceTypeInput, setServiceTypeInput] = useState<'WITH_DRIVER' | 'CARTER_ALL_IN'>('WITH_DRIVER');
  const [priceInput, setPriceInput] = useState('');

  // State Foto
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // State Video
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [termInput, setTermInput] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...filesArray]);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const videosArray = Array.from(e.target.files);
      setSelectedVideos([...selectedVideos, ...videosArray]);
      const newVideoPreviews = videosArray.map(file => URL.createObjectURL(file));
      setVideoPreviews([...videoPreviews, ...newVideoPreviews]);
    }
  };

  const handleRemoveVideo = (index: number) => {
    setSelectedVideos(selectedVideos.filter((_, i) => i !== index));
    setVideoPreviews(videoPreviews.filter((_, i) => i !== index));
  };

  const handleAddDestinationPrice = () => {
    if (!destInput.trim() || !priceInput) {
      toast.error('Destinasi dan nominal harga harus diisi!');
      return;
    }
    setDestinationPrices([...destinationPrices, { destination: destInput.trim(), serviceType: serviceTypeInput, price: priceInput }]);
    setDestInput('');
    setPriceInput('');
  };

  const handleRemoveDestinationPrice = (index: number) => {
    setDestinationPrices(destinationPrices.filter((_, i) => i !== index));
  };

  const handleAddTerm = () => {
    if (!termInput.trim()) return;
    setTerms([...terms, termInput.trim()]);
    setTermInput('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(terms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationPrices.length === 0) {
      toast.error('Harap tambahkan minimal satu tarif tujuan!');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('condition', condition);
      formData.append('status', status);
      formData.append('destinationPrices', JSON.stringify(destinationPrices));
      
      terms.forEach((t) => formData.append('terms[]', t));
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      await axios.post('http://localhost:5000/api/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Armada baru berhasil ditambahkan!');
      setTimeout(() => router.push('/admin/cars'), 1000);
    } catch (error) {
      toast.error('Gagal menyimpan armada baru.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition">
            <ArrowLeft size={16} /> Kembali ke Daftar Armada
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Tambah Armada Mobil Baru</h1>
          <p className="text-sm opacity-70">Atur tarif tujuan, unggah foto dan video galeri, serta persyaratan sewa.</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Nama Mobil / Model</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Toyota Avanza Veloz" 
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            />
          </div>

          {/* Pengaturan Harga Berdasarkan Tujuan & Jenis Layanan */}
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-indigo-500">Tarif Berdasarkan Tujuan & Layanan</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">Tujuan / Rute</label>
                <input 
                  type="text"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  placeholder="Contoh: Jakarta / Bandung"
                  className={`w-full p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
              <div className="sm:col-span-4">
                <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">Jenis Layanan</label>
                <select
                  value={serviceTypeInput}
                  onChange={(e) => setServiceTypeInput(e.target.value as 'WITH_DRIVER' | 'CARTER_ALL_IN')}
                  className={`w-full p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                >
                  <option value="WITH_DRIVER">Mobil + Supir</option>
                  <option value="CARTER_ALL_IN">Mobil + Supir Carter (All-in Bersih)</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold uppercase opacity-70 mb-1">Nominal Harga (Rp)</label>
                <input 
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="3500000"
                  className={`w-full p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
              <div className="sm:col-span-1">
                <button 
                  type="button"
                  onClick={handleAddDestinationPrice}
                  className="w-full h-[42px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition shadow-md"
                  title="Tambah Tarif"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {priceInput && (
              <p className="text-xs text-indigo-500 font-semibold">Format Preview: {formatRupiah(Number(priceInput) || 0)}</p>
            )}

            {destinationPrices.length > 0 ? (
              <div className="space-y-2 pt-2">
                {destinationPrices.map((item, index) => (
                  <div key={index} className="flex justify-between items-center bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">{index + 1}</span>
                      <div>
                        <p className="font-bold">{item.destination} <span className="opacity-50 font-normal">({item.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'})</span></p>
                        <p className="text-indigo-600 dark:text-indigo-400 font-extrabold">{formatRupiah(Number(item.price))}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveDestinationPrice(index)} className="text-rose-500 hover:text-rose-600 font-bold">Hapus</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-50 italic text-center py-2">Belum ada tarif tujuan ditambahkan. Wajib masukkan minimal 1 tarif.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Status Ketersediaan</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE')}
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            >
              <option value="AVAILABLE">Tersedia (AVAILABLE)</option>
              <option value="MAINTENANCE">Maintenance (MAINTENANCE)</option>
              <option value="UNAVAILABLE">Disewa (UNAVAILABLE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Kondisi & Spesifikasi</label>
            <textarea 
              rows={4}
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Deskripsikan kondisi mobil, fasilitas AC, kapasitas kursi, dll..."
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            ></textarea>
          </div>

          {/* Unggah Foto Mobil */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Unggah Foto Mobil</label>
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-100 dark:bg-slate-950/40 text-sm transition mb-4">
              <Upload size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Klik untuk pilih foto</span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {previews.map((src, index) => (
                  <div key={index} className="relative group h-32 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 shadow-md">
                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unggah Video Mobil */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Unggah Video Mobil (Opsional)</label>
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-100 dark:bg-slate-950/40 text-sm transition mb-4">
              <Video size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Klik untuk pilih file video (.mp4, .mov)</span>
              <input type="file" accept="video/*" multiple onChange={handleVideoChange} className="hidden" />
            </label>

            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videoPreviews.map((src, index) => (
                  <div key={index} className="relative group h-40 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-md">
                    <video src={src} controls className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition z-10"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Persyaratan Sewa</label>
            <div className="flex gap-3 mb-3">
              <input 
                type="text"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Contoh: Wajib menyertakan KTP asli"
                className={`flex-1 p-3 rounded-2xl border text-sm focus:outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              <button 
                type="button" 
                onClick={handleAddTerm}
                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-500 transition shadow-md"
              >
                Tambah Syarat
              </button>
            </div>
            <ul className="space-y-2">
              {terms.map((term, index) => (
                <li key={index} className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
                  <span>{index + 1}. {term}</span>
                  <button type="button" onClick={() => handleRemoveTerm(index)} className="text-rose-500 font-bold">Hapus</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-700">
            <Link 
              href="/admin/cars"
              className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Save size={18} /> Simpan Armada
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}