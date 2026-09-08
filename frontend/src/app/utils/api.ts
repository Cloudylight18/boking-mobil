import axios from 'axios';

export const API = axios.create({
  baseURL: 'https://steelblue-fox-791845.hostingersite.com', // URL backend produksi Anda
  timeout: 60000, // Timeout 60 detik untuk proses upload foto/video besar
});

// Helper untuk mengirim sinyal ke Global Loader
const triggerLoader = (show: boolean) => {
  if (typeof window !== 'undefined') {
    const eventName = show ? 'show-loader' : 'hide-loader';
    window.dispatchEvent(new Event(eventName));
  }
};

// Listener global untuk memunculkan loading saat request dikirim (Simpan, Upload, Fetch)
API.interceptors.request.use(
  (config) => {
    triggerLoader(true);
    return config;
  },
  (error) => {
    triggerLoader(false);
    return Promise.reject(error);
  }
);

// Listener global untuk mematikan loading setelah response diterima (Sukses atau Gagal)
API.interceptors.response.use(
  (response) => {
    triggerLoader(false);
    return response;
  },
  (error) => {
    triggerLoader(false);
    return Promise.reject(error);
  }
);