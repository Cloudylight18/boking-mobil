const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Diselaraskan agar folder uploads berada di root/public/uploads
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
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'media-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /^\.(jpeg|jpg|png|webp)$/i;
  const allowedVideoTypes = /^\.(mp4|mov|webm|mkv|avi)$/i;

  const ext = path.extname(file.originalname).toLowerCase();
  
  const isImage = allowedImageTypes.test(ext) && /^image\/(jpeg|jpg|png|webp)$/i.test(file.mimetype);
  const isVideo = allowedVideoTypes.test(ext) && /^video\/(mp4|quicktime|webm|x-matroska|x-msvideo)$/i.test(file.mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    cb(new Error('Ekstensi file atau MimeType tidak valid! Hanya JPG, PNG, WEBP, MP4, MOV, WEBM, dan MKV yang diizinkan.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10 // Maksimal 10 file sekaligus
  }, 
  fileFilter: fileFilter
});

module.exports = upload;