import axios from 'axios';

// Tentukan base URL secara otomatis (bisa dari .env atau langsung ke domain Hostinger)
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://steelblue-fox-791845.hostingersite.com';

export const API = axios.create({
  baseURL: backendUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});