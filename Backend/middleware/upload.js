import fs from 'fs';
import path from 'path';
import multer from 'multer';

const audioUploadDir = path.resolve(process.cwd(), 'uploads', 'audio');
const imageUploadDir = path.resolve(process.cwd(), 'uploads', 'images');
fs.mkdirSync(audioUploadDir, { recursive: true });
fs.mkdirSync(imageUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      cb(null, audioUploadDir);
      return;
    }

    if (file.fieldname === 'cover') {
      cb(null, imageUploadDir);
      return;
    }

    cb(new Error('Unsupported file field'));
  },
  filename: (req, file, cb) => {
    const safeBaseName = file.originalname
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase() || '.mp3';
    cb(null, `${Date.now()}-${safeBaseName}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
]);

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio' && allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  if (file.fieldname === 'cover' && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Unsupported file format. Please upload valid audio and image files.'));
};

export const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export const songUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});
