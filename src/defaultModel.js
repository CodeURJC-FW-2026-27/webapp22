export function defaultModel(req, res, next) {
    res.locals.username = "Juan";
    next();
}