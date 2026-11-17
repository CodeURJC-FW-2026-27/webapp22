import express from 'express';
import { countAlbums, getAlbumsPage, getAlbum, createAlbumFilter, addAlbum, updateAlbum, deleteAlbum, addReview, updateReview, deleteReview } from './albums.js';

import { catalogueUrl } from './defaultModel.js';
import { albumRules, validateAlbumFields, validateReviewFields } from './validation.js';

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

    if (!album) return showMissingAlbum(res);

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
        review.albumId = album._id;
    }

    res.render('detail', {
        pageTitle: album.album_title,
        reviewForm: makeReviewForm(album._id),
        album: album
    });
});

router.post('/albums/:id/reviews/:reviewId/delete', async (req, res) => {
    const deleted = await deleteReview(req.params.id, req.params.reviewId);
    if (!deleted) {
        if (!await getAlbum(req.params.id)) return showMissingAlbum(res);
        return showMissingReview(res, req.params.id);
    }
    res.render('confirmation', {
        pageTitle: 'Reseña eliminada',
        messages: ['La reseña se ha eliminado correctamente.'],
        returnUrl: '/albums/' + req.params.id,
        returnLabel: 'Volver al álbum'
    });
});

router.get('/albums/:id/reviews/:reviewId/edit', async (req, res) => {
    const album = await getAlbum(req.params.id);
    if (!album) return showMissingAlbum(res);
    const review = album.reviews.find(item => String(item._id) === req.params.reviewId);
    if (!review) return showMissingReview(res, req.params.id);
    res.render('edit-review', {
        pageTitle: 'Editar reseña',
        albumTitle: album.album_title,
        reviewForm: makeReviewForm(album._id, review)
    });
});

function makeReviewForm(albumId, review = {}) {
    const isEditing = Boolean(review._id);
    const ratings = [];
    for (let value = 1; value <= 5; value++) {
        ratings.push({ value: value, selected: value === review.rating });
    }
    return {
        review: review, ratings: ratings, isEditing: isEditing,
        action: '/albums/' + albumId + '/reviews' + (isEditing ? '/' + review._id + '/edit' : ''),
        heading: isEditing ? 'Modifica tu reseña' : '¡Deja tu reseña!',
        submitLabel: isEditing ? 'Guardar' : 'Crear',
        cancelUrl: '/albums/' + albumId
    };
}

router.post('/albums/:id/reviews', saveReview);
router.post('/albums/:id/reviews/:reviewId/edit', saveReview);

async function saveReview(req, res) {
    const album = await getAlbum(req.params.id);
    if (!album) return showMissingAlbum(res);
    const reviewId = req.params.reviewId || '';
    if (reviewId && !album.reviews.some(item => String(item._id) === reviewId)) {
        return showMissingReview(res, req.params.id);
    }
    const { review, errors } = validateReviewFields(req.body, album.reviews, reviewId);
    if (errors.length > 0) return showReviewErrors(req, res, errors);

    const saved = reviewId
        ? await updateReview(req.params.id, reviewId, review)
        : await addReview(req.params.id, review);
    if (!saved) {
        const currentAlbum = await getAlbum(req.params.id);
        if (!currentAlbum) return showMissingAlbum(res);
        if (reviewId && !currentAlbum.reviews.some(item => String(item._id) === reviewId)) {
            return showMissingReview(res, req.params.id);
        }
        return showReviewErrors(req, res, ['Ya existe una reseña con ese título en este álbum.']);
    }
    res.status(reviewId ? 200 : 201).render('confirmation', {
        pageTitle: reviewId ? 'Reseña actualizada' : 'Reseña creada',
        messages: [reviewId ? 'Los cambios de la reseña se han guardado correctamente.'
            : 'La reseña se ha añadido al álbum correctamente.'],
        returnUrl: '/albums/' + req.params.id,
        returnLabel: 'Volver al álbum'
    });
}

function showReviewErrors(req, res, messages) {
    return res.status(400).render('error', {
        pageTitle: 'No se pudo guardar la reseña',
        messages: messages,
        returnUrl: '/albums/' + req.params.id + (req.params.reviewId
            ? '/reviews/' + req.params.reviewId + '/edit' : '#review-form'),
        returnLabel: 'Volver al formulario'
    });
}

function showMissingReview(res, albumId) {
    return res.status(404).render('error', {
        pageTitle: 'Reseña no encontrada',
        messages: ['La reseña no existe en este álbum.'],
        returnUrl: '/albums/' + albumId,
        returnLabel: 'Volver al álbum'
    });
}

router.post('/albums/:id/delete', async (req, res) => {
    const album = await deleteAlbum(req.params.id);
    if (!album) return showMissingAlbum(res);

    const messages = ['El álbum y sus reseñas se han eliminado correctamente.'];
    try {
        await removeCover(album.cover_image);
    } catch (error) {
        console.error(error);
        messages.push('No se pudo eliminar el archivo de la portada.');
    }
    res.render('confirmation', {
        pageTitle: 'Álbum eliminado',
        messages: messages,
        returnUrl: '/',
        returnLabel: 'Volver al catálogo'
    });
});

router.get('/new-element', (req, res) => {
    showAlbumForm(res);
});

router.get('/albums/:id/edit', async (req, res) => {
    const album = await getAlbum(req.params.id);
    if (!album) return showMissingAlbum(res);
    showAlbumForm(res, album);
});

function showAlbumForm(res, album = { format: 'vinyl' }) {
    const isEditing = Boolean(album._id);
    const albumFormats = [
        { value: 'lp', label: 'LP' },
        { value: 'vinyl', label: 'Vinilo' },
        { value: 'digital', label: 'Digital' },
        { value: 'cd', label: 'CD' }
    ];
    for (const format of albumFormats) format.isSelected = format.value === album.format;
    res.render('new-element', {
        rules: albumRules, album: album, albumFormats: albumFormats,
        isEditing: isEditing,
        pageTitle: isEditing ? 'Editar álbum' : 'Añadir un nuevo álbum',
        formAction: isEditing ? '/albums/' + album._id + '/edit' : '/albums',
        cancelUrl: isEditing ? '/albums/' + album._id : '/',
        currentCoverUrl: isEditing ? '/uploads/' + encodeURIComponent(album.cover_image) : ''
    });
}

router.post('/albums', receiveCover, saveAlbum, handleCoverError);
router.post('/albums/:id/edit', receiveCover, saveAlbum, handleCoverError);

async function saveAlbum(req, res) {
    const isEditing = Boolean(req.params.id);
    const previousAlbum = isEditing ? await getAlbum(req.params.id) : null;
    if (isEditing && !previousAlbum) return showMissingAlbum(res);
    const { album, errors } = await validateAlbumFields(req.body, isEditing ? req.params.id : '');
    const extension = coverExtension(req.file);
    if (!req.file && !isEditing) {
        errors.push('La portada es obligatoria.');
    } else if (req.file && !extension) {
        errors.push('La portada debe ser una imagen PNG, JPEG, GIF o WebP.');
    }
    if (errors.length > 0) return showAlbumErrors(req, res, errors);

    const filename = req.file ? await saveCover(req.file, extension) : '';
    if (filename) album.cover_image = filename;
    let id = req.params.id;
    let updated = true;
    try {
        if (isEditing) {
            updated = await updateAlbum(id, album, previousAlbum.cover_image);
        } else {
            album.reviews = [];
            id = await addAlbum(album);
        }
    } catch (error) {
        if (filename) await removeCover(filename);
        if (error.code === 11000) {
            return showAlbumErrors(req, res, ['Ya existe un álbum con ese título.']);
        }
        throw error;
    }
    if (!updated) {
        if (filename) await removeCover(filename);
        return showAlbumErrors(req, res, ['El álbum ha cambiado o ya no existe. Vuelve a abrir el formulario.'], 409);
    }
    const messages = [isEditing
        ? 'Los cambios del álbum se han guardado correctamente.'
        : 'El álbum se ha añadido al catálogo correctamente.'];
    if (isEditing && filename) {
        try {
            await removeCover(previousAlbum.cover_image);
        } catch (error) {
            console.error(error);
            messages.push('La portada nueva está guardada, pero no se pudo eliminar el archivo anterior.');
        }
    }
    res.status(isEditing ? 200 : 201).render('confirmation', {
        pageTitle: isEditing ? 'Álbum actualizado' : 'Álbum creado',
        messages: messages,
        returnUrl: '/albums/' + id,
        returnLabel: 'Ver álbum'
    });
}

function showAlbumErrors(req, res, messages, status = 400) {
    return res.status(status).render('error', {
        pageTitle: 'No se pudo guardar el álbum', messages: messages,
        returnUrl: req.params.id ? '/albums/' + encodeURIComponent(req.params.id) + '/edit' : '/new-element',
        returnLabel: 'Volver al formulario'
    });
}

function showMissingAlbum(res) {
    return res.status(404).render('error', {
        pageTitle: 'Álbum no encontrado',
        messages: ['El identificador no es válido o el álbum ya no existe.'],
        returnUrl: '/', returnLabel: 'Volver al catálogo'
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
