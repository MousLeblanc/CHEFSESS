const fs = require('fs').promises;
const path = require('path');

class I18nService {
    constructor() {
        this.translations = {};
        this.defaultLocale = 'fr';
        this.supportedLocales = ['fr', 'en'];
    }

    async loadTranslations() {
        for (const locale of this.supportedLocales) {
            const filePath = path.join(__dirname, '..', 'locales', `${locale}.json`);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                this.translations[locale] = JSON.parse(content);
            } catch (error) {
                console.error(`Error loading translations for ${locale}:`, error);
                this.translations[locale] = {};
            }
        }
    }

    translate(key, locale = this.defaultLocale) {
        const usedLocale = this.supportedLocales.includes(locale) ? locale : this.defaultLocale;
        const keys = key.split('.');
        let translation = this.translations[usedLocale];

        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return key; // Return the key if translation is not found
            }
        }

        return translation;
    }

    getSupportedLocales() {
        return this.supportedLocales;
    }

    setDefaultLocale(locale) {
        if (this.supportedLocales.includes(locale)) {
            this.defaultLocale = locale;
        }
    }
}

module.exports = new I18nService(); 