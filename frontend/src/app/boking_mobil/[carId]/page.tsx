'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Calendar, User, MapPin, Phone, FileText, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api';
import { useLoading } from '@/app/context/LoadingContext';
import { Moon, Sun } from 'lucide-react';

interface DestinationPrice {
  id: string;
  destination: string;
  serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN';
  price: number;
}

interface CarDetail {
  id: string;
  name: string;
  condition: string;
  status: string;
  destinationPrices: DestinationPrice[];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const carId = params?.carId as string;
  const { showLoader, hideLoader } = useLoading();

  const [car, setCar] = useState<CarDetail | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<DestinationPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    durationDays: 1,
    travelDate: '',
    notes: ''
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.hitsbahtransport.com';

  useEffect(() => {
    if (!carId) return;
    const fetchCarAndRoute = async () => {
      showLoader();
      try {
        const response = await API.get('/api/cars');
        const foundCar = response.data.data.find((item: CarDetail) => String(item.id) === String(carId));
        if (foundCar) {
          setCar(foundCar);
          // Ambil query param destinationId dari URL manual client-side search query
          const searchParams = new URLSearchParams(window.location.search);
          const destId = searchParams.get('destinationId');
          
          if (foundCar.destinationPrices && foundCar.destinationPrices.length > 0) {
            const matchedRoute = foundCar.destinationPrices.find((r: DestinationPrice) => r.id === destId) || foundCar.destinationPrices[0];
            handleSelectRoute(matchedRoute);
          }
        }
      } catch (error) {
        toast.error('Gagal memuat data mobil untuk pendaftaran');
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };
    fetchCarAndRoute();
  }, [carId]);

  // Logika Smart Default durasi (misal Jogja/Jawa Tengah auto 2 hari)
  const handleSelectRoute = (item: DestinationPrice) => {
    setSelectedRoute(item);
    const destLower = item.destination.toLowerCase();
    const isMultiDay = destLower.includes('jogja') || 
      destLower.includes('yogyakarta') || 
      destLower.includes('jawa tengah') || 
      destLower.includes('bali') || 
      destLower.includes('surabaya');
    
    setFormData(prev => ({
      ...prev,
      durationDays: isMultiDay ? 2 : 1
    }));
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !selectedRoute) {
      toast.error('Pilih rute tujuan terlebih dahulu.');
      return;
    }
    if (!formData.customerName.trim() || !formData.customerPhone.trim() || !formData.address.trim()) {
      toast.error('Mohon isi Nama, No. Telepon/WA, dan Alamat penjemputan.');
      return;
    }

    const phone = '6289623021975'; // Nomor WA Owner/Admin
    const serviceLabel = selectedRoute.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih';
    const calculatedTotal = selectedRoute.price * formData.durationDays;

    const message = `Halo Admin Hitsbah Transport, saya ingin mendaftarkan pemesanan/booking:\n\n` +
      `🚗 *Armada*: ${car.name}\n` +
      `📍 *Tujuan*: ${selectedRoute.destination}\n` +
      `🛠️ *Jenis Layanan*: ${serviceLabel}\n` +
      `📅 *Tanggal Mulai*: ${formData.travelDate || 'Menyesuaikan'}\n` +
      `⏱️ *Durasi Sewa*: ${formData.durationDays} Hari\n` +
      `💰 *Estimasi Total Harga*: ${formatRupiah(calculatedTotal)} (${formatRupiah(selectedRoute.price)} x ${formData.durationDays} hari)\n\n` +
      `👤 *Data Pemesan*:\n` +
      `- Nama: ${formData.customerName}\n` +
      `- No. Telepon/WA: ${formData.customerPhone}\n` +
      `- Alamat Jemput: ${formData.address}\n\n` +
      `📝 *Catatan / Pesan*: ${formData.notes || '-'}`;

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    toast.success('Mengarahkan ke WhatsApp Admin dengan formulir pendaftaran!');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-400' : 'bg-white text-slate-600'}`}>
        Menyiapkan formulir pendaftaran...
      </div>
    );
  }

  if (!car) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <p>Data mobil tidak ditemukan.</p>
        <Link href="/?tab=katalog#katalog" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">Kembali ke Katalog</Link>
      </div>
    );
  }

  const currentTotalPrice = selectedRoute ? selectedRoute.price * formData.durationDays : 0;

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />

      {/* Top Header */}
      <div className="max-w-4xl mx-auto px-6 py-6 flex justify-between items-center">
        <Link 
          href={`/mobil/${car.id}`} 
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <ArrowLeft size={16} /> Kembali ke Detail Mobil
        </Link>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2.5 rounded-full border transition-all cursor-pointer ${isDarkMode ? 'bg-slate-900 border-slate-700 text-amber-400' : 'bg-white border-slate-200 text-slate-700 shadow-sm'}`}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Main Container Form Pendaftaran */}
      <main className="max-w-4xl mx-auto px-6 pt-2">
        <div className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="mb-8">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-extrabold uppercase tracking-wider border border-indigo-500/20">
              Formulir Pendaftaran & Booking
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">Booking Unit: {car.name}</h1>
            <p className="text-xs sm:text-sm opacity-70 mt-1">
              Pilih rute tujuan, sesuaikan durasi hari (misal rute Jogja/Jawa Tengah auto multi-hari), lalu kirim ke WhatsApp Owner.
            </p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-6">
            {/* Pilihan Rute / Destinasi */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3">Pilih Rute / Tujuan & Jenis Layanan:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {car.destinationPrices && car.destinationPrices.map((item) => {
                  const isSelected = selectedRoute?.id === item.id;
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleSelectRoute(item)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/40' 
                          : isDarkMode ? 'bg-slate-950 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-bold text-sm">{item.destination}</p>
                          {isSelected && <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />}
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 mt-1.5 inline-block">
                          {item.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'}
                        </span>
                      </div>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                        {formatRupiah(item.price)} <span className="text-[10px] font-normal opacity-70">/hari</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Pricing Summary Box */}
            {selectedRoute && (
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-indigo-50/60 border-indigo-100'}`}>
                <div className="space-y-0.5">
                  <p className="text-xs opacity-60 font-semibold uppercase">Rincian Perhitungan:</p>
                  <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">{selectedRoute.destination}</p>
                  <p className="text-xs opacity-75">Tarif Dasar: {formatRupiah(selectedRoute.price)} x {formData.durationDays} Hari</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
                  <p className="text-xs opacity-60">Estimasi Total Harga:</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatRupiah(currentTotalPrice)}</p>
                </div>
              </div>
            )}

            {/* Input Data Diri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <User size={14} className="text-indigo-500" /> Nama Lengkap Pemesan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone size={14} className="text-indigo-500" /> Nomor Telepon / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-500" /> Alamat Penjemputan / Lokasi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Contoh: Jl. Sudirman No. 123, Indramayu / Jakarta"
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar size={14} className="text-indigo-500" /> Durasi (Hari) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  required
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: Math.max(1, parseInt(e.target.value) || 1) })}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" /> Tanggal Mulai Keberangkatan (Opsional)
              </label>
              <input
                type="date"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                className={`w-full sm:w-64 px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-500" /> Pesan / Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Contoh: Jemput jam 05.00 pagi, butuh kursi bayi, atau informasi rute khusus..."
                className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer hover:-translate-y-0.5"
            >
              <MessageCircle size={20} /> Kirim Pendaftaran & Pesanan ke WhatsApp Owner
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}