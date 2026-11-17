import express from 'express';
import { countAlbums, getAlbumsPage, getAlbum, createAlbumFilter, addAlbum } from './albums.js';

import { catalogueUrl } from './defaultModel.js';
import { albumRules, validateAlbumFields } from './validation.js';

import { receiveCover, coverExtension, saveCover, removeCover, handleCoverError } from './uploads.js';

const router = express.Router();
export default router;

router.get('/', async (req, res) => {
    const pageSize = 6;
    const title = res.locals.searchTitle;
    const format = res.locals.selectedFormat;
    const filter = createAlbumFilter(title, format);
    const totalAlbums = await countAlbums(filter);
    const totalPages = Math.max(1, Math.ceil(totalAlbums / pageSize));
    let currentPage = 1;

    if (typeof req.query.page === 'string') {
        const requestedPage = Number(req.query.page);
        if (Number.isSafeInteger(requestedPage) && requestedPage > 0) {
            currentPage = Math.min(requestedPage, totalPages);
        }
    }

    const albums = await getAlbumsPage(currentPage, pageSize, filter);
    for (const album of albums) {
        prepareAlbumDisplay(album);
    }

    const pages = [];
    for (let number = 1; number <= totalPages; number++) {
        pages.push({
            number: number,
            url: catalogueUrl(title, format, number),
            isCurrent: number === currentPage
        });
    }

    res.render('index', {
        albums: albums,
        pages: pages,
        showPagination: totalPages > 1,
        hasPrevious: currentPage > 1,
        previousUrl: catalogueUrl(title, format, currentPage - 1),
        hasNext: currentPage < totalPages,
        nextUrl: catalogueUrl(title, format, currentPage + 1)
    });
});

router.get('/detail', (req, res) => {
    res.redirect('/');
});

router.get('/albums/:id', async (req, res) => {
    const album = await getAlbum(req.params.id);

    if (!album) {
        res.status(404).render('error', {
            pageTitle: 'Álbum no encontrado',
            messages: ['El identificador no es válido o el álbum ya no existe.'],
            returnUrl: '/',
            returnLabel: 'Volver al catálogo'
        });
        return;
    }

    prepareAlbumDisplay(album);
    const formatLabels = {
        lp: 'LP',
        vinyl: 'Vinilo',
        digital: 'Digital',
        cd: 'CD'
    };
    album.displayFormat = formatLabels[album.format];
    album.displayReleaseDate = formatDate(album.release_date);

    for (const review of album.reviews) {
        review.displayDate = formatDate(review.review_date);
    }

    res.render('detail', {
        pageTitle: album.album_title,
        album: album
    });
});

router.get('/new-element', (req, res) => {
    res.render('new-element', { rules: albumRules });
});

router.post('/albums', receiveCover, createAlbum, handleCoverError);

async function createAlbum(req, res) {
    const { album, errors } = await validateAlbumFields(req.body);
    const extension = coverExtension(req.file);
    if (!req.file) {
        errors.push('La portada es obligatoria.');
    } else if (!extension) {
        errors.push('La portada debe ser una imagen PNG, JPEG, GIF o WebP.');
    }
    if (errors.length > 0) return showAlbumErrors(res, errors);

    const filename = await saveCover(req.file, extension);
    album.cover_image = filename;
    album.reviews = [];
    let id;
    try {
        id = await addAlbum(album);
    } catch (error) {
        await removeCover(filename);
        if (error.code === 11000) {
            return showAlbumErrors(res, ['Ya existe un álbum con ese título.']);
        }
        throw error;
    }
    res.status(201).render('confirmation', {
        pageTitle: 'Álbum creado',
        messages: ['El álbum se ha añadido al catálogo correctamente.'],
        returnUrl: '/albums/' + id,
        returnLabel: 'Ver álbum'
    });
}

function showAlbumErrors(res, messages) {
    return res.status(400).render('error', {
        pageTitle: 'No se pudo crear el álbum', messages: messages,
        returnUrl: '/new-element', returnLabel: 'Volver al formulario'
    });
}

function prepareAlbumDisplay(album) {
    album.displayPrice = album.record_price.toFixed(2);
    album.coverUrl = '/uploads/' + encodeURIComponent(album.cover_image);
}

function formatDate(date) {
    const parts = date.split('-');
    return parts[2] + '/' + parts[1] + '/' + parts[0];
}

router.use((req, res) => {
    res.status(404).render('error', {
        pageTitle: 'Página no encontrada',
        messages: ['La página solicitada no existe.'],
        returnUrl: '/',
        returnLabel: 'Volver al catálogo'
    });
});

router.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    console.error(error);
    res.status(500).render('error', {
        pageTitle: 'No se pudo completar la operación',
        messages: ['Se ha producido un error en el servidor. Inténtalo de nuevo.'],
        returnUrl: '/',
        returnLabel: 'Volver al catálogo'
    });
});
