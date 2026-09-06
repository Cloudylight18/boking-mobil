const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const upload = require('../middlewares/upload');

// Menggunakan upload.fields agar dapat menerima multiple field 'images' dan 'videos' secara bersamaan
const uploadFields = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]);

router.get('/', carController.getCars);
router.post('/', uploadFields, carController.createCar);
router.put('/:id', uploadFields, carController.updateCar);
router.delete('/:id', carController.deleteCar);

module.exports = router;