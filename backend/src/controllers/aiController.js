const { GoogleGenAI } = require('@google/genai');
const prisma = require('../utils/prisma');

// Inisialisasi Google Gen AI menggunakan API Key dari .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

exports.chatWithHitsbah = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
    }

    // 1. Ambil data stok mobil terbaru secara real-time dari database
    const cars = await prisma.car.findMany();
    const carSummary = cars.map(c => 
      `- ${c.name} | Status: ${c.status === 'AVAILABLE' ? 'Tersedia (Kosong)' : 'Disewa/Maintenance'} | Mobil + Supir: Rp ${Number(c.priceWithDriver || 0).toLocaleString('id-ID')} | Carter All-In (Terima Beres): Rp ${Number(c.priceCarterAllIn || c.priceRentOnly || 0).toLocaleString('id-ID')}`
    ).join('\n');

    // 2. Ambil data Knowledge (SOP, FAQ, Berita Acara) dari database admin
    const knowledgeBase = await prisma.aiKnowledge.findMany({
      where: { isActive: true }
    });
    const knowledgeSummary = knowledgeBase.map(k => 
      `[Kategori: ${k.category}] ${k.title}:\n${k.content}`
    ).join('\n\n');

    // 3. Susun Instruksi Sistem (System Instruction) agar Gemini memahami aturan layanan baru
    const systemInstruction = `
      Anda adalah asisten virtual AI profesional untuk perusahaan rental mobil dan travel "Hitsbah Transport".
      Tugas Anda adalah membantu pelanggan menjawab pertanyaan seputar ketersediaan mobil, harga sewa, syarat dan ketentuan, serta berita acara perjalanan dengan ramah, akurat, dan sopan dalam bahasa Indonesia.

      ATURAN UTAMA LAYANAN:
      - Perusahaan kami **TIDAK MENYEDIAKAN layanan lepas kunci** (setir sendiri).
      - Layanan kami hanya terbagi menjadi 2 jenis pilihan:
        1. **Mobil + Supir**
        2. **Carter All-In** (Mobil + Supir + Carter, sudah terima beres dan bebas pusing biaya tambahan di jalan).

      Berikut adalah data real-time armada mobil dan tarifnya:
      ${carSummary || 'Belum ada mobil terdaftar.'}

      Berikut adalah database Knowledge (SOP & Ketentuan Rental dari Admin):
      ${knowledgeSummary || 'Belum ada knowledge tambahan.'}

      Gunakan data di atas untuk menjawab pertanyaan pelanggan secara cerdas dan natural. Jika pelanggan bertanya mobil yang kosong, sebutkan unit yang statusnya "Tersedia (Kosong)" beserta rincian harga untuk pilihan "Mobil + Supir" atau "Carter All-In". Jika ada yang menanyakan sewa lepas kunci, jelaskan secara sopan bahwa Hitsbah Transport hanya melayani paket dengan supir dan carter all-in terima beres. Jika bertanya tentang syarat atau berita acara, ambil informasinya dari database Knowledge.
    `;

    // 4. Panggil model Google Gemini terbaru (gemini-3.6-flash)
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    // Ambil teks hasil generate dengan aman
    const reply = response.text || "Maaf, asisten Hitsbah Transport sedang memproses jawaban. Silakan coba lagi.";

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal memproses AI dengan Gemini', 
      error: error.message 
    });
  }
};