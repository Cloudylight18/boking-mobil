const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// Fungsi Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    res.status(201).json({ status: 'success', message: 'Akun Admin berhasil dibuat!', data: { username: newAdmin.username } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Gagal membuat admin', detail: error.message });
  }
};

// Fungsi Login Admin (Lengkap dengan Detektif)
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("=========================================");
    console.log("👉 1. ADA REQUEST LOGIN MASUK");
    console.log("👉 2. Username dari web :", `"${username}"`);
    console.log("👉 3. Password dari web :", `"${password}"`);

    // Cari user di database
    const user = await prisma.user.findUnique({ where: { username } });
    console.log("👉 4. Data dari database:", user ? "DITEMUKAN" : "KOSONG");

    if (!user) {
      console.log("❌ GAGAL: Username tidak ada di Database!");
      console.log("=========================================");
      return res.status(401).json({ status: 'error', message: 'Username tidak ditemukan!' });
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
      return res.status(401).json({ status: 'error', message: 'Password salah!' });
    }

    console.log("✅ SUKSES: PASSWORD COCOK, LOGIN BERHASIL!");
    console.log("=========================================");
    
    res.json({
      status: 'success',
      message: 'Login Admin berhasil!',
      data: { id: user.id, username: user.username, role: user.role, image: user.image }
    });

  } catch (error) {
    console.error("❌ ERROR SERVER:", error);
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
      const hashedPassword = await bcrypt.hash('admin123', 10);
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
        image: user.image
      }
    });
  } catch (error) {
    console.error("❌ ERROR GET PROFILE:", error);
    res.status(500).json({ status: 'error', message: 'Gagal memuat profil', detail: error.message });
  }
};

// Fungsi Update Profil Admin (Username & Foto Avatar)
exports.updateProfile = async (req, res) => {
  try {
    const { id, username } = req.body;
    
    let user = id ? await prisma.user.findUnique({ where: { id } }) : await prisma.user.findFirst({ where: { role: 'ADMIN' } });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User admin tidak ditemukan!' });
    }

    let updateData = {};
    if (username) updateData.username = username;

    // Jika ada file gambar baru yang diunggah melalui Multer
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
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
        image: updatedUser.image,
        role: updatedUser.role
      }
    });

  } catch (error) {
    console.error("❌ ERROR UPDATE PROFILE:", error);
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

    let isCurrentValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    } else {
      isCurrentValid = (currentPassword === user.password);
    }

    if (!isCurrentValid) {
      return res.status(400).json({ status: 'error', message: 'Kata sandi saat ini salah!' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

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