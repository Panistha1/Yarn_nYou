const multer = require('multer');
const path = require('path');

// Files get saved to backend/uploads/products with a unique filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isAllowed = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png and .webp images are allowed'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB per image
});

module.exports = upload;