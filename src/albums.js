import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient('mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 5000
});
const database = client.db('musix');
const albums = database.collection('albums');

export async function connectDatabase() {
    await client.connect();
    await albums.createIndex({ album_title: 1 }, { unique: true });
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

export async function countAlbums(filter = {}) {
    return await albums.countDocuments(filter);
}

export async function getAlbumsPage(page, pageSize, filter = {}) {
    return await albums.find(filter)
        .sort({ _id: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
}

export async function getAlbum(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return await albums.findOne({ _id: new ObjectId(id) });
}

export function createAlbumFilter(title, format) {
    const filter = {};
    if (title) {
        let escapedTitle = '';
        const specialCharacters = '.*+?^${}()|[]\\';
        for (const character of title) {
            if (specialCharacters.includes(character)) {
                escapedTitle += '\\';
            }
            escapedTitle += character;
        }
        filter.album_title = { $regex: escapedTitle, $options: 'i' };
    }
    if (format) {
        filter.format = format;
    }
    return filter;
}

export async function albumTitleExists(title, currentId = '') {
    const filter = { album_title: title };
    if (currentId) {
        filter._id = { $ne: new ObjectId(currentId) };
    }
    return await albums.findOne(filter) !== null;
}

export async function addAlbum(album) {
    const result = await albums.insertOne(album);
    return result.insertedId;
}

export async function updateAlbum(id, album, previousCover) {
    const result = await albums.updateOne(
        { _id: new ObjectId(id), cover_image: previousCover },
        { $set: album }
    );
    return result.matchedCount === 1;
}

export async function deleteAlbum(id) {
    if (!ObjectId.isValid(id)) {
        return null;
    }
    return await albums.findOneAndDelete(
        { _id: new ObjectId(id) },
        { includeResultMetadata: false }
    );
}

export async function addReview(albumId, review) {
    if (!ObjectId.isValid(albumId)) return false;
    review._id = new ObjectId();
    const result = await albums.updateOne(
        { _id: new ObjectId(albumId), 'reviews.review_title': { $ne: review.review_title } },
        { $push: { reviews: review } }
    );
    return result.modifiedCount === 1;
}
