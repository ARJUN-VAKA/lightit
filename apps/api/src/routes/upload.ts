import { Router } from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'video/mp4'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

// Upload file
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

    const key = `${req.user!.id}/${uuidv4()}-${req.file.originalname}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'lightit-storage',
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({
      success: true,
      data: {
        url,
        key,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
    });
  } catch (err) { next(err); }
});

// Get presigned URL for direct browser upload
router.post('/presign', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { fileName, fileType } = req.body;
    const key = `${req.user!.id}/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'lightit-storage',
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    res.json({ success: true, data: { presignedUrl, publicUrl, key } });
  } catch (err) { next(err); }
});

export default router;
