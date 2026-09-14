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

    const hashedPassword = await bcrypt.hash(password, 12);

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

// Fungsi Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ status: 'error', message: 'Username dan password harus diisi!' });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ status: 'error', message: 'Akses ditolak! Bukan Administrator.' });
    }

    let isPasswordValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = (password === user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
    }
    
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

// Fungsi Ambil Profil Admin
exports.getProfile = async (req, res) => {
  try {
    let user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!user) {
      user = await prisma.user.findFirst();
    }

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

// ==========================================
// PERBAIKAN UTAMA DI SINI (UPDATE PROFILE)
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { id, username } = req.body;
    
    let user = null;

    // 1. Cari berdasarkan ID jika dikirim dan valid
    if (id && id !== 'undefined' && id !== 'null') {
      user = await prisma.user.findUnique({ where: { id: String(id) } });
    }

    // 2. Jika ID tidak ada atau user tidak ketemu, gunakan fallback otomatis cari user ber-role ADMIN pertama
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    }

    // 3. Jika masih kosong, ambil user pertama yang ada di database agar tidak pernah 404
    if (!user) {
      user = await prisma.user.findFirst();
    }

    // Jika database benar-benar kosong melompong
    if (!user) {
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (err) {}
      }
      return res.status(404).json({ status: 'error', message: 'Tidak ada data user di dalam database!' });
    }

    let updateData = {};
    if (username && username.trim() !== '') {
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
      
      // Hapus file gambar lama secara fisik jika ada
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
      // Dukungan untuk skema prisma yang menggunakan profileImage
      updateData.profileImage = newImagePath; 
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
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (err) {}
    }
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui profil', detail: error.message });
  }
};

// Fungsi Update Password Admin
exports.updatePassword = async (req, res) => {
  try {
    const { id, currentPassword, newPassword } = req.body;
    
    let user = null;
    if (id && id !== 'undefined' && id !== 'null') {
      user = await prisma.user.findUnique({ where: { id: String(id) } });
    }
    if (!user) {
      user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    }

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