import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

const UPLOAD_DIR = 'uploads';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'application/pdf': 'pdf',
};

await fs.mkdir(UPLOAD_DIR, { recursive: true });

export const validateFile = (file) => {
    if (!file) throw new Error('No file provided');

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }

    if (!ALLOWED_TYPES[file.mimetype]) {
        throw new Error(`File type not allowed. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`);
    }

    return true;
};

export const saveFile = async (file) => {
    validateFile(file);

    const timestamp = Date.now();
    const ext = ALLOWED_TYPES[file.mimetype];
    const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await fs.writeFile(filepath, file.buffer);

    return `/${filepath}`;
};

export const optimizeImage = async (file) => {
    validateFile(file);

    if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image');
    }

    const timestamp = Date.now();
    const ext = ALLOWED_TYPES[file.mimetype];
    const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const pipeline = sharp(file.buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 });

    await pipeline.toFile(filepath);

    return `/${filepath}`;
};

export const deleteFile = async (filepath) => {
    if (!filepath) return;

    try {
        const fullPath = path.join('.', filepath);
        await fs.unlink(fullPath);
    } catch (error) {
        console.error(`Failed to delete file ${filepath}:`, error.message);
    }
};

export const getFileUrl = (filepath) => {
    if (!filepath) return null;
    return filepath.startsWith('/') ? filepath : `/${filepath}`;
};
