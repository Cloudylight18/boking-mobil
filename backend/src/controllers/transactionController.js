const prisma = require('../utils/prisma');

// GET: Ambil semua transaksi
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi', detail: error.message });
  }
};

// POST: Buat transaksi POS baru & update status mobil jadi UNAVAILABLE
exports.createTransaction = async (req, res) => {
  try {
    const { 
      customerName, 
      customerPhone, // Ditambahkan
      address, 
      carName, 
      destination, 
      driverName,    // Ditambahkan
      driverPhone,   // Ditambahkan
      travelDate, 
      durationDays, 
      dateDetails, 
      shiftTime, 
      discountAmount, 
      dpAmount, 
      remainingPay, 
      serviceType 
    } = req.body;

    const newTransaction = await prisma.transaction.create({
      data: {
        customerName,
        customerPhone: customerPhone || null, // Ditambahkan
        address,
        carName,
        destination,
        driverName: driverName || null,       // Ditambahkan
        driverPhone: driverPhone || null,     // Ditambahkan
        travelDate,
        durationDays: parseInt(durationDays) || 1,
        dateDetails: dateDetails || null,
        shiftTime,
        discountAmount: parseInt(discountAmount) || 0,
        dpAmount: parseInt(dpAmount) || 0,
        remainingPay: parseInt(remainingPay) || 0,
        serviceType
      }
    });

    // Ubah status mobil menjadi UNAVAILABLE (karena sedang disewa)
    await prisma.car.updateMany({
      where: { name: { equals: carName, mode: 'insensitive' } },
      data: { status: 'UNAVAILABLE' }
    });

    res.status(201).json({ success: true, message: 'Transaksi berhasil disimpan & status mobil diperbarui', data: newTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal membuat transaksi', detail: error.message });
  }
};

// PUT: Update transaksi POS
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customerName, 
      customerPhone, // Ditambahkan
      address, 
      carName, 
      destination, 
      driverName,    // Ditambahkan
      driverPhone,   // Ditambahkan
      travelDate, 
      durationDays, 
      dateDetails, 
      shiftTime, 
      discountAmount, 
      dpAmount, 
      remainingPay, 
      serviceType 
    } = req.body;

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        customerName,
        customerPhone: customerPhone || null, // Ditambahkan
        address,
        carName,
        destination,
        driverName: driverName || null,       // Ditambahkan
        driverPhone: driverPhone || null,     // Ditambahkan
        travelDate,
        durationDays: parseInt(durationDays) || 1,
        dateDetails: dateDetails || null,
        shiftTime,
        discountAmount: parseInt(discountAmount) || 0,
        dpAmount: parseInt(dpAmount) || 0,
        remainingPay: parseInt(remainingPay) || 0,
        serviceType
      }
    });

    await prisma.car.updateMany({
      where: { name: { equals: carName, mode: 'insensitive' } },
      data: { status: 'UNAVAILABLE' }
    });

    res.status(200).json({ success: true, message: 'Transaksi berhasil diperbarui', data: updatedTransaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui transaksi', detail: error.message });
  }
};

// DELETE: Hapus transaksi & kembalikan status mobil jadi AVAILABLE
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const tx = await prisma.transaction.findUnique({ where: { id } });

    if (tx) {
      await prisma.transaction.delete({ where: { id } });
      
      const activeOther = await prisma.transaction.findFirst({
        where: { carName: { equals: tx.carName, mode: 'insensitive' } }
      });

      if (!activeOther) {
        await prisma.car.updateMany({
          where: { name: { equals: tx.carName, mode: 'insensitive' } },
          data: { status: 'AVAILABLE' }
        });
      }
    }

    res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus transaksi', detail: error.message });
  }
};