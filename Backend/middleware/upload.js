import fs from 'fs';
import path from 'path';
import multer from 'multer';

const audioUploadDir = path.resolve(process.cwd(), 'uploads', 'audio');
fs.mkdirSync(audioUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioUploadDir);
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
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Unsupported audio format. Please upload a valid audio file.'));
};

export const audioUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});
