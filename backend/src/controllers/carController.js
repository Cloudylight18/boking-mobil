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

// POST: Tambah mobil baru
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

    let imageCreateData = [];
    if (images && Array.isArray(images)) {
      imageCreateData = images.map(url => ({ imageUrl: url }));
    } else if (req.files && req.files['images'] && req.files['images'].length > 0) {
      imageCreateData = req.files['images'].map(file => ({
        imageUrl: `/uploads/${file.filename}`
      }));
    }

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

// PUT: Update mobil berdasarkan ID (Menghapus foto/video lama yang dipilih & menambah yang baru)
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

    // 1. Handle Penghapusan Foto Lama yang dipilih dari Frontend
    let deletedImagesArray = [];
    if (req.body['deletedImages[]']) {
      deletedImagesArray = Array.isArray(req.body['deletedImages[]']) ? req.body['deletedImages[]'] : [req.body['deletedImages[]']];
    }

    if (deletedImagesArray.length > 0) {
      for (const imgId of deletedImagesArray) {
        const imgRecord = await prisma.carImage.findUnique({ where: { id: imgId } });
        if (imgRecord) {
          // Hapus file fisik jika path berawalan /uploads/
          if (imgRecord.imageUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', imgRecord.imageUrl);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch (err) { console.error("Gagal hapus file gambar fisik:", err); }
            }
          }
          await prisma.carImage.delete({ where: { id: imgId } });
        }
      }
    }

    // 2. Handle Penghapusan Video Lama yang dipilih dari Frontend
    let deletedVideosArray = [];
    if (req.body['deletedVideos[]']) {
      deletedVideosArray = Array.isArray(req.body['deletedVideos[]']) ? req.body['deletedVideos[]'] : [req.body['deletedVideos[]']];
    }

    if (deletedVideosArray.length > 0) {
      for (const vidId of deletedVideosArray) {
        const vidRecord = await prisma.carVideo.findUnique({ where: { id: vidId } });
        if (vidRecord) {
          if (vidRecord.videoUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', vidRecord.videoUrl);
            if (fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch (err) { console.error("Gagal hapus file video fisik:", err); }
            }
          }
          await prisma.carVideo.delete({ where: { id: vidId } });
        }
      }
    }

    // 3. Update Data Utama Mobil, Harga Tujuan, & Syarat Sewa
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

    // 4. Handle Tambahan Gambar Baru (jika ada upload file baru)
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

    // 5. Handle Tambahan Video Baru (jika ada upload file baru)
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

    // Ambil data terbaru secara lengkap
    const finalCar = await prisma.car.findUnique({
      where: { id },
      include: { images: true, videos: true, destinationPrices: true, terms: true }
    });

    res.status(200).json({ success: true, message: 'Mobil berhasil diperbarui', data: finalCar });
  } catch (error) {
    console.error("ERROR UPDATE CAR:", error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui mobil', detail: error.message });
  }
};

// DELETE: Hapus mobil beserta seluruh file fisik dan relasinya secara aman
exports.deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    // Ambil data gambar & video untuk dihapus file fisiknya dari server
    const carImages = await prisma.carImage.findMany({ where: { carId: id } });
    const carVideos = await prisma.carVideo.findMany({ where: { carId: id } });

    carImages.forEach(img => {
      if (img.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', img.imageUrl);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (err) {}
        }
      }
    });

    carVideos.forEach(vid => {
      if (vid.videoUrl.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '..', vid.videoUrl);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (err) {}
        }
      }
    });

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