const prisma = require('../utils/prisma');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Statistik Armada Mobil
    const cars = await prisma.car.findMany();
    const totalCars = cars.length;
    const availableCars = cars.filter(c => c.status === 'AVAILABLE').length;
    const maintenanceCars = cars.filter(c => c.status === 'MAINTENANCE').length;
    const unavailableCars = cars.filter(c => c.status === 'UNAVAILABLE').length;

    // 2. Statistik Transaksi & Keuangan POS
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;
    let totalDp = 0;
    let totalRemaining = 0;

    transactions.forEach(t => {
      const dp = Number(t.dpAmount || 0);
      const remaining = Number(t.remainingPay || 0);
      totalDp += dp;
      totalRemaining += remaining;
      totalRevenue += (dp + remaining);
    });

    // 3. Statistik Knowledge AI Aktif (Aman dari error)
    let knowledgeCount = 0;
    try {
      knowledgeCount = await prisma.aiKnowledge.count({
        where: { isActive: true }
      });
    } catch (e) {
      knowledgeCount = 0;
    }

    // 4. Total Pengunjung E-commerce (Aman dari error)
    let visitorCount = 0;
    try {
      visitorCount = await prisma.visitorLog.count();
    } catch (e) {
      visitorCount = 0;
    }

    // 5. 5 Transaksi POS Terbaru
    const recentTransactions = transactions.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalCars,
        availableCars,
        maintenanceCars,
        unavailableCars,
        totalRevenue,
        totalDp,
        totalRemaining,
        totalTransactions: transactions.length,
        knowledgeCount,
        visitorCount,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard', error: error.message });
  }
};

exports.recordVisitor = async (req, res) => {
  try {
    await prisma.visitorLog.create({ data: {} });
    res.status(200).json({ success: true, message: 'Visitor recorded' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mencatat visitor', error: error.message });
  }
};