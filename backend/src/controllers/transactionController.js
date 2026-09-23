const prisma = require('../utils/prisma');

// Helper untuk mengecek bentrok tanggal sewa pada mobil yang sama (tanggal/bulan/tahun yang sama bentrok)
async function checkDateOverlap(carName, travelDate, durationDays, excludeTxId = null) {
  if (!travelDate) return false;
  const startA = new Date(travelDate);
  startA.setHours(0, 0, 0, 0);
  const durA = parseInt(durationDays) || 1;
  const endA = new Date(startA);
  endA.setDate(startA.getDate() + durA - 1);

  const whereClause = {
    carName: { equals: carName, mode: 'insensitive' },
    status: 'BERJALAN'
  };
  if (excludeTxId) {
    whereClause.id = { not: excludeTxId };
  }

  const existingTxs = await prisma.transaction.findMany({ where: whereClause });

  for (const tx of existingTxs) {
    if (!tx.travelDate) continue;
    const startB = new Date(tx.travelDate);
    startB.setHours(0, 0, 0, 0);
    const durB = parseInt(tx.durationDays) || 1;
    const endB = new Date(startB);
    endB.setDate(startB.getDate() + durB - 1);

    // Rumus overlap date range: startA <= endB AND endA >= startB
    if (startA <= endB && endA >= startB) {
      return true;
    }
  }
  return false;
}

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
      customerName, customerPhone, address, carName, destination, 
      driverName, driverPhone, travelDate, durationDays, dateDetails, 
      shiftTime, discountAmount, promoPercent, dpAmount, remainingPay, 
      serviceType, notes, status 
    } = req.body;

    const daysNum = parseInt(durationDays) || 1;
    const isOverlap = await checkDateOverlap(carName, travelDate, daysNum);
    if (isOverlap) {
      return res.status(400).json({ 
        success: false, 
        message: `⚠️ Gagal buat nota: Mobil "${carName}" sudah dibooking pada rentang tgl/bulan/tahun yang sama yang bentrok!` 
      });
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        customerName,
        customerPhone: customerPhone || null,
        address,
        carName,
        destination,
        driverName: driverName || null,      
        driverPhone: driverPhone || null,    
        travelDate,
        durationDays: daysNum,
        dateDetails: dateDetails || null,
        shiftTime,
        discountAmount: parseInt(discountAmount) || 0,
        promoPercent: parseInt(promoPercent) || 0,
        dpAmount: parseInt(dpAmount) || 0,
        remainingPay: parseInt(remainingPay) || 0,
        serviceType,
        notes: notes !== undefined && notes !== null ? String(notes) : null,
        status: status || 'BERJALAN'        
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
      customerName, customerPhone, address, carName, destination, 
      driverName, driverPhone, travelDate, durationDays, dateDetails, 
      shiftTime, discountAmount, promoPercent, dpAmount, remainingPay, 
      serviceType, notes, status 
    } = req.body;

    const daysNum = parseInt(durationDays) || 1;
    const isOverlap = await checkDateOverlap(carName, travelDate, daysNum, id);
    if (isOverlap) {
      return res.status(400).json({ 
        success: false, 
        message: `⚠️ Gagal update: Mobil "${carName}" bentrok dengan jadwal sewa lain pada tgl/bulan/tahun yang sama!` 
      });
    }

    const updatePayload = {
      customerName,
      customerPhone: customerPhone || null,
      address,
      carName,
      destination,
      driverName: driverName || null,      
      driverPhone: driverPhone || null,    
      travelDate,
      durationDays: daysNum,
      dateDetails: dateDetails || null,
      shiftTime,
      discountAmount: parseInt(discountAmount) || 0,
      promoPercent: parseInt(promoPercent) || 0,
      dpAmount: parseInt(dpAmount) || 0,
      remainingPay: parseInt(remainingPay) || 0,
      serviceType,
      notes: notes !== undefined ? (notes ? String(notes) : null) : null
    };

    if (status) {
      updatePayload.status = status;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updatePayload
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
        where: { 
          carName: { equals: tx.carName, mode: 'insensitive' },
          status: 'BERJALAN' 
        }
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