const prisma = require('../utils/prisma');

// GET: Ambil semua data knowledge (Perbaikan menggunakan findMany)
exports.getKnowledge = async (req, res) => {
  try {
    const data = await prisma.aiKnowledge.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data knowledge', error: error.message });
  }
};

// POST: Tambah knowledge baru
exports.createKnowledge = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const newItem = await prisma.aiKnowledge.create({
      data: { title, content, category: category || 'Umum' }
    });
    res.status(201).json({ success: true, message: 'Knowledge berhasil ditambahkan', data: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menambah knowledge', error: error.message });
  }
};

// PUT: Update knowledge
exports.updateKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const updated = await prisma.aiKnowledge.update({
      where: { id },
      data: { title, content, category }
    });
    res.status(200).json({ success: true, message: 'Knowledge berhasil diperbarui', data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui knowledge', error: error.message });
  }
};

// DELETE: Hapus knowledge
exports.deleteKnowledge = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.aiKnowledge.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Knowledge berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Gagal menghapus knowledge', error: error.message });
  }
};