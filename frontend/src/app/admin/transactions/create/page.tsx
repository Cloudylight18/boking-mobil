'use client';

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save, Calculator, Calendar, Clock, MapPin, Navigation, User, Home, Percent, Edit3, DollarSign, Briefcase, Phone, Car as CarIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api';
import { useLoading } from '@/app/context/LoadingContext'; // Menggunakan global loading logo Hitsbah

interface DestinationPrice {
  id: string;
  destination: string;
  serviceType: 'WITH_DRIVER' | 'CARTER_ALL_IN';
  price: number;
}

interface Car {
  id: string;
  name: string;
  status: string;
  destinationPrices: DestinationPrice[];
}

export default function AdminTransactionCreatePage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoading();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // State Nomor HP Customer
  const [address, setAddress] = useState('');
  
  // State untuk Armada Mobil
  const [selectedCarId, setSelectedCarId] = useState('');
  const [isCustomCar, setIsCustomCar] = useState(false);
  const [customCarName, setCustomCarName] = useState('');

  // State untuk Driver / Supir
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  // State untuk Rute/Tujuan
  const [selectedDestPriceId, setSelectedDestPriceId] = useState('');
  const [isCustomDest, setIsCustomDest] = useState(false);
  const [customDestName, setCustomDestName] = useState('');
  const [customPricePerDay, setCustomPricePerDay] = useState<string>('');
  
  // State untuk Tipe Layanan (Dengan Opsi Lainnya / Manual)
  const [customServiceTypeSelect, setCustomServiceTypeSelect] = useState('WITH_DRIVER');
  const [isCustomService, setIsCustomService] = useState(false);
  const [customServiceName, setCustomServiceName] = useState('');
  
  const [travelDate, setTravelDate] = useState('');
  const [durationDays, setDurationDays] = useState<string>('1'); 
  const [shiftTime, setShiftTime] = useState('');
  
  const [basePrice, setBasePrice] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('0'); 
  const [dpAmount, setDpAmount] = useState<string>('');
  const [remainingPay, setRemainingPay] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    showLoader();
    API.get('/api/cars')
      .then(res => {
        const responseData = res.data.data || res.data.cars || res.data || [];
        setCars(Array.isArray(responseData) ? responseData : []);
      })
      .catch(() => toast.error('Gagal memuat daftar armada mobil.'))
      .finally(() => hideLoader());
  }, []);

  const selectedCar = cars.find(c => c.id === selectedCarId);

  // Handle Perubahan Pilihan Armada
  const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'LAINNYA') {
      setIsCustomCar(true);
      setSelectedCarId('');
      setIsCustomDest(true);
      setSelectedDestPriceId('LAINNYA');
    } else {
      setIsCustomCar(false);
      setSelectedCarId(val);
      setSelectedDestPriceId('');
      setIsCustomDest(false);
    }
  };

  // Handle Perubahan Pilihan Rute
  const handleDestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'LAINNYA') {
      setIsCustomDest(true);
      setSelectedDestPriceId('LAINNYA');
    } else {
      setIsCustomDest(false);
      setSelectedDestPriceId(val);
      const foundRoute = selectedCar?.destinationPrices.find(dp => dp.id === val);
      if (foundRoute) {
        setIsCustomService(false);
        setCustomServiceTypeSelect(foundRoute.serviceType);
      }
    }
  };

  // Handle Perubahan Dropdown Tipe Layanan
  const handleServiceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'LAINNYA') {
      setIsCustomService(true);
      setCustomServiceName('');
    } else {
      setIsCustomService(false);
      setCustomServiceTypeSelect(val);
    }
  };

  // Kalkulasi total harga otomatis secara real-time
  useEffect(() => {
    let unitPrice = 0;

    if (isCustomDest) {
      unitPrice = customPricePerDay === '' ? 0 : Number(customPricePerDay);
    } else if (selectedDestPriceId && selectedCar) {
      const foundPriceObj = selectedCar.destinationPrices.find(dp => dp.id === selectedDestPriceId);
      unitPrice = foundPriceObj ? Number(foundPriceObj.price || 0) : 0;
    }

    const daysNum = durationDays === '' ? 1 : Number(durationDays);
    const totalCalculatedPrice = unitPrice * daysNum;
    
    setBasePrice(totalCalculatedPrice);

    const discountVal = discountInput === '' ? 0 : Number(discountInput);
    const finalPriceAfterDiscount = Math.max(0, totalCalculatedPrice - discountVal);
    const dp = dpAmount === '' ? 0 : Number(dpAmount);

    setRemainingPay(Math.max(0, finalPriceAfterDiscount - dp));
  }, [selectedDestPriceId, selectedCar, dpAmount, durationDays, discountInput, isCustomDest, customPricePerDay]);

  const handleDpChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setDpAmount(cleanVal);
    
    let unitPrice = 0;
    if (isCustomDest) {
      unitPrice = customPricePerDay === '' ? 0 : Number(customPricePerDay);
    } else {
      unitPrice = selectedCar?.destinationPrices.find(dp => dp.id === selectedDestPriceId)?.price || 0;
    }

    const daysNum = durationDays === '' ? 1 : Number(durationDays);
    const currentBase = unitPrice * daysNum;
    const discountVal = discountInput === '' ? 0 : Number(discountInput);
    const finalPriceAfterDiscount = Math.max(0, currentBase - discountVal);
    const dp = cleanVal === '' ? 0 : Number(cleanVal);
    setRemainingPay(Math.max(0, finalPriceAfterDiscount - dp));
  };

  const generateDateDetails = () => {
    if (!travelDate) return '';
    const start = new Date(travelDate);
    const daysNum = durationDays === '' ? 1 : Number(durationDays);
    const dates: string[] = [];
    for (let i = 0; i < daysNum; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
    }
    return dates.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Mobil
    let finalCarName = '';
    if (isCustomCar) {
      if (!customCarName.trim()) {
        toast.error('Nama mobil manual (Lainnya) harus diisi.');
        return;
      }
      finalCarName = customCarName;
    } else {
      if (!selectedCar) {
        toast.error('Pilih armada mobil terlebih dahulu.');
        return;
      }
      finalCarName = selectedCar.name;
    }

    // Validasi Rute & Harga
    let finalDestName = '';
    if (isCustomDest) {
      if (!customDestName.trim() || !customPricePerDay) {
        toast.error('Nama rute manual dan harga per hari harus diisi.');
        return;
      }
      finalDestName = customDestName;
    } else {
      const selectedDestObj = selectedCar?.destinationPrices.find(dp => dp.id === selectedDestPriceId);
      if (!selectedDestObj) {
        toast.error('Pilih rute tujuan terlebih dahulu.');
        return;
      }
      finalDestName = selectedDestObj.destination;
    }

    // Validasi Tipe Layanan
    let finalServiceType = '';
    if (isCustomService) {
      if (!customServiceName.trim()) {
        toast.error('Nama tipe layanan manual (Lainnya) harus diisi.');
        return;
      }
      finalServiceType = customServiceName;
    } else {
      if (isCustomDest) {
        finalServiceType = customServiceTypeSelect === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih';
      } else {
        const selectedDestObj = selectedCar?.destinationPrices.find(dp => dp.id === selectedDestPriceId);
        finalServiceType = selectedDestObj?.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih';
      }
    }

    const daysNum = durationDays === '' ? 1 : Number(durationDays);

    setIsLoading(true);
    showLoader();
    try {
      await API.post('/api/transactions', {
        customerName,
        customerPhone, // Menyimpan nomor HP pemesan
        address,
        carName: finalCarName,
        destination: finalDestName,
        driverName,   // Menyimpan nama supir
        driverPhone,  // Menyimpan nomor HP supir
        travelDate,
        durationDays: daysNum,
        dateDetails: generateDateDetails(),
        shiftTime,
        discountAmount: discountInput === '' ? 0 : Number(discountInput),
        dpAmount: dpAmount === '' ? 0 : Number(dpAmount),
        remainingPay: remainingPay,
        serviceType: finalServiceType
      });

      toast.success('Nota transaksi POS berhasil dibuat!');
      setTimeout(() => router.push('/admin/transactions'), 1000);
    } catch (error) {
      toast.error('Gagal menyimpan transaksi.');
      setIsLoading(false);
      hideLoader();
    }
  };

  const discountVal = discountInput === '' ? 0 : Number(discountInput);
  const finalTotalNet = Math.max(0, basePrice - discountVal);
  const daysNumDisplay = durationDays === '' ? 1 : Number(durationDays);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition font-medium">
            <ArrowLeft size={16} /> Kembali ke Daftar Transaksi
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">Buat Nota POS Travel & Rental</h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Catat pemesanan perjalanan lengkap dengan informasi driver, kontak pelanggan, rute, dan kalkulasi otomatis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Identitas Customer & Nomor HP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <User size={14} className="text-indigo-500" /> Nama Pemesan / Customer
              </label>
              <input 
                type="text" 
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Bpk. Eki Setiawan" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Phone size={14} className="text-indigo-500" /> Nomor HP / WhatsApp Pemesan
              </label>
              <input 
                type="text" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 081234567890" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
              <Home size={14} className="text-indigo-500" /> Alamat / Penjemputan
            </label>
            <input 
              type="text" 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Pangeran Indah, Indramayu" 
              className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
            />
          </div>

          {/* Informasi Driver / Supir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <CarIcon size={14} className="text-emerald-500" /> Nama Driver / Supir Bertugas
              </label>
              <input 
                type="text" 
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Contoh: Bpk. Andi (Driver)" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-500" /> Nomor HP / WhatsApp Driver
              </label>
              <input 
                type="text" 
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="Contoh: 089876543210" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          {/* Pemilihan Armada & Rute */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Armada Mobil */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                  <Navigation size={14} className="text-indigo-500" /> Pilih Armada Mobil
                </label>
                <select 
                  required
                  value={isCustomCar ? 'LAINNYA' : selectedCarId}
                  onChange={handleCarChange}
                  className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="">-- Pilih Armada Mobil --</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — [{c.status}]
                    </option>
                  ))}
                  <option value="LAINNYA" className="font-bold text-indigo-600 dark:text-indigo-400">✨ Lainnya (Input Manual)</option>
                </select>
              </div>
              
              {isCustomCar && (
                <div className="animate-fadeIn p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <label className="block text-[11px] font-extrabold uppercase mb-2 opacity-75 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Edit3 size={12} /> Masukkan Nama Mobil Manual
                  </label>
                  <input 
                    type="text" 
                    required={isCustomCar}
                    value={customCarName}
                    onChange={(e) => setCustomCarName(e.target.value)}
                    placeholder="Contoh: Avanza Hitam (Unit Eksternal)" 
                    className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                  />
                </div>
              )}
            </div>

            {/* Rute Tujuan */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                  <MapPin size={14} className="text-indigo-500" /> Pilih Rute / Tujuan
                </label>
                <select 
                  required
                  disabled={!selectedCarId && !isCustomCar}
                  value={isCustomDest ? 'LAINNYA' : selectedDestPriceId}
                  onChange={handleDestChange}
                  className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
                >
                  <option value="">-- Pilih Rute Tujuan --</option>
                  {!isCustomCar && selectedCar?.destinationPrices?.map((dp) => (
                    <option key={dp.id} value={dp.id}>
                      {dp.destination} ({dp.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in'}) — {formatRupiah(dp.price)}/hari
                    </option>
                  ))}
                  <option value="LAINNYA" className="font-bold text-indigo-600 dark:text-indigo-400">✨ Lainnya (Input Manual)</option>
                </select>
              </div>

              {isCustomDest && (
                <div className="animate-fadeIn p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase mb-2 opacity-75 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Edit3 size={12} /> Nama Rute / Tujuan Manual
                    </label>
                    <input 
                      type="text" 
                      required={isCustomDest}
                      value={customDestName}
                      onChange={(e) => setCustomDestName(e.target.value)}
                      placeholder="Contoh: Drop Off Bandara Soekarno Hatta" 
                      className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase mb-1.5 opacity-75 flex items-center gap-1"><DollarSign size={10}/> Tarif per Hari (Rp)</label>
                    <input 
                      type="text" 
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required={isCustomDest}
                      value={customPricePerDay}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setCustomPricePerDay(e.target.value.replace(/\D/g, ''))}
                      placeholder="Contoh: 500000" 
                      className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pemilihan Tipe Layanan */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Briefcase size={14} className="text-indigo-500" /> Tipe Layanan Transaksi
              </label>
              <select 
                value={isCustomService ? 'LAINNYA' : customServiceTypeSelect}
                onChange={handleServiceSelectChange}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="WITH_DRIVER">Mobil + Supir</option>
                <option value="CARTER_ALL_IN">Carter All-in Bersih</option>
                <option value="LAINNYA" className="font-bold text-indigo-600 dark:text-indigo-400">✨ Lainnya (Input Manual Tipe Layanan)</option>
              </select>
            </div>

            {isCustomService && (
              <div className="animate-fadeIn p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                <label className="block text-[11px] font-extrabold uppercase mb-2 opacity-75 text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Edit3 size={12} /> Masukkan Nama Tipe Layanan Manual
                </label>
                <input 
                  type="text" 
                  required={isCustomService}
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  placeholder="Contoh: Paket VIP + Driver + BBM" 
                  className={`w-full p-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
            )}
          </div>

          {/* Kotak Kalkulator Tarif Utama */}
          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Total Tarif (Dikalikan {daysNumDisplay} Hari)</p>
                <p className="text-xs font-medium opacity-80">
                  {isCustomCar ? (customCarName || 'Mobil Manual') : (selectedCar?.name || 'Belum pilih armada')}
                </p>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {basePrice > 0 ? formatRupiah(basePrice) : 'Rp 0'}
            </span>
          </div>

          {/* Jadwal Perjalanan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" /> Tanggal Berangkat
              </label>
              <input 
                type="date" 
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Calendar size={14} className="text-indigo-500" /> Durasi (Hari)
              </label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={durationDays}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDurationDays(e.target.value.replace(/\D/g, ''))}
                placeholder="1"
                className={`w-full p-3.5 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-500" /> Jam / Shift
              </label>
              <input 
                type="text" 
                required
                value={shiftTime}
                onChange={(e) => setShiftTime(e.target.value)}
                placeholder="Contoh: 08:00 Pagi" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          {travelDate && daysNumDisplay > 1 && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs opacity-80">
              <span className="font-bold text-indigo-500">Rincian Tanggal Sewa:</span> {generateDateDetails()}
            </div>
          )}

          {/* Bagian Keuangan: Diskon, DP, dan Sisa Pelunasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <Percent size={14} /> Diskon / Potongan (Rp)
              </label>
              <input 
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={discountInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setDiscountInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className={`w-full p-3.5 rounded-2xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                Net Total: {formatRupiah(finalTotalNet)}
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75">Jumlah DP (Uang Muka)</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                value={dpAmount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleDpChange(e.target.value)}
                placeholder="0" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">Format: {formatRupiah(dpAmount === '' ? 0 : Number(dpAmount))}</p>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75">Sisa Pelunasan (Otomatis)</label>
              <input 
                type="number" 
                readOnly
                value={remainingPay}
                className={`w-full p-3.5 rounded-2xl border text-sm font-extrabold cursor-not-allowed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-rose-400' : 'bg-slate-100 border-slate-300 text-rose-600'}`}
              />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">Format: {formatRupiah(remainingPay)}</p>
            </div>
          </div>

          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Link 
              href="/admin/transactions"
              className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm font-semibold transition text-center"
            >
              Batal
            </Link>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={18} /> {isLoading ? 'Menyimpan...' : 'Simpan Nota Transaksi'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}