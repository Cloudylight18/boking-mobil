const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Menggunakan lowercase untuk konsistensi nama file
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // PERBAIKAN: Gunakan ^ (awal) dan $ (akhir) agar presisi. "i" untuk case-insensitive.
  const allowedImageTypes = /^\.(jpeg|jpg|png|webp)$/i;
  const allowedVideoTypes = /^\.(mp4|mov|webm|mkv|avi)$/i;

  const ext = path.extname(file.originalname).toLowerCase();
  
  // PERBAIKAN: Regex MimeType juga dibuat lebih ketat
  const isImage = allowedImageTypes.test(ext) && /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
  
  // Catatan: MimeType video sering kali bervariasi (mkv = x-matroska, avi = x-msvideo)
  const isVideo = allowedVideoTypes.test(ext) && /^video\/(mp4|quicktime|webm|x-matroska|x-msvideo)$/i.test(file.mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    // Memberikan pesan error yang jelas jika ditolak
    cb(new Error('Ekstensi file atau MimeType tidak valid! Hanya JPG, PNG, WEBP, MP4, MOV, WEBM, dan MKV yang diizinkan.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 5 // PERBAIKAN: Cegah serangan dengan membatasi jumlah maksimal file dalam 1 kali upload (misal 5 file)
  }, 
  fileFilter: fileFilter
});

module.exports = upload;