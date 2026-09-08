'use client';

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save, Upload, X, Plus, Video, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminNavbar from '../../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api'; 
import { useLoading } from '@/app/context/LoadingContext'; // Menggunakan global loading logo Hitsbah berputar

export default function AdminCarEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { showLoader, hideLoader } = useLoading();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [name, setName] = useState('');
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState<'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE'>('AVAILABLE');
  
  const [destinationPrices, setDestinationPrices] = useState<Array<{ destination: string; serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN'; price: string }>>([]);
  const [destInput, setDestInput] = useState('');
  const [serviceTypeInput, setServiceTypeInput] = useState<'WITH_DRIVER' | 'CARTER_ALL_IN'>('WITH_DRIVER');
  const [priceInput, setPriceInput] = useState('');

  // State File Lama dari Database
  const [existingImages, setExistingImages] = useState<Array<{ id: string; imageUrl: string }>>([]);
  const [existingVideos, setExistingVideos] = useState<Array<{ id: string; videoUrl: string }>>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [deletedVideoIds, setDeletedVideoIds] = useState<string[]>([]);

  // State Foto Baru (Maksimal total file)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // State Video Baru
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);
  
  const [termInput, setTermInput] = useState('');
  const [terms, setTerms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mendapatkan Base URL backend untuk file lama
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

  useEffect(() => {
    if (!id) return;
    const fetchCar = async () => {
      showLoader();
      try {
        const res = await API.get('/api/cars');
        const car = res.data.data.find((item: any) => item.id === id);
        if (car) {
          setName(car.name);
          setCondition(car.condition);
          setStatus(car.status);
          
          if (car.images) setExistingImages(car.images);
          if (car.videos) setExistingVideos(car.videos);

          if (car.destinationPrices) {
            setDestinationPrices(car.destinationPrices.map((dp: any) => ({
              destination: dp.destination,
              serviceType: dp.serviceType,
              price: dp.price.toString()
            })));
          }
          if (car.terms) {
            setTerms(car.terms.map((t: any) => t.description));
          }
        } else {
          toast.error('Data armada tidak ditemukan.');
        }
      } catch (error) {
        toast.error('Gagal memuat data armada.');
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };
    fetchCar();
  }, [id]);

  // Handler Hapus Foto Lama
  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  // Handler Hapus Video Lama
  const handleRemoveExistingVideo = (videoId: string) => {
    setExistingVideos(existingVideos.filter(vid => vid.id !== videoId));
    setDeletedVideoIds([...deletedVideoIds, videoId]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const totalActiveImages = existingImages.length + selectedFiles.length + filesArray.length;

      if (totalActiveImages > 10) {
        toast.error('Maksimal total foto adalah 10 file.');
        return;
      }

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
      toast.error('Destinasi dan harga harus diisi!');
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
      toast.error('Harap tambahkan minimal satu harga tujuan!');
      return;
    }

    showLoader(); 
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('condition', condition);
      formData.append('status', status);
      formData.append('destinationPrices', JSON.stringify(destinationPrices));
      
      // 🔥 MENGGUNAKAN JSON.STRINGIFY AGAR BACKEND BISA MEMBACA ID HAPUS DENGAN VALID
      formData.append('deletedImages', JSON.stringify(deletedImageIds));
      formData.append('deletedVideos', JSON.stringify(deletedVideoIds));

      terms.forEach((t) => formData.append('terms[]', t));
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      selectedVideos.forEach((video) => {
        formData.append('videos', video);
      });

      await API.put(`/api/cars/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Armada berhasil diperbarui!');
      setTimeout(() => router.push('/admin/cars'), 1000);
    } catch (error) {
      toast.error('Gagal memperbarui armada.');
      hideLoader();
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-bold">Memuat data armada...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link href="/admin/cars" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition">
            <ArrowLeft size={16} /> Kembali ke Daftar Armada
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Edit Armada Mobil</h1>
          <p className="text-sm opacity-70">Perbarui informasi tujuan tarif, foto, video resolusi penuh, dan spesifikasi armada.</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'}`}>
          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70">Nama Mobil / Model</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              <p className="text-xs opacity-50 italic text-center py-2">Belum ada tarif tujuan ditambahkan.</p>
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
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            ></textarea>
          </div>

          {/* --- MANAJEMEN FOTO (LAMA & BARU) --- */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase opacity-70 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-indigo-500" /> Kelola Foto Armada (Maks. 10 File)
              </label>
              <span className="text-xs font-bold text-indigo-500">{existingImages.length + selectedFiles.length}/10 Total File</span>
            </div>

            {/* Foto Lama dari Database */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-[11px] font-bold uppercase text-slate-400 mb-2">Foto Saat Ini (Tersimpan):</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {existingImages.map((img) => {
                    const imgUrl = img.imageUrl.startsWith('http') ? img.imageUrl : `${backendUrl}${img.imageUrl.startsWith('/') ? '' : '/'}${img.imageUrl}`;
                    return (
                      <div key={img.id} className="relative group h-32 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 shadow-md">
                        <img src={imgUrl} alt="Existing" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveExistingImage(img.id)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition cursor-pointer"
                          title="Hapus foto ini"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Foto Baru */}
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-100 dark:bg-slate-950/40 text-sm transition mb-4">
              <Upload size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Klik untuk tambah foto baru</span>
              <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            </label>

            {previews.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase text-indigo-400 mb-2">Foto Baru yang Akan Ditambahkan:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {previews.map((src, index) => (
                    <div key={index} className="relative group h-32 rounded-2xl overflow-hidden border border-indigo-500 dark:border-indigo-500 bg-slate-900 shadow-md">
                      <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow transition cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* --- MANAJEMEN VIDEO (LAMA & BARU) --- */}
          <div>
            <label className="block text-xs font-bold uppercase mb-2 opacity-70 flex items-center gap-1.5">
              <Video size={14} className="text-indigo-500" /> Kelola Video Dokumentasi
            </label>

            {/* Video Lama dari Database */}
            {existingVideos.length > 0 && (
              <div className="mb-4 space-y-3">
                <p className="text-[11px] font-bold uppercase text-slate-400">Video Saat Ini (Tersimpan):</p>
                {existingVideos.map((vid) => {
                  const vidUrl = vid.videoUrl.startsWith('http') ? vid.videoUrl : `${backendUrl}${vid.videoUrl.startsWith('/') ? '' : '/'}${vid.videoUrl}`;
                  return (
                    <div key={vid.id} className="relative group h-64 sm:h-80 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-950 shadow-md">
                      <video src={vidUrl} controls className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveExistingVideo(vid.id)}
                        className="absolute top-3 right-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition z-10 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} /> Hapus Video Ini
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Video Baru */}
            <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-400 dark:border-slate-600 hover:border-indigo-500 cursor-pointer bg-slate-100 dark:bg-slate-950/40 text-sm transition mb-4">
              <Video size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>Klik untuk tambah file video baru</span>
              <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska" onChange={handleVideoChange} className="hidden" />
            </label>

            {videoPreviews.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {videoPreviews.map((src, index) => (
                  <div key={index} className="relative group h-64 sm:h-80 rounded-2xl overflow-hidden border border-indigo-500 dark:border-indigo-500 bg-slate-950 shadow-md">
                    <video src={src} controls className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="absolute top-3 right-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition z-10 flex items-center gap-1 cursor-pointer"
                    >
                      <X size={14} /> Batal Video Baru
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
                className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-indigo-500 transition shadow-md cursor-pointer"
              >
                Tambah Syarat
              </button>
            </div>
            <ul className="space-y-2">
              {terms.map((term, index) => (
                <li key={index} className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/80 px-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
                  <span>{index + 1}. {term}</span>
                  <button type="button" onClick={() => handleRemoveTerm(index)} className="text-rose-500 font-bold cursor-pointer">Hapus</button>
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
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save size={18} /> Perbarui Armada
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}