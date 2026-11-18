export function handleError(error, req, res, next) {
    if (res.headersSent) return next(error);
    console.error(error);
    const status = error.status === 400 || error.status === 413 ? error.status : 500;
    let message = 'Se ha producido un error en el servidor. Inténtalo de nuevo.';
    if (status === 400) message = 'Los datos enviados no tienen un formato válido.';
    if (status === 413) message = 'Los datos enviados superan el tamaño permitido.';
    res.status(status).render('error', {
        pageTitle: 'No se pudo completar la operación',
        messages: [message], returnUrl: '/', returnLabel: 'Volver al catálogo'
    });
}
