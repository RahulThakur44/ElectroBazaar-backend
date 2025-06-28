// middleware/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Storage Config for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ElectroBazaar',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'limit' },
      { fetch_format: 'auto' } // ✅ Convert to best format (e.g. WebP)
    ],
  },
});

// ✅ Multer Upload Middleware
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    if (['jpeg', 'jpg', 'png', 'webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Optional: 5MB file size limit
});

module.exports = upload;
