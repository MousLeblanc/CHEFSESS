const i18nService = require('../services/i18nService');

const languageMiddleware = (req, res, next) => {
    // Check language from query parameter
    let locale = req.query.lang;

    // If not in query, check headers
    if (!locale) {
        locale = req.acceptsLanguages(i18nService.getSupportedLocales());
    }

    // If still no locale, use default
    if (!locale) {
        locale = i18nService.defaultLocale;
    }

    // Attach locale and translation function to request
    req.locale = locale;
    req.t = (key) => i18nService.translate(key, locale);

    next();
};

module.exports = languageMiddleware; 