const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middlewares/upload'); // Pastikan path middleware upload sudah sesuai

// Endpoint Login Admin
router.post('/login', authController.loginAdmin);

// Endpoint Register Admin
router.post('/register', authController.registerAdmin);

// Endpoint Profil Admin (Mendukung berbagai variasi URL GET dari frontend)
router.get('/profile', authController.getProfile);
router.get('/me', authController.getProfile);

// Endpoint Update Profil (Mendukung /update-profile & /profile dengan middleware upload file)
router.put('/update-profile', upload.single('image'), authController.updateProfile);
router.put('/profile', upload.single('image'), authController.updateProfile);

// Endpoint Update Password Admin (Mendukung /update-password & /password)
router.put('/update-password', authController.updatePassword);
router.put('/password', authController.updatePassword);

module.exports = router;