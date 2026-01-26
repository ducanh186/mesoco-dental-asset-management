import React, { useState, useRef, useEffect } from 'react';
import { useI18n, languages } from '../../i18n';

/**
 * LanguageSwitcher - Toggle between available languages
 * Compact version for Topbar
 */
const LanguageSwitcher = ({ variant = 'compact' }) => {
    const { locale, setLocale } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLanguage = languages.find(l => l.code === locale) || languages[0];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (langCode) => {
        setLocale(langCode);
        setIsOpen(false);
    };

    if (variant === 'compact') {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-surface-muted transition-colors text-sm"
                    title="Change language"
                >
                    <span className="text-base">{currentLanguage.flag}</span>
                    <span className="hidden sm:inline text-text-muted font-medium">
                        {currentLanguage.code.toUpperCase()}
                    </span>
                    <svg 
                        className={`w-3 h-3 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleSelect(lang.code)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover transition-colors ${
                                    lang.code === locale ? 'bg-primary/5 text-primary' : 'text-text'
                                }`}
                            >
                                <span className="text-base">{lang.flag}</span>
                                <span>{lang.name}</span>
                                {lang.code === locale && (
                                    <svg className="w-4 h-4 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Full variant for Settings page
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-text-muted">
                {locale === 'vi' ? 'Ngôn ngữ' : 'Language'}
            </label>
            <div className="flex gap-2">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setLocale(lang.code)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            lang.code === locale 
                                ? 'border-primary bg-primary/5 text-primary' 
                                : 'border-border hover:border-primary/50 text-text'
                        }`}
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
