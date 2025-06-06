// middleware/languageMiddleware.js
// import i18nService from '../services/i18nService.js'; // Ce service doit être créé

const languageMiddleware = (req, res, next) => {
    let locale = req.query.lang;

    // Pour que cela fonctionne, i18nService doit être défini et avoir les méthodes/props attendues.
    if (typeof i18nService !== 'undefined' && i18nService) {
        if (!locale) {
            locale = req.acceptsLanguages(i18nService.getSupportedLocales());
        }
        if (!locale) {
            locale = i18nService.defaultLocale;
        }
        req.t = (key) => i18nService.translate(key, locale);
    } else {
        // Fallback si i18nService n'est pas disponible
        locale = 'fr'; // Langue par défaut
        req.t = (key) => key; // Fonction de traduction factice
    }
    req.locale = locale;
    next();
};

export { languageMiddleware }; // Export nommé
// ou export default languageMiddleware; // si vous préférez l'importer par défaut