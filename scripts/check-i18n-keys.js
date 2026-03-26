#!/usr/bin/env node
/**
 * check-i18n-keys.js
 * Validate i18n key parity between EN (source-of-truth) and other locales
 * 
 * Usage: node scripts/check-i18n-keys.js
 * Exit code 0 = all keys match, 1 = mismatch found
 */

import { readFileSync, readdirSync } from 'fs';
import { dirname, join, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '..', 'resources', 'js', 'i18n', 'locales');
const SOURCE_LOCALE = 'en';

/**
 * Recursively extract all keys from an object using dot notation
 * @param {object} obj - The object to extract keys from
 * @param {string} prefix - Current key prefix
 * @returns {string[]} Array of dot-notation keys
 */
function extractKeys(obj, prefix = '') {
    const keys = [];
    
    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            keys.push(...extractKeys(value, fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    
    return keys.sort();
}

/**
 * Parse a JavaScript object literal from a file
 * Uses a simple regex-based extraction to get the default export
 */
function parseLocaleFile(filePath) {
    const content = readFileSync(filePath, 'utf-8');
    
    // Create a module context to evaluate the export
    // Note: This is safe because we control the locale files
    const moduleCode = content
        .replace(/export\s+default\s+/, 'module.exports = ')
        .replace(/^\/\*[\s\S]*?\*\/\s*/gm, '') // Remove block comments
        .replace(/^\s*\/\/.*$/gm, ''); // Remove line comments
    
    // Use Function constructor to safely evaluate
    try {
        const fn = new Function('module', 'exports', moduleCode + '\nreturn module.exports;');
        const module = { exports: {} };
        return fn(module, module.exports);
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
        process.exit(1);
    }
}

/**
 * Main validation function
 */
function validateLocales() {
    console.log('🌐 Checking i18n key parity...\n');
    
    // Get all locale files
    const files = readdirSync(LOCALES_DIR).filter(f => f.endsWith('.js'));
    const sourceFile = `${SOURCE_LOCALE}.js`;
    
    if (!files.includes(sourceFile)) {
        console.error(`❌ Source locale file "${sourceFile}" not found!`);
        process.exit(1);
    }
    
    // Parse source locale (EN is source-of-truth)
    const sourcePath = join(LOCALES_DIR, sourceFile);
    const sourceObj = parseLocaleFile(sourcePath);
    const sourceKeys = extractKeys(sourceObj);
    
    console.log(`📄 Source: ${sourceFile} (${sourceKeys.length} keys)`);
    
    let hasErrors = false;
    const results = [];
    
    // Check each non-source locale
    for (const file of files) {
        if (file === sourceFile) continue;
        
        const localePath = join(LOCALES_DIR, file);
        const localeObj = parseLocaleFile(localePath);
        const localeKeys = extractKeys(localeObj);
        const localeName = basename(file, '.js').toUpperCase();
        
        // Find missing keys (in source but not in locale)
        const missingKeys = sourceKeys.filter(k => !localeKeys.includes(k));
        
        // Find extra keys (in locale but not in source)
        const extraKeys = localeKeys.filter(k => !sourceKeys.includes(k));
        
        results.push({
            file,
            localeName,
            totalKeys: localeKeys.length,
            missingKeys,
            extraKeys,
        });
        
        if (missingKeys.length > 0 || extraKeys.length > 0) {
            hasErrors = true;
        }
    }
    
    // Print results
    console.log('\n' + '─'.repeat(60) + '\n');
    
    for (const result of results) {
        const status = result.missingKeys.length === 0 && result.extraKeys.length === 0;
        const icon = status ? '✅' : '❌';
        
        console.log(`${icon} ${result.file} (${result.totalKeys} keys)`);
        
        if (result.missingKeys.length > 0) {
            console.log(`   ⚠️  Missing ${result.missingKeys.length} key(s) from EN:`);
            result.missingKeys.slice(0, 10).forEach(k => console.log(`      - ${k}`));
            if (result.missingKeys.length > 10) {
                console.log(`      ... and ${result.missingKeys.length - 10} more`);
            }
        }
        
        if (result.extraKeys.length > 0) {
            console.log(`   ⚠️  Extra ${result.extraKeys.length} key(s) not in EN:`);
            result.extraKeys.slice(0, 10).forEach(k => console.log(`      + ${k}`));
            if (result.extraKeys.length > 10) {
                console.log(`      ... and ${result.extraKeys.length - 10} more`);
            }
        }
        
        console.log('');
    }
    
    // Summary
    console.log('─'.repeat(60));
    
    if (hasErrors) {
        console.log('\n❌ Key parity check FAILED!');
        console.log('   EN is the source-of-truth. Please sync other locales.\n');
        console.log('📝 To add new keys:');
        console.log('   1. Add to resources/js/i18n/locales/en.js first');
        console.log('   2. Add matching keys to resources/js/i18n/locales/vi.js');
        console.log('   3. Run: npm run check:i18n\n');
        process.exit(1);
    } else {
        console.log('\n✅ All locale files are in sync!');
        console.log(`   ${sourceKeys.length} keys verified across ${results.length + 1} locale(s)\n`);
        process.exit(0);
    }
}

// Run validation
validateLocales();
