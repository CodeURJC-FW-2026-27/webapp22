import { MongoClient, ObjectId } from 'mongodb';

// Reuse one MongoDB client; stop waiting after five seconds if the server is unavailable.
const client = new MongoClient('mongodb://127.0.0.1:27017', {
    serverSelectionTimeoutMS: 5000
});
// Albums and their embedded reviews are stored in the musix database.
const database = client.db('musix');
const albums = database.collection('albums');

// Parse a positive integer album ID; return null for invalid values.
function parseAlbumId(id) {
    if (typeof id === 'number') {
        return Number.isSafeInteger(id) && id > 0 ? id : null;
    }
    if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id)) {
        return null;
    }
    const parsed = Number(id);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

// Open the connection and enforce unique album titles in MongoDB.
export async function connectDatabase() {
    await client.connect();
    await albums.createIndex({ album_title: 1 }, { unique: true });
}

// Release the database connection.
export async function closeDatabase() {
    await client.close();
}

// Check whether startup needs to load the demo catalogue.
export async function isCatalogueEmpty() {
    return await albums.findOne({}) === null;
}

// Insert all demo albums in one database operation.
export async function insertDemoAlbums(demoAlbums) {
    await albums.insertMany(demoAlbums);
}

// Count matching albums to calculate pagination.
export async function countAlbums(filter = {}) {
    return await albums.countDocuments(filter);
}

// Read one page in a stable ID order, applying the current filters.
export async function getAlbumsPage(page, pageSize, filter = {}) {
    return await albums.find(filter)
        .sort({ _id: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
}

// Convert a valid URL ID to a positive integer; return null for invalid or missing albums.
export async function getAlbum(id) {
    const albumId = parseAlbumId(id);
    if (albumId === null) {
        return null;
    }
    return await albums.findOne({ _id: albumId });
}

// Combine a literal, case-insensitive title search with an exact format filter.
export function createAlbumFilter(title, format) {
    const filter = {};
    if (title) {
        let escapedTitle = '';
        // Escape regex symbols so user input is treated as ordinary search text.
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

// Check title uniqueness, excluding the current album when editing.
export async function albumTitleExists(title, currentId = '') {
    const filter = { album_title: title };
    const parsedId = parseAlbumId(currentId);
    if (parsedId !== null) {
        filter._id = { $ne: parsedId };
    }
    return await albums.findOne(filter) !== null;
}

// Store a new album with the next sequential numeric ID and return it.
export async function addAlbum(album) {
    for (let attempt = 0; attempt < 5; attempt++) {
        const lastAlbums = await albums.find({}, { projection: { _id: 1 } })
            .sort({ _id: -1 })
            .limit(1)
            .toArray();
        const nextId = lastAlbums.length > 0 ? Number(lastAlbums[0]._id) + 1 : 1;
        try {
            const result = await albums.insertOne({ ...album, _id: nextId });
            return result.insertedId;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern?._id) {
                continue;
            }
            throw error;
        }
    }
    throw new Error('No se pudo asignar un identificador único al álbum.');
}

// Update form fields without replacing reviews; reject a changed cover.
export async function updateAlbum(id, album, previousCover) {
    const albumId = parseAlbumId(id);
    if (albumId === null) {
        return false;
    }
    const result = await albums.updateOne(
        { _id: albumId, cover_image: previousCover },
        // Set only validated album fields, preserving other stored fields.
        { $set: album }
    );
    // A matched record also counts as success when its values did not change.
    return result.matchedCount === 1;
}

// Delete the album and return its data so the cover can be removed.
export async function deleteAlbum(id) {
    const albumId = parseAlbumId(id);
    if (albumId === null) {
        return null;
    }
    return await albums.findOneAndDelete(
        { _id: albumId },
        { includeResultMetadata: false }
    );
}

// Give the embedded review an ID and append it only if its title is unused.
export async function addReview(albumId, review) {
    const parsedAlbumId = parseAlbumId(albumId);
    if (parsedAlbumId === null) return false;
    review._id = new ObjectId();
    const result = await albums.updateOne(
        { _id: parsedAlbumId, 'reviews.review_title': { $ne: review.review_title } },
        { $push: { reviews: review } }
    );
    return result.modifiedCount === 1;
}

// Update one embedded review only if no other review has the same title.
export async function updateReview(albumId, reviewId, review) {
    const parsedAlbumId = parseAlbumId(albumId);
    if (parsedAlbumId === null || !ObjectId.isValid(reviewId)) return false;
    const id = new ObjectId(reviewId);
    const result = await albums.updateOne(
        {
            _id: parsedAlbumId,
            reviews: { $elemMatch: { _id: id } },
            // Reject another review with this title in the same atomic update.
            $nor: [{ reviews: { $elemMatch: { _id: { $ne: id }, review_title: review.review_title } } }]
        },
        {
            $set: {
                // The positional $ selects the review matched by its ID.
                'reviews.$.review_title': review.review_title,
                'reviews.$.nickname': review.nickname,
                'reviews.$.review_date': review.review_date,
                'reviews.$.opinion': review.opinion,
                'reviews.$.rating': review.rating
            }
        }
    );
    // A matched record also counts as success when its values did not change.
    return result.matchedCount === 1;
}

// Remove only the matching review from the album array.
export async function deleteReview(albumId, reviewId) {
    const parsedAlbumId = parseAlbumId(albumId);
    if (parsedAlbumId === null || !ObjectId.isValid(reviewId)) return false;
    const id = new ObjectId(reviewId);
    const result = await albums.updateOne(
        { _id: parsedAlbumId, 'reviews._id': id },
        { $pull: { reviews: { _id: id } } }
    );
    return result.modifiedCount === 1;
}

// Read cover filenames without loading the full album documents.
export async function getAlbumCoverNames() {
    const documents = await albums.find({}, { projection: { cover_image: 1 } }).toArray();
    return documents.map(album => album.cover_image);
}