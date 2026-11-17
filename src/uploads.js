import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { access, copyFile, mkdir, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

export const UPLOADS_FOLDER = './uploads';
const DEMO_IMAGES_FOLDER = './data/images';

export async function copyDemoImages(demoAlbums) {
    await mkdir(UPLOADS_FOLDER, { recursive: true });
    const missing = [];
    for (const album of demoAlbums) {
        const filename = album.cover_image;
        if (path.basename(filename) !== filename) throw new Error('Invalid cover filename');
        const source = path.join(DEMO_IMAGES_FOLDER, filename);
        const destination = path.join(UPLOADS_FOLDER, filename);
        try {
            await access(destination, constants.R_OK);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
            await access(source, constants.R_OK);
            missing.push({ source: source, destination: destination });
        }
    }
    for (const file of missing) {
        try {
            await copyFile(file.source, file.destination, constants.COPYFILE_EXCL);
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }
}

export const receiveCover = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 7, parts: 8 }
}).single('cover_image');

export function coverExtension(file) {
    if (!file) return '';
    const bytes = file.buffer;
    if (file.mimetype === 'image/png' && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return '.png';
    if (file.mimetype === 'image/jpeg' && bytes.subarray(0, 3).toString('hex') === 'ffd8ff') return '.jpg';
    if (file.mimetype === 'image/gif' && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString())) return '.gif';
    if (file.mimetype === 'image/webp' && bytes.subarray(0, 4).toString() === 'RIFF'
        && bytes.subarray(8, 12).toString() === 'WEBP') return '.webp';
    return '';
}

export async function saveCover(file, extension) {
    await mkdir(UPLOADS_FOLDER, { recursive: true });
    const filename = randomUUID() + extension;
    await writeFile(path.join(UPLOADS_FOLDER, filename), file.buffer, { flag: 'wx' });
    return filename;
}

export async function removeCover(filename) {
    if (path.basename(filename) !== filename) throw new Error('Invalid cover filename');
    try {
        await unlink(path.join(UPLOADS_FOLDER, filename));
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }
}

export function handleCoverError(error, req, res, next) {
    if (!(error instanceof multer.MulterError)) return next(error);
    const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'La portada no puede superar los 5 MiB.'
        : 'Envía una sola portada y los siete campos del formulario.';
    res.status(400).render('error', {
        pageTitle: 'No se pudo guardar el álbum', messages: [message],
        returnUrl: req.params.id ? '/albums/' + encodeURIComponent(req.params.id) + '/edit' : '/new-element',
        returnLabel: 'Volver al formulario'
    });
}
