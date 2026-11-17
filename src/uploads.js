import { constants } from 'node:fs';
import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export const UPLOADS_FOLDER = './uploads';
const DEMO_IMAGES_FOLDER = './data/images';

export async function copyDemoImages(demoAlbums) {
    // Check every source before copying files or inserting demo data.
    for (const album of demoAlbums) {
        await access(path.join(DEMO_IMAGES_FOLDER, album.cover_image), constants.R_OK);
    }

    await mkdir(UPLOADS_FOLDER, { recursive: true });

    for (const album of demoAlbums) {
        const source = path.join(DEMO_IMAGES_FOLDER, album.cover_image);
        const destination = path.join(UPLOADS_FOLDER, album.cover_image);

        try {
            // Existing files must not be overwritten on restart.
            await copyFile(source, destination, constants.COPYFILE_EXCL);
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
}
