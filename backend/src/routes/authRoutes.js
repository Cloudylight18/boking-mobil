const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint Login Admin
router.post('/login', authController.loginAdmin);

// Endpoint Register Admin
router.post('/register', authController.registerAdmin);

// Endpoint Profil Admin (Mendukung /profile maupun /me untuk frontend)
router.get('/profile', authController.getProfile);
router.get('/me', authController.getProfile);

// Endpoint Update Profil & Password Admin
router.put('/profile', authController.updateProfile);
router.put('/password', authController.updatePassword);

module.exports = router;