export function defaultModel(req, res, next) {
    res.locals.siteName = "MUSIX";
    next();
}
