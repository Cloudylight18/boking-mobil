const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

// GET: Ambil semua data mobil
exports.getCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      include: {
        images: true,
        videos: true,
        destinationPrices: true,
        terms: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: cars });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data mobil', detail: error.message });
  }
};

// POST: Tambah mobil baru (Menerima URL file yang sudah di-upload sebelumnya atau via multipart)
exports.createCar = async (req, res) => {
  try {
    const { name, condition, status, destinationPrices, images, videos } = req.body;
    
    let parsedDestinationPrices = [];
    if (destinationPrices) {
      try {
        parsedDestinationPrices = typeof destinationPrices === 'string' ? JSON.parse(destinationPrices) : destinationPrices;
      } catch (e) {
        parsedDestinationPrices = [];
      }
    }

    let termsArray = [];
    if (req.body['terms[]']) {
      termsArray = Array.isArray(req.body['terms[]']) ? req.body['terms[]'] : [req.body['terms[]']];
    } else if (req.body.terms) {
      termsArray = Array.isArray(req.body.terms) ? req.body.terms : [req.body.terms];
    }

    // Menyiapkan data gambar (mendukung path dari file multipart langsung ATAU array URL string dari upload terpisah)
    let imageCreateData = [];
    if (images && Array.isArray(images)) {
      imageCreateData = images.map(url => ({ imageUrl: url }));
    } else if (req.files && req.files['images'] && req.files['images'].length > 0) {
      imageCreateData = req.files['images'].map(file => ({
        imageUrl: `/uploads/${file.filename}`
      }));
    }

    // Menyiapkan data video (mendukung path dari file multipart langsung ATAU array URL string dari upload terpisah)
    let videoCreateData = [];
    if (videos && Array.isArray(videos)) {
      videoCreateData = videos.map(url => ({ videoUrl: url }));
    } else if (req.files && req.files['videos'] && req.files['videos'].length > 0) {
      videoCreateData = req.files['videos'].map(file => ({
        videoUrl: `/uploads/${file.filename}`
      }));
    }

    const newCar = await prisma.car.create({
      data: {
        name,
        condition,
        status: status || 'AVAILABLE',
        destinationPrices: {
          create: parsedDestinationPrices.map(item => ({
            destination: item.destination,
            serviceType: item.serviceType,
            price: parseInt(item.price)
          }))
        },
        terms: {
          create: termsArray.map(desc => ({ description: desc }))
        },
        images: imageCreateData.length > 0 ? { create: imageCreateData } : undefined,
        videos: videoCreateData.length > 0 ? { create: videoCreateData } : undefined
      },
      include: { images: true, videos: true, destinationPrices: true, terms: true }
    });

    res.status(201).json({ success: true, message: 'Mobil berhasil ditambahkan', data: newCar });
  } catch (error) {
    console.error("ERROR CREATE CAR:", error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan mobil', detail: error.message });
  }
};

// PUT: Update mobil berdasarkan ID
exports.updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, condition, status, destinationPrices, images, videos } = req.body;

    let parsedDestinationPrices = [];
    if (destinationPrices) {
      try {
        parsedDestinationPrices = typeof destinationPrices === 'string' ? JSON.parse(destinationPrices) : destinationPrices;
      } catch (e) {
        parsedDestinationPrices = [];
      }
    }

    let termsArray = [];
    if (req.body['terms[]']) {
      termsArray = Array.isArray(req.body['terms[]']) ? req.body['terms[]'] : [req.body['terms[]']];
    } else if (req.body.terms) {
      termsArray = Array.isArray(req.body.terms) ? req.body.terms : [req.body.terms];
    }

    const updatedCar = await prisma.car.update({
      where: { id },
      data: {
        name,
        condition,
        status,
        destinationPrices: {
          deleteMany: {},
          create: parsedDestinationPrices.map(item => ({
            destination: item.destination,
            serviceType: item.serviceType,
            price: parseInt(item.price)
          }))
        },
        terms: {
          deleteMany: {},
          create: termsArray.map(desc => ({ description: desc }))
        }
      },
      include: { images: true, videos: true, destinationPrices: true, terms: true }
    });

    // Handle tambahan gambar baru (jika dikirim via URL array atau file multipart)
    if (images && Array.isArray(images)) {
      for (const url of images) {
        await prisma.carImage.create({
          data: { carId: id, imageUrl: url }
        });
      }
    } else if (req.files && req.files['images'] && req.files['images'].length > 0) {
      for (const file of req.files['images']) {
        await prisma.carImage.create({
          data: {
            carId: id,
            imageUrl: `/uploads/${file.filename}`
          }
        });
      }
    }

    // Handle tambahan video baru
    if (videos && Array.isArray(videos)) {
      for (const url of videos) {
        await prisma.carVideo.create({
          data: { carId: id, videoUrl: url }
        });
      }
    } else if (req.files && req.files['videos'] && req.files['videos'].length > 0) {
      for (const file of req.files['videos']) {
        await prisma.carVideo.create({
          data: {
            carId: id,
            videoUrl: `/uploads/${file.filename}`
          }
        });
      }
    }

    res.status(200).json({ success: true, message: 'Mobil berhasil diperbarui', data: updatedCar });
  } catch (error) {
    console.error("ERROR UPDATE CAR:", error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui mobil', detail: error.message });
  }
};

// DELETE: Hapus mobil berdasarkan ID secara aman menggunakan Transaction
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.carImage.deleteMany({ where: { carId: id } });
      await tx.carVideo.deleteMany({ where: { carId: id } });
      await tx.carDestinationPrice.deleteMany({ where: { carId: id } });
      await tx.rentalTerm.deleteMany({ where: { carId: id } });
      await tx.car.delete({ where: { id } });
    });

    res.status(200).json({ success: true, message: 'Mobil berhasil dihapus' });
  } catch (error) {
    console.error("ERROR DELETE CAR:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus mobil', 
      detail: error.message 
    });
  }
};