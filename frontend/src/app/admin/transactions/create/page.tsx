'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save, Calculator, Calendar, MapPin, Navigation, Clock, User, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminNavbar from '../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';

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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [selectedDestPriceId, setSelectedDestPriceId] = useState('');
  
  const [travelDate, setTravelDate] = useState('');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [shiftTime, setShiftTime] = useState('');
  
  const [basePrice, setBasePrice] = useState<number>(0);
  const [dpAmount, setDpAmount] = useState('');
  const [remainingPay, setRemainingPay] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/cars')
      .then(res => {
        const responseData = res.data.data || res.data.cars || res.data || [];
        setCars(Array.isArray(responseData) ? responseData : []);
      })
      .catch(() => toast.error('Gagal memuat daftar armada mobil.'));
  }, []);

  const selectedCar = cars.find(c => c.id === selectedCarId);

  // Kalkulasi total harga otomatis (Harga Satuan Rute * Durasi Hari)
  useEffect(() => {
    if (!selectedDestPriceId || !selectedCar) {
      setBasePrice(0);
      setRemainingPay(0);
      return;
    }

    const foundPriceObj = selectedCar.destinationPrices.find(dp => dp.id === selectedDestPriceId);
    if (foundPriceObj) {
      const unitPrice = Number(foundPriceObj.price || 0);
      const totalCalculatedPrice = unitPrice * durationDays;
      
      setBasePrice(totalCalculatedPrice);
      const dp = parseInt(dpAmount) || 0;
      setRemainingPay(Math.max(0, totalCalculatedPrice - dp));
    } else {
      setBasePrice(0);
      setRemainingPay(0);
    }
  }, [selectedDestPriceId, selectedCar, dpAmount, durationDays]);

  const handleDpChange = (val: string) => {
    setDpAmount(val);
    const dp = parseInt(val) || 0;
    setRemainingPay(Math.max(0, basePrice - dp));
  };

  const generateDateDetails = () => {
    if (!travelDate) return '';
    const start = new Date(travelDate);
    const dates: string[] = [];
    for (let i = 0; i < durationDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }));
    }
    return dates.join(', ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCar || !selectedDestPriceId) {
      toast.error('Pilih armada mobil dan rute tujuan terlebih dahulu.');
      return;
    }

    const selectedDestObj = selectedCar.destinationPrices.find(dp => dp.id === selectedDestPriceId);
    if (!selectedDestObj) return;

    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/transactions', {
        customerName,
        address,
        carName: selectedCar.name,
        destination: selectedDestObj.destination,
        travelDate,
        durationDays: Number(durationDays),
        dateDetails: generateDateDetails(),
        shiftTime,
        dpAmount: parseInt(dpAmount) || 0,
        remainingPay: remainingPay,
        serviceType: selectedDestObj.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'
      });

      toast.success('Nota transaksi POS berhasil dibuat!');
      setTimeout(() => router.push('/admin/transactions'), 1000);
    } catch (error) {
      toast.error('Gagal menyimpan transaksi.');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition font-medium">
            <ArrowLeft size={16} /> Kembali ke Daftar Transaksi
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">Buat Nota POS Travel & Rental</h1>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Catat pemesanan perjalanan dengan pemilihan rute fleksibel dan kalkulasi biaya otomatis berdasarkan durasi.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Navigation size={14} className="text-indigo-500" /> Pilih Armada Mobil
              </label>
              <select 
                required
                value={selectedCarId}
                onChange={(e) => {
                  setSelectedCarId(e.target.value);
                  setSelectedDestPriceId('');
                }}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="">-- Pilih Armada Mobil --</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — [{c.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-500" /> Pilih Rute / Tujuan & Layanan
              </label>
              <select 
                required
                disabled={!selectedCarId}
                value={selectedDestPriceId}
                onChange={(e) => setSelectedDestPriceId(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              >
                <option value="">-- Pilih Rute Tujuan --</option>
                {selectedCar?.destinationPrices?.map((dp) => (
                  <option key={dp.id} value={dp.id}>
                    {dp.destination} ({dp.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in'}) — {formatRupiah(dp.price)}/hari
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500 text-white">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Total Tarif (Dikalikan {durationDays} Hari)</p>
                <p className="text-xs font-medium opacity-80">{selectedCar?.name || 'Belum pilih armada'} {selectedDestPriceId ? '— Rute Dipilih' : ''}</p>
              </div>
            </div>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {basePrice > 0 ? formatRupiah(basePrice) : 'Rp 0'}
            </span>
          </div>

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
                type="number" 
                min={1}
                required
                value={durationDays}
                onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
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

          {travelDate && durationDays > 1 && (
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs opacity-80">
              <span className="font-bold text-indigo-500">Rincian Tanggal Sewa:</span> {generateDateDetails()}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75">Jumlah DP (Uang Muka)</label>
              <input 
                type="number" 
                value={dpAmount}
                onChange={(e) => handleDpChange(e.target.value)}
                placeholder="500000" 
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1">Format: {formatRupiah(Number(dpAmount) || 0)}</p>
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

          <div className="pt-6 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
            <Link 
              href="/admin/transactions"
              className="px-6 py-3.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-2xl text-sm font-semibold transition"
            >
              Batal
            </Link>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save size={18} /> Simpan Nota Transaksi
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}