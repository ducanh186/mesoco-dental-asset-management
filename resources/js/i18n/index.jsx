/**
 * i18n - Internationalization System
 * Supports: English (en), Vietnamese (vi)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from './locales/en';
import vi from './locales/vi';

const locales = { en, vi };

const STORAGE_KEY = 'mesoco_language';
const DEFAULT_LOCALE = 'vi'; // Default to Vietnamese

// ============================================================================
// i18n Context
// ============================================================================
const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
    const [locale, setLocaleState] = useState(() => {
        // Try to get from localStorage, fallback to default
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEY) || DEFAULT_LOCALE;
        }
        return DEFAULT_LOCALE;
    });

    const setLocale = useCallback((newLocale) => {
        if (locales[newLocale]) {
            setLocaleState(newLocale);
            localStorage.setItem(STORAGE_KEY, newLocale);
            document.documentElement.lang = newLocale;
        }
    }, []);

    // Set html lang attribute on mount
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    /**
     * Translate function
     * @param {string} key - Dot notation key (e.g., 'common.save')
     * @param {object} params - Interpolation params (e.g., { name: 'John' })
     * @returns {string} Translated string
     */
    const t = useCallback((key, params = {}) => {
        const keys = key.split('.');
        let value = locales[locale];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // Fallback to English if key not found
                value = locales.en;
                for (const k2 of keys) {
                    if (value && typeof value === 'object' && k2 in value) {
                        value = value[k2];
                    } else {
                        console.warn(`i18n: Missing translation for key "${key}"`);
                        return key; // Return key if not found
                    }
                }
                break;
            }
        }

        // Handle string interpolation: "Hello, {name}!" with { name: 'John' }
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : `{${paramKey}}`;
            });
        }

        return typeof value === 'string' ? value : key;
    }, [locale]);

    const value = {
        locale,
        setLocale,
        t,
        locales: Object.keys(locales),
        isVietnamese: locale === 'vi',
        isEnglish: locale === 'en',
    };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

// ============================================================================
// Hooks
// ============================================================================
export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};

export const useTranslation = () => {
    const { t, locale } = useI18n();
    return { t, locale };
};

// ============================================================================
// Language Metadata
// ============================================================================
export const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default I18nContext;
