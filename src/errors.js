let lastError = null;

// Store error details in memory and redirect cleanly to /error without query params.
export function redirectToError(res, errorData) {
    lastError = errorData;
    return res.redirect('/error');
}

// Retrieve the most recent error details for the /error route.
export function getLastError() {
    return lastError;
}

// Log technical details and redirect to the shared error page.
export function handleError(error, req, res, next) {
    // Let Express finish handling failures if the response has already started.
    if (res.headersSent) return next(error);
    console.error(error);
    const status = error.status === 400 || error.status === 413 ? error.status : 500;
    let message = 'Se ha producido un error en el servidor. Inténtalo de nuevo.';
    if (status === 400) message = 'Los datos enviados no tienen un formato válido.';
    if (status === 413) message = 'Los datos enviados superan el tamaño permitido.';
    redirectToError(res, {
        pageTitle: 'No se pudo completar la operación',
        messages: [message],
        returnUrl: '/',
        returnLabel: 'Volver al catálogo'
    });
}