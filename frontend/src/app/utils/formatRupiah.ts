/**
 * Mengubah angka menjadi format mata uang Rupiah (IDR)
 * Contoh: 1500000 -> Rp 1.500.000
 */
export const formatRupiah = (number: number | string): string => {
  const numericValue = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(numericValue)) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};