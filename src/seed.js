import { readFile } from 'node:fs/promises';
import { ObjectId } from 'mongodb';
import { isCatalogueEmpty, insertDemoAlbums, getAlbumCoverNames } from './albums.js';
import { copyDemoImages } from './uploads.js';

// Restore referenced demo covers; load demo albums whenever the catalogue is empty.
export async function initializeDemoData() {
    const contents = await readFile('./data/albums.json', 'utf8');
    // Parse the demo catalogue stored in the project data folder.
    const demoAlbums = JSON.parse(contents);

    if (!await isCatalogueEmpty()) {
        const covers = await getAlbumCoverNames();
        // Only restore demo covers still referenced by existing albums.
        const usedDemoAlbums = demoAlbums.filter(album => covers.includes(album.cover_image));
        await copyDemoImages(usedDemoAlbums);
        console.log('Existing catalogue preserved.');
        return;
    }

    // Require the covers before inserting demo records.
    await copyDemoImages(demoAlbums);
    for (const album of demoAlbums) {
        for (const review of album.reviews) {
            review._id = new ObjectId();
        }
    }
    await insertDemoAlbums(demoAlbums);
    console.log(`Loaded ${demoAlbums.length} demo albums into MongoDB.`);
}
