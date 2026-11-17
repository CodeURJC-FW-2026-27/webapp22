import express from 'express';
import { countAlbums, getAlbumsPage } from './albums.js';

const router = express.Router();
export default router;

router.get('/', async (req, res) => {
    const pageSize = 6;
    const totalAlbums = await countAlbums();
    const totalPages = Math.max(1, Math.ceil(totalAlbums / pageSize));
    let currentPage = 1;

    if (typeof req.query.page === 'string') {
        const requestedPage = Number(req.query.page);
        if (Number.isSafeInteger(requestedPage) && requestedPage > 0) {
            currentPage = Math.min(requestedPage, totalPages);
        }
    }

    const albums = await getAlbumsPage(currentPage, pageSize);
    for (const album of albums) {
        album.displayPrice = album.record_price.toFixed(2);
        album.coverUrl = '/uploads/' + encodeURIComponent(album.cover_image);
    }

    const pages = [];
    for (let number = 1; number <= totalPages; number++) {
        pages.push({
            number: number,
            url: '/?page=' + number,
            isCurrent: number === currentPage
        });
    }

    res.render('index', {
        albums: albums,
        pages: pages,
        showPagination: totalPages > 1,
        hasPrevious: currentPage > 1,
        previousUrl: '/?page=' + (currentPage - 1),
        hasNext: currentPage < totalPages,
        nextUrl: '/?page=' + (currentPage + 1)
    });
});

router.get('/detail', (req, res) => {
    res.render('detail');
});

router.get('/new-element', (req, res) => {
    res.render('new-element');
});
