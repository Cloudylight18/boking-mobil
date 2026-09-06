'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, Download, Share2 } from 'lucide-react';
import { formatRupiah } from '@/app/utils/formatRupiah';
import toast, { Toaster } from 'react-hot-toast';
import * as htmlToImage from 'html-to-image';

interface TransactionItem {
  id: string;
  customerName: string;
  address: string;
  carName: string;
  destination: string;
  travelDate: string;
  durationDays: number;
  dateDetails?: string;
  shiftTime: string;
  dpAmount: number;
  remainingPay: number;
  serviceType: string;
  createdAt: string;
}

export default function AdminTransactionDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [tx, setTx] = useState<TransactionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;
    axios.get('http://localhost:5000/api/transactions')
      .then(res => {
        const found = (res.data.data || []).find((item: TransactionItem) => item.id === id);
        if (found) {
          setTx(found);
        } else {
          toast.error('Nota transaksi tidak ditemukan.');
        }
      })
      .catch(() => toast.error('Gagal memuat detail transaksi.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Download gambar dengan lebar tetap (fixed width) agar tidak terpotong
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await htmlToImage.toPng(receiptRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        style: {
          width: '768px', // Memaksa lebar cetak gambar agar selalu pas dan profesional
          margin: '0 auto',
        }
      });
      const link = document.createElement('a');
      link.download = `Nota-POS-${tx?.customerName || 'Transaksi'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Nota berhasil diunduh sebagai gambar!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengunduh gambar nota.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Share gambar ke WhatsApp / Web Share API
  const handleShareImage = async () => {
    if (!receiptRef.current) return;
    setIsGenerating(true);
    try {
      const blob = await htmlToImage.toBlob(receiptRef.current, {
        pixelRatio: 2,
        style: {
          width: '768px',
          margin: '0 auto',
        }
      });

      if (!blob) {
        toast.error('Gagal memproses gambar.');
        setIsGenerating(false);
        return;
      }

      const file = new File([blob], `Nota-${tx?.customerName || 'Transaksi'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Nota Transaksi Hitsbah Transport',
            text: `Berikut adalah rincian nota transaksi perjalanan untuk ${tx?.customerName}.`,
          });
          setIsGenerating(false);
          return;
        } catch (shareErr) {
          console.log(shareErr);
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nota-${tx?.customerName || 'Transaksi'}.png`;
      link.click();

      const waText = `Halo *${tx?.customerName}*, berikut adalah rincian nota transaksi perjalanan Anda di Hitsbah Transport. Terima kasih!`;
      window.open(`https://wa.me/?text=${encodeURIComponent(waText)}`, '_blank');
      toast.success('Gambar diunduh dan diarahkan ke WhatsApp.');
    } catch (error) {
      console.error(error);
      toast.error('Gagal membagikan gambar.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Memuat nota...</div>;
  }

  if (!tx) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-white">
        <p>Nota transaksi tidak ditemukan.</p>
        <Link href="/admin/transactions" className="text-indigo-400 underline">Kembali ke Daftar</Link>
      </div>
    );
  }

  const totalPrice = tx.dpAmount + tx.remainingPay;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-10 px-4 font-sans print:bg-white print:p-0">
      <Toaster position="top-right" />
      
      {/* Tombol Navigasi & Aksi */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium">
          <ArrowLeft size={16} /> Kembali ke Daftar Transaksi
        </Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Download size={15} /> {isGenerating ? 'Memproses...' : 'Download Gambar'}
          </button>
          <button 
            onClick={handleShareImage}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer disabled:opacity-50"
          >
            <Share2 size={15} /> {isGenerating ? 'Memproses...' : 'Bagikan / WA'}
          </button>
          <button 
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Printer size={15} /> Cetak
          </button>
        </div>
      </div>

      {/* Lembar Nota POS */}
      <div 
        ref={receiptRef}
        className="max-w-3xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-3xl shadow-2xl border border-slate-200 print:shadow-none print:border-none print:p-6 print:w-full"
      >
        
        <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-indigo-600">HITSBAH TRANSPORT</h2>
            <p className="text-xs text-slate-500 mt-1">Layanan Rental Mobil, Carter & Travel Profesional</p>
            <p className="text-xs text-slate-500">WhatsApp: 0896-2302-1975</p>
          </div>
          <div className="text-right">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-200">
              {tx.serviceType}
            </span>
            <p className="text-xs text-slate-500 mt-2 font-mono">ID Nota: #{tx.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-slate-500">Tanggal Buat: {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 text-sm">
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Informasi Pemesan</p>
            <p className="font-bold text-base text-slate-900">{tx.customerName}</p>
            <p className="text-xs text-slate-600">Alamat: {tx.address}</p>
          </div>
          <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Detail Armada & Tujuan</p>
            <p className="font-bold text-base text-slate-900">{tx.carName}</p>
            <p className="text-xs text-slate-600">Tujuan: <span className="font-semibold text-slate-900">{tx.destination}</span></p>
          </div>
        </div>

        <div className="mb-8 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Jadwal & Waktu Perjalanan</h4>
          <div className="border rounded-2xl overflow-hidden border-slate-200 text-sm">
            <div className="grid grid-cols-3 bg-slate-50 p-3 font-extrabold text-xs uppercase text-slate-600 border-b border-slate-200">
              <span>Tanggal Berangkat</span>
              <span>Durasi Sewa</span>
              <span>Jam / Shift</span>
            </div>
            <div className="grid grid-cols-3 p-3 items-center text-slate-900">
              <span className="font-semibold">{tx.travelDate}</span>
              <span className="font-semibold">{tx.durationDays} Hari</span>
              <span className="font-semibold">{tx.shiftTime}</span>
            </div>
            {tx.dateDetails && (
              <div className="p-3 bg-indigo-50 border-t border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-indigo-600">Rincian Tanggal Sewa:</span> {tx.dateDetails}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Rincian Keuangan</h4>
          <div className="p-5 rounded-2xl border border-slate-200 space-y-3 bg-slate-50 text-sm">
            <div className="flex justify-between text-slate-700">
              <span>Total Tarif ({tx.durationDays} Hari):</span>
              <span className="font-bold text-slate-900">{formatRupiah(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Pembayaran DP (Uang Muka):</span>
              <span className="font-bold text-emerald-600">(-) {formatRupiah(tx.dpAmount)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slate-200 text-base text-slate-900">
              <span className="font-extrabold">Sisa Pelunasan:</span>
              <span className="font-extrabold text-rose-600">{formatRupiah(tx.remainingPay)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-end pt-10 border-t border-slate-200 text-xs text-slate-600">
          <div>
            <p className="font-bold mb-1 text-slate-900">Catatan Penting:</p>
            <p className="max-w-xs">Harap melunasi sisa pembayaran sebelum perjalanan dimulai atau kepada supir bertugas.</p>
          </div>
          <div className="text-center">
            <p className="mb-16 font-medium">Hormat Kami,</p>
            <p className="font-bold border-t border-slate-400 pt-1 px-8 text-slate-900">Admin Hitsbah Transport</p>
          </div>
        </div>

      </div>
    </div>
  );
}