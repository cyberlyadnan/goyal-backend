import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { generateUuid } from '../helpers/uuid.helper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadRoot = path.resolve(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${generateUuid()}${ext}`);
  },
});

/**
 * Local Multer uploader (staging). Prefer Cloudinary streaming in product features.
 */
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;
