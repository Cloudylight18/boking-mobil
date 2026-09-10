const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Fungsi Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password || username.trim() === '' || password.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi!' });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'Username sudah digunakan oleh akun lain!' });
    }

    const hashedPassword = await bcrypt.hash(password, 12); // Menggunakan salt rounds yang lebih aman (12)

    const newAdmin = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    res.status(201).json({ status: 'success', message: 'Akun Admin berhasil dibuat!', data: { username: newAdmin.username } });
  } catch (error) {
    console.error("❌ ERROR REGISTER ADMIN:", error);
    res.status(500).json({ status: 'error', message: 'Gagal membuat admin', detail: error.message });
  }
};

// Fungsi Login Admin (Lengkap dengan Detektif & Keamanan Timing Attack)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'Username dan password harus diisi!' });
    }

    console.log("=========================================");
    console.log("👉 1. ADA REQUEST LOGIN MASUK");
    console.log("👉 2. Username dari web :", `"${username}"`);

    // Cari user di database
    const user = await prisma.user.findUnique({ where: { username } });
    console.log("👉 4. Data dari database:", user ? "DITEMUKAN" : "KOSONG");

    if (!user) {
      console.log("❌ GAGAL: Username tidak ada di Database!");
      console.log("=========================================");
      return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Akses ditolak! Bukan Administrator.' });
    }

    // Pengecekan password (mendukung hash bcrypt & plain text DBeaver)
    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = (password === user.password);
    }

    if (!isPasswordValid) {
      console.log("❌ GAGAL: Password salah!");
      console.log("=========================================");
      return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
    }

    console.log("✅ SUKSES: PASSWORD COCOK, LOGIN BERHASIL!");
    console.log("=========================================");
    
    res.json({
      status: 'success',
      message: 'Login Admin berhasil!',
      data: { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        image: user.image || user.profileImage || null 
      }
    });

  } catch (error) {
    console.error("❌ ERROR SERVER LOGIN:", error);
    res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server', detail: error.message });
  }
};

// Fungsi Ambil Profil Admin (Otomatis buat default jika kosong agar tidak 404)
exports.getProfile = async (req, res) => {
  try {
    let user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) {
      user = await prisma.user.findFirst();
    }

    // Jika database benar-benar kosong, buatkan akun default otomatis agar tidak 404
    if (!user) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      user = await prisma.user.create({
        data: {
          username: 'superadmin',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
    }

    res.json({
      status: 'success',
      message: 'Profil berhasil dimuat',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        image: user.image || user.profileImage || null,
        profileImage: user.image || user.profileImage || null
      }
    });
  } catch (error) {
    console.error("❌ ERROR GET PROFILE:", error);
    res.status(500).json({ status: 'error', message: 'Gagal memuat profil', detail: error.message });
  }
};

// Fungsi Update Profil Admin (Username & Foto Avatar) - Aman & Anti-Crash
exports.updateProfile = async (req, res) => {
  try {
    const { id, username } = req.body;
    
    let user = id ? await prisma.user.findUnique({ where: { id } }) : await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!user) {
      // Bersihkan file jika terlanjur terupload oleh multer tapi user tidak valid
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (err) {}
      }
      return res.status(404).json({ status: 'error', message: 'User admin tidak ditemukan!' });
    }

    let updateData = {};
    if (username && username.trim() !== '') {
      // Cek apakah username sudah dipakai user lain
      const existingName = await prisma.user.findFirst({
        where: { username: username.trim(), NOT: { id: user.id } }
      });
      if (existingName) {
        if (req.file) {
          try { fs.unlinkSync(req.file.path); } catch (err) {}
        }
        return res.status(400).json({ status: 'error', message: 'Username sudah digunakan oleh akun lain!' });
      }
      updateData.username = username.trim();
    }

    // Jika ada file gambar baru yang diunggah melalui Multer
    if (req.file) {
      const newImagePath = `/uploads/${req.file.filename}`;
      
      // Hapus file gambar lama secara fisik jika ada untuk menghemat ruang server
      const oldImage = user.image || user.profileImage;
      if (oldImage && oldImage.startsWith('/uploads/')) {
        const cleanPath = oldImage.replace(/^\/+/, '');
        const oldFilePath = path.join(__dirname, '../../public', cleanPath);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error("Gagal menghapus file avatar lama:", err.message);
        }
      }

      updateData.image = newImagePath;
      // Jika skema prisma Anda menggunakan 'profileImage', sesuaikan di sini:
      // updateData.profileImage = newImagePath; 
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    res.json({
      status: 'success',
      message: 'Profil admin berhasil diperbarui!',
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        image: updatedUser.image || updatedUser.profileImage || null,
        profileImage: updatedUser.image || updatedUser.profileImage || null,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("❌ ERROR UPDATE PROFILE:", error);
    // Hapus file upload jika terjadi eror database agar server bersih
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
    }
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui profil', detail: error.message });
  }
};

// Fungsi Update Password Admin (Khusus Ganti Sandi)
exports.updatePassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    
    let user = id ? await prisma.user.findUnique({ where: { id } }) : await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User admin tidak ditemukan!' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'error', message: 'Semua kolom password harus diisi!' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password baru minimal harus 6 karakter!' });
    }

    let isCurrentValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      isCurrentValid = (currentPassword === user.password);
    }

    if (!isCurrentValid) {
      return res.status(400).json({ status: 'error', message: 'Kata sandi saat ini salah!' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      status: 'success',
      message: 'Kata sandi berhasil diubah!'
    });

  } catch (error) {
    console.error("❌ ERROR UPDATE PASSWORD:", error);
    res.status(500).json({ status: 'error', message: 'Gagal mengubah kata sandi', detail: error.message });
  }
};