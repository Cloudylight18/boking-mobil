const prisma = require('../utils/prisma');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Ambil Semua Transaksi POS untuk Rekapitulasi Pendapatan
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;
    let totalDp = 0;
    let totalRemaining = 0;
    let currentMonthRevenue = 0; 

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // Struktur penampung pendapatan per bulan (Index 0 = Januari, 1 = Februari, dst.)
    const monthlyRevenueData = Array(12).fill(0);

    transactions.forEach(t => {
      const dp = Number(t.dpAmount || 0);
      const remaining = Number(t.remainingPay || 0);
      const txTotal = dp + remaining;

      totalDp += dp;
      totalRemaining += remaining;
      totalRevenue += txTotal;

      const createdDate = new Date(t.createdAt);
      const txYear = createdDate.getFullYear();
      const txMonth = createdDate.getMonth();

      // Akumulasi berdasarkan tahun berjalan
      if (txYear === currentYear) {
        monthlyRevenueData[txMonth] += txTotal;

        // Pendapatan bulan ini yang sedang berjalan
        if (txMonth === currentMonth) {
          currentMonthRevenue += txTotal;
        }
      }
    });

    // 2. Statistik Knowledge AI Aktif
    let knowledgeCount = 0;
    try {
      knowledgeCount = await prisma.aiKnowledge.count({
        where: { isActive: true }
      });
    } catch (e) {
      knowledgeCount = 0;
    }

    // 3. Statistik Pengunjung E-commerce Berdasarkan Waktu
    let visitorStats = { total: 0, today: 0, month: 0, year: 0 };
    try {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [total, today, month, year] = await Promise.all([
        prisma.visitorLog.count(),
        prisma.visitorLog.count({ where: { createdAt: { gte: startOfDay } } }),
        prisma.visitorLog.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.visitorLog.count({ where: { createdAt: { gte: startOfYear } } })
      ]);

      visitorStats = { total, today, month, year };
    } catch (e) {
      console.error('Error visitor stats:', e);
    }

    // 4. 5 Transaksi POS Terbaru
    const recentTransactions = transactions.slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalDp,
        totalRemaining,
        currentMonthRevenue,
        monthlyRevenueData, // Array pendapatan dari Januari s.d Desember tahun berjalan
        totalTransactions: transactions.length,
        knowledgeCount,
        visitorStats,
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

exports.resetVisitors = async (req, res) => {
  try {
    await prisma.visitorLog.deleteMany({});
    res.status(200).json({ success: true, message: 'Visitor count reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mereset visitor', error: error.message });
  }
};