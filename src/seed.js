import { readFile } from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import { isCatalogueEmpty, insertDemoAlbums, isDemoInitialized, markDemoInitialized, getAlbumCoverNames } from './albums.js';
import { copyDemoImages } from './uploads.js';

export async function initializeDemoData() {
    const contents = await readFile('./data/albums.json', 'utf8');
    const demoAlbums = JSON.parse(contents);
    const initialized = await isDemoInitialized();

    if (initialized || !await isCatalogueEmpty()) {
        const covers = await getAlbumCoverNames();
        const usedDemoAlbums = demoAlbums.filter(album => covers.includes(album.cover_image));
        await copyDemoImages(usedDemoAlbums);
        if (!initialized) await markDemoInitialized();
        console.log('Existing catalogue preserved.');
        return;
    }

    await copyDemoImages(demoAlbums);
    for (const album of demoAlbums) {
        for (const review of album.reviews) {
            review._id = new ObjectId();
        }
    }
    await insertDemoAlbums(demoAlbums);
    await markDemoInitialized();
    console.log(`Loaded ${demoAlbums.length} demo albums into MongoDB.`);
}
