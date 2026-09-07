'use client';

import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Save, Calculator, Calendar, Clock, MapPin, Navigation, User, Home, Percent } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AdminNavbar from '../../../dashboard/components/AdminNavbar';
import { formatRupiah } from '@/app/utils/formatRupiah';
import { API } from '@/app/utils/api';

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

export default function AdminTransactionEditPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [selectedDestPriceId, setSelectedDestPriceId] = useState('');
  
  const [travelDate, setTravelDate] = useState('');
  const [durationDays, setDurationDays] = useState<string>('1'); 
  const [shiftTime, setShiftTime] = useState('');
  
  const [basePrice, setBasePrice] = useState<number>(0);
  const [discountInput, setDiscountInput] = useState<string>('0'); 
  const [dpAmount, setDpAmount] = useState<string>('');
  const [remainingPay, setRemainingPay] = useState<number>(0);
  const [serviceType, setServiceType] = useState('Carter + Supir');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [carsRes, txRes] = await Promise.all([
          API.get('/api/cars'),
          API.get('/api/transactions')
        ]);
        const carList = carsRes.data.data || [];
        setCars(carList);
        
        const found = (txRes.data.data || []).find((item: any) => item.id === id);
        if (found) {
          setCustomerName(found.customerName);
          setAddress(found.address);
          setTravelDate(found.travelDate || '');
          setDurationDays(String(found.durationDays || 1));
          setShiftTime(found.shiftTime);
          setDpAmount(found.dpAmount != null ? String(found.dpAmount) : '');
          setDiscountInput(String(found.discountAmount || 0)); 
          setServiceType(found.serviceType);

          const matchedCar = carList.find((c: Car) => c.name.toLowerCase() === found.carName.toLowerCase());
          if (matchedCar) {
            setSelectedCarId(matchedCar.id);
            const matchedRoute = matchedCar.destinationPrices?.find((dp: DestinationPrice) => dp.destination.toLowerCase() === found.destination.toLowerCase());
            if (matchedRoute) {
              setSelectedDestPriceId(matchedRoute.id);
            }
          }
        } else {
          toast.error('Nota transaksi tidak ditemukan.');
        }
      } catch (error) {
        toast.error('Gagal memuat data transaksi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const selectedCar = cars.find(c => c.id === selectedCarId);

  // Kalkulasi total harga otomatis saat rute, durasi, diskon, atau DP diubah
  useEffect(() => {
    if (!selectedDestPriceId || !selectedCar) {
      setBasePrice(0);
      setRemainingPay(0);
      return;
    }

    const foundPriceObj = selectedCar.destinationPrices.find(dp => dp.id === selectedDestPriceId);
    if (foundPriceObj) {
      const unitPrice = Number(foundPriceObj.price || 0);
      const daysNum = durationDays === '' ? 1 : Number(durationDays);
      const totalCalculatedPrice = unitPrice * daysNum;
      
      setBasePrice(totalCalculatedPrice);

      const discountVal = discountInput === '' ? 0 : Number(discountInput);
      const finalPriceAfterDiscount = Math.max(0, totalCalculatedPrice - discountVal);
      const dp = dpAmount === '' ? 0 : Number(dpAmount);

      setRemainingPay(Math.max(0, finalPriceAfterDiscount - dp));
    } else {
      setBasePrice(0);
      setRemainingPay(0);
    }
  }, [selectedDestPriceId, selectedCar, dpAmount, durationDays, discountInput]);

  const handleDpChange = (val: string) => {
    const cleanVal = val.replace(/\D/g, '');
    setDpAmount(cleanVal);
    const daysNum = durationDays === '' ? 1 : Number(durationDays);
    const unitPrice = selectedCar?.destinationPrices.find(dp => dp.id === selectedDestPriceId)?.price || 0;
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
    if (!selectedCar || !selectedDestPriceId) {
      toast.error('Pilih armada mobil dan rute tujuan terlebih dahulu.');
      return;
    }

    const selectedDestObj = selectedCar.destinationPrices.find(dp => dp.id === selectedDestPriceId);
    if (!selectedDestObj) return;

    const daysNum = durationDays === '' ? 1 : Number(durationDays);

    setIsSaving(true);
    try {
      await API.put(`/api/transactions/${id}`, {
        customerName,
        address,
        carName: selectedCar.name,
        destination: selectedDestObj.destination,
        travelDate,
        durationDays: daysNum,
        dateDetails: generateDateDetails(),
        shiftTime,
        discountAmount: discountInput === '' ? 0 : Number(discountInput),
        dpAmount: dpAmount === '' ? 0 : Number(dpAmount),
        remainingPay: remainingPay,
        serviceType: selectedDestObj.serviceType === 'WITH_DRIVER' ? 'Mobil + Supir' : 'Carter All-in Bersih'
      });

      toast.success('Nota transaksi berhasil diperbarui!');
      setTimeout(() => router.push('/admin/transactions'), 1000);
    } catch (error) {
      toast.error('Gagal memperbarui transaksi.');
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Memuat data nota...</div>;
  }

  const discountVal = discountInput === '' ? 0 : Number(discountInput);
  const finalTotalNet = Math.max(0, basePrice - discountVal);
  const daysNumDisplay = durationDays === '' ? 1 : Number(durationDays);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Toaster position="top-right" />
      <AdminNavbar isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition font-medium">
            <ArrowLeft size={16} /> Kembali ke Daftar Transaksi
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">Edit Nota POS Travel</h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">Perbarui rincian nota transaksi perjalanan pelanggan.</p>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-3xl border shadow-xl space-y-6 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
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
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Home size={14} className="text-indigo-500" /> Alamat
              </label>
              <input 
                type="text" 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full p-3.5 rounded-2xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <Navigation size={14} className="text-indigo-500" /> Armada Mobil
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
                <option value="">-- Pilih Mobil --</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-500" /> Rute / Tujuan
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

          <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500 text-white shrink-0">
                <Calculator size={20} />
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Total Tarif Normal ({daysNumDisplay} Hari)</p>
                <p className="text-xs font-medium opacity-80">{selectedCar?.name || 'Belum pilih armada'}</p>
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
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
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75">Jumlah DP</label>
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
              <label className="block text-xs font-extrabold uppercase mb-2 opacity-75">Sisa Pelunasan</label>
              <input 
                type="number" 
                readOnly
                value={remainingPay}
                className={`w-full p-3.5 rounded-2xl border text-sm font-extrabold cursor-not-allowed ${isDarkMode ? 'bg-slate-950 border-slate-800 text-rose-400' : 'bg-slate-100 border-slate-300 text-rose-600'}`}
              />
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">Format: {formatRupiah(remainingPay || 0)}</p>
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
              disabled={isSaving}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl text-sm font-semibold transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={18} /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan Nota'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}