import { albumTitleExists } from './albums.js';

export const albumRules = {
    descriptionMin: 20,
    descriptionMax: 2000,
    priceMin: 0,
    priceMax: 9999.99,
    titlePattern: '[A-ZÁÉÍÓÚÜÑ].*'
};

function readText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) {
        return false;
    }
    const date = new Date(value + 'T00:00:00Z');
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export async function validateAlbumFields(body = {}, currentId = '') {
    if (!body || typeof body !== 'object') {
        body = {};
    }
    const album = {
        album_title: readText(body.album_title),
        artist: readText(body.artist),
        description: readText(body.description),
        release_date: readText(body.release_date),
        format: readText(body.format)
    };
    const errors = [];
    const priceText = readText(body.record_price);
    const price = Number(priceText);

    if (!album.album_title) {
        errors.push('El título es obligatorio.');
    } else if (!new RegExp('^' + albumRules.titlePattern + '$', 'u').test(album.album_title)) {
        errors.push('El título debe comenzar por una letra mayúscula.');
    } else if (await albumTitleExists(album.album_title, currentId)) {
        errors.push('Ya existe un álbum con ese título.');
    }

    if (!album.artist) {
        errors.push('El artista es obligatorio.');
    }
    if (!/^\d+(\.\d{1,2})?$/.test(priceText) || !Number.isFinite(price)
        || price < albumRules.priceMin || price > albumRules.priceMax) {
        errors.push('El precio debe estar entre 0 y 9999,99 €, con un máximo de dos decimales.');
    }
    album.record_price = price;

    if (album.description.length < albumRules.descriptionMin
        || album.description.length > albumRules.descriptionMax) {
        errors.push('La descripción debe tener entre 20 y 2000 caracteres.');
    }
    if (!isValidDate(album.release_date)) {
        errors.push('La fecha de lanzamiento debe ser una fecha válida.');
    }
    if (!['lp', 'vinyl', 'digital', 'cd'].includes(album.format)) {
        errors.push('Selecciona un formato válido: LP, Vinilo, Digital o CD.');
    }

    return { album: album, errors: errors };
}
