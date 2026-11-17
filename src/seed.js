import { readFile } from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import { isCatalogueEmpty, insertDemoAlbums } from './albums.js';
import { copyDemoImages } from './uploads.js';

export async function initializeDemoData() {
    const contents = await readFile('./data/albums.json', 'utf8');
    const demoAlbums = JSON.parse(contents);

    await copyDemoImages(demoAlbums);

    if (!await isCatalogueEmpty()) {
        console.log('Existing catalogue preserved.');
        return;
    }

    for (const album of demoAlbums) {
        for (const review of album.reviews) {
            review._id = new ObjectId();
        }
    }

    await insertDemoAlbums(demoAlbums);
    console.log(`Loaded ${demoAlbums.length} demo albums into MongoDB.`);
}
