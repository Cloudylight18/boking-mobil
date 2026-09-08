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
            price: parseInt(item.price) || 0
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

// PUT: Update mobil berdasarkan ID (Anti-Crash pada Penghapusan File)
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

    // 1. Tangkap array ID gambar yang dihapus secara aman
    let deletedImagesArray = [];
    if (req.body['deletedImages[]']) {
      deletedImagesArray = Array.isArray(req.body['deletedImages[]']) ? req.body['deletedImages[]'] : [req.body['deletedImages[]']];
    }

    if (deletedImagesArray.length > 0) {
      for (const imgId of deletedImagesArray) {
        try {
          const imgRecord = await prisma.carImage.findUnique({ where: { id: imgId } });
          if (imgRecord) {
            if (imgRecord.imageUrl.startsWith('/uploads/')) {
              // Gunakan .replace(/^\/+/, '') agar path aman dari bug leading slash path.join
              const cleanPath = imgRecord.imageUrl.replace(/^\/+/, '');
              const filePath = path.join(__dirname, '..', cleanPath);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
            await prisma.carImage.delete({ where: { id: imgId } });
          }
        } catch (err) {
          console.error(`Gagal menghapus gambar ID ${imgId}:`, err.message);
        }
      }
    }

    // 2. Tangkap array ID video yang dihapus secara aman
    let deletedVideosArray = [];
    if (req.body['deletedVideos[]']) {
      deletedVideosArray = Array.isArray(req.body['deletedVideos[]']) ? req.body['deletedVideos[]'] : [req.body['deletedVideos[]']];
    }

    if (deletedVideosArray.length > 0) {
      for (const vidId of deletedVideosArray) {
        try {
          const vidRecord = await prisma.carVideo.findUnique({ where: { id: vidId } });
          if (vidRecord) {
            if (vidRecord.videoUrl.startsWith('/uploads/')) {
              const cleanPath = vidRecord.videoUrl.replace(/^\/+/, '');
              const filePath = path.join(__dirname, '..', cleanPath);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
            await prisma.carVideo.delete({ where: { id: vidId } });
          }
        } catch (err) {
          console.error(`Gagal menghapus video ID ${vidId}:`, err.message);
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
            price: parseInt(item.price) || 0
          }))
        },
        terms: {
          deleteMany: {},
          create: termsArray.map(desc => ({ description: desc }))
        }
      },
      include: { images: true, videos: true, destinationPrices: true, terms: true }
    });

    // 4. Handle Tambahan Gambar Baru via Upload File
    if (req.files && req.files['images'] && req.files['images'].length > 0) {
      for (const file of req.files['images']) {
        await prisma.carImage.create({
          data: {
            carId: id,
            imageUrl: `/uploads/${file.filename}`
          }
        });
      }
    }

    // 5. Handle Tambahan Video Baru via Upload File
    if (req.files && req.files['videos'] && req.files['videos'].length > 0) {
      for (const file of req.files['videos']) {
        await prisma.carVideo.create({
          data: {
            carId: id,
            videoUrl: `/uploads/${file.filename}`
          }
        });
      }
    }

    // Ambil data terbaru secara lengkap untuk dikembalikan ke frontend
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

    const carImages = await prisma.carImage.findMany({ where: { carId: id } });
    const carVideos = await prisma.carVideo.findMany({ where: { carId: id } });

    carImages.forEach(img => {
      try {
        if (img.imageUrl.startsWith('/uploads/')) {
          const cleanPath = img.imageUrl.replace(/^\/+/, '');
          const filePath = path.join(__dirname, '..', cleanPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {}
    });

    carVideos.forEach(vid => {
      try {
        if (vid.videoUrl.startsWith('/uploads/')) {
          const cleanPath = vid.videoUrl.replace(/^\/+/, '');
          const filePath = path.join(__dirname, '..', cleanPath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (err) {}
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