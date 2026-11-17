import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 5000
});
const database = client.db('musix');
const albums = database.collection('albums');

export async function connectDatabase() {
    await client.connect();
}

export async function closeDatabase() {
    await client.close();
}

export async function isCatalogueEmpty() {
    return await albums.findOne({}) === null;
}

export async function insertDemoAlbums(demoAlbums) {
    await albums.insertMany(demoAlbums);
}
