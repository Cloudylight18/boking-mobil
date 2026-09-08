const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const upload = require('../middlewares/upload');

// Menggunakan upload.fields dengan kapasitas maksimal 10 file untuk images dan 10 file untuk videos
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 10 }
]);

// Endpoint Manajemen Armada
router.get('/', carController.getCars);
router.post('/', uploadFields, carController.createCar);
router.put('/:id', uploadFields, carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;