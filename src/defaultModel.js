import { albumFormats } from './formats.js';

export function catalogueUrl(title, format, page = 1) {
    return '/?title=' + encodeURIComponent(title)
        + '&format=' + encodeURIComponent(format)
        + '&page=' + page;
}

export function defaultModel(req, res, next) {
    const formats = [{ value: '', label: 'Todos' }, ...albumFormats.map(format => ({ ...format }))];
    let searchTitle = '';
    let selectedFormat = '';

    if (typeof req.query.title === 'string') {
        searchTitle = req.query.title.trim();
    }
    if (typeof req.query.format === 'string') {
        for (const format of formats) {
            if (format.value === req.query.format) {
                selectedFormat = format.value;
            }
        }
    }

    for (const format of formats) {
        format.url = catalogueUrl(searchTitle, format.value);
        format.isSelected = format.value === selectedFormat;
    }

    res.locals.siteName = 'MUSIX';
    res.locals.searchTitle = searchTitle;
    res.locals.selectedFormat = selectedFormat;
    res.locals.formats = formats;
    next();
}
