const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 1. Setup Prisma dengan Adapter PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 2. Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      'https://hitsbahtransport.com', // URL Frontend Online Hostinger
      'http://localhost:3000',      // URL lokal Next.js/React
      'http://localhost:5173'       // URL lokal Vite
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// 3. Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Memungkinkan akses resource lintas folder (gambar/video uploads)
}));

// ==========================================
// PENGATURAN CORS SPESIFIK DOMAIN BARU
// ==========================================
app.use(cors({
  origin: [
    'https://hitsbahtransport.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// PENTING: AKSES PUBLIK FOLDER UPLOADS
// ==========================================
// Mengarahkan URL /uploads ke folder fisik public/uploads di root direktori backend
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ==========================================
// 4. HUBUNGKAN ROUTES (JALUR API)
// ==========================================
const carRoutes = require('./src/routes/carRoutes');
app.use('/api/cars', carRoutes); 

const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

const transactionRoutes = require('./src/routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

const knowledgeRoutes = require('./src/routes/knowledgeRoutes');
app.use('/api/knowledge', knowledgeRoutes);
  
const aiRoutes = require('./src/routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);
// ==========================================

// 5. Test Route & Cek Koneksi Database
app.get('/', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
        status: 'success',
        message: 'API Rental Mobil dan Koneksi Database VPS Berhasil Terhubung!' 
    });
  } catch (error) {
    console.error('Error koneksi database:', error);
    res.status(500).json({ 
        status: 'error',
        message: 'API berjalan, tapi gagal terhubung ke database VPS.',
        detail: error.message
    });
  }
});

// 6. Socket Connection Logic
io.on('connection', (socket) => {
  console.log('\x1b[36m⚡ Client terkoneksi dengan ID:\x1b[0m', socket.id);
  
  socket.on('disconnect', () => {
    console.log('\x1b[31m❌ Client terputus:\x1b[0m', socket.id);
  });
});

// 7. Jalankan Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    console.clear();
    console.log('\x1b[35m\x1b[1m=========================================================\x1b[0m');
    console.log('\x1b[36m\x1b[1m  🚀 HITSBAH TRANSPORT BACKEND ENGINE v2.0 ACTIVE 🚀 \x1b[0m');
    console.log('\x1b[35m\x1b[1m=========================================================\x1b[0m');
    console.log(`\x1b[32m\x1b[1m  [SERVER]     \x1b[0m Running smoothly at \x1b[36m\x1b[4mhttp://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[32m\x1b[1m  [DATABASE]   \x1b[0m \x1b[92m🟢 PostgreSQL Database Connected & Secure (VPS)\x1b[0m`);
    console.log(`\x1b[32m\x1b[1m  [SOCKET.IO]  \x1b[0m \x1b[95m🟢 Realtime Gateway Initialized\x1b[0m`);
    console.log(`\x1b[32m\x1b[1m  [KNOWLEDGE]  \x1b[0m \x1b[93m🟢 Vito AI Knowledge Base Synced\x1b[0m`);
    console.log('\x1b[35m\x1b[1m=========================================================\x1b[0m');
  } catch (dbError) {
    console.log('\x1b[31m\x1b[1m=========================================================\x1b[0m');
    console.log('\x1b[31m\x1b[1m  ⚠️  SERVER RUNNING BUT DATABASE CONNECTION FAILED ⚠️  \x1b[0m');
    console.log('\x1b[31m\x1b[1m=========================================================\x1b[0m');
    console.error('\x1b[33mDetail Error:\x1b[0m', dbError.message);
  }
});

module.exports = { io, prisma };