// Configuration - EXPAND THESE IN PRODUCTION
const WORD_LISTS = {
    adjectives: ["Quick","Bright","Happy","Clever","Loud","Simple","Brave","Calm","Red","Big"],
    nouns: ["Fox","Cloud","Tree","Moon","Fish","Dog","Star","Book","Car","House"],
    verbs: ["Run","Jump","Eat","Read","Play","Walk","Sing","Draw","Drive","Build"],
    adverbs: ["Fast","Well","High","Late","Near","Hard","Slow","Soon","Quiet","Close"]
};

const SUBSTITUTIONS = {
    'a': '@', 'e': '3', 'i': '!', 'o': '0',
    's': '$', 't': '7', 'l': '1', 'b': '8'
};
const SYMBOLS = "!@#$%^&*";

// Debugging System
const debug = {
    log: (...args) => console.log('[DEBUG]', ...args),
    error: (msg) => {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = msg;
        errorDiv.classList.add('visible');
        console.error(msg);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const passwordField = document.getElementById('password');

    if (!generateBtn || !copyBtn || !passwordField) {
        debug.error("Critical elements missing from DOM!");
        return;
    }

    generateBtn.addEventListener('click', generateAndDisplay);
    copyBtn.addEventListener('click', copyToClipboard);
    generateAndDisplay(); // Initial generation
});

// Main Generation Flow
function generateAndDisplay() {
    try {
        debug.log("=== Generation Started ===");
        const password = generatePassword();
        debug.log("Final Password:", password);
        
        if(password) {
            document.getElementById('password').value = password;
            document.getElementById('error').classList.remove('visible');
        } else {
            debug.error("No password generated after 100 attempts");
        }
    } catch (error) {
        debug.error(`Fatal Error: ${error.message}`);
    }
}

// Core Password Generation
function generatePassword() {
    // Input Validation
    const minLength = Math.max(8, parseInt(document.getElementById('minLength').value) || 12);
    const maxLength = Math.min(30, parseInt(document.getElementById('maxLength').value) || 16);
    const digitsAtEnd = Math.min(6, Math.max(0, parseInt(document.getElementById('digitsAtEnd').value) || 0));
    const forceDigitsEnd = document.getElementById('forceDigitsEnd').checked;

    debug.log(`Config: ${minLength}-${maxLength} chars, ${digitsAtEnd} end digits, force=${forceDigitsEnd}`);

    // Substitution Rules
    const subMap = {...SUBSTITUTIONS};
    if(forceDigitsEnd) {
        Object.keys(subMap).forEach(k => {
            if(!isNaN(subMap[k])) delete subMap[k];
        });
    }

    for(let attempt = 1; attempt <= 100; attempt++) {
        const targetLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        debug.log(`Attempt ${attempt}: Target length ${targetLength}`);
        
        const phrase = generatePhrase(targetLength, digitsAtEnd);
        if(!phrase) {
            debug.log("Phrase generation failed");
            continue;
        }

        const { substituted, subs } = substitutePhrase(phrase, subMap);
        debug.log(`Base: ${substituted} (digits: ${subs.hasDigit}, symbols: ${subs.hasSymbol})`);

        const password = buildPassword(substituted, subs, targetLength, digitsAtEnd, forceDigitsEnd);
        debug.log(`Built password: ${password}`);

        if(validatePassword(password, minLength, maxLength, digitsAtEnd, forceDigitsEnd)) {
            debug.log("Valid password found!");
            return password;
        }
    }
    return null;
}

// Phrase Generation
function generatePhrase(targetLength, digitsAtEnd) {
    const templates = [
        { types: ["adjective", "noun"], minWords: 2 },
        { types: ["adjective", "noun", "verb"], minWords: 3 },
        { types: ["noun", "verb", "adverb"], minWords: 3 }
    ];

    for(const template of templates) {
        let words = [];
        let currentLength = 0;
        const maxBaseLength = targetLength - digitsAtEnd - 2;

        for(const wordType of template.types) {
            const key = `${wordType}s`;
            if(!WORD_LISTS[key] || WORD_LISTS[key].length === 0) {
                debug.error(`Missing word list for ${key}`);
                return null;
            }

            const word = WORD_LISTS[key][Math.floor(Math.random() * WORD_LISTS[key].length)].toLowerCase();
            if(currentLength + word.length > maxBaseLength) break;
            
            words.push(word);
            currentLength += word.length;
        }

        if(words.length >= template.minWords && currentLength >= 8) {
            debug.log(`Generated phrase: ${words.join(' ')} (${currentLength} chars)`);
            return words;
        }
    }
    return null;
}

// Password Construction
function buildPassword(base, subs, targetLength, digitsAtEnd, forceDigitsEnd) {
    let components = [];
    
    // Add required digits
    if(digitsAtEnd > 0) {
        components.push(Array.from({length: digitsAtEnd}, () => Math.floor(Math.random() * 10)).join(''));
    } else if(!subs.hasDigit && !forceDigitsEnd) {
        components.push(Math.floor(Math.random() * 10));
    }

    // Add required symbols
    if(!subs.hasSymbol && !forceDigitsEnd) {
        components.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }

    let password = base + components.join('');
    
    // Ensure length compliance
    const overflow = password.length - targetLength;
    if(overflow > 0) {
        password = base.slice(0, base.length - overflow) + components.join('');
    }

    return password;
}

// Validation System
function validatePassword(password, minLen, maxLen, digitsAtEnd, forceDigitsEnd) {
    if(!password) return false;
    
    const requirements = {
        length: password.length >= minLen && password.length <= maxLen,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        digit: /\d/.test(password),
        symbol: /[!@#$%^&*]/.test(password)
    };

    // Special validation for forced digits
    if(forceDigitsEnd && digitsAtEnd > 0) {
        const prefix = password.slice(0, -digitsAtEnd);
        if(/\d/.test(prefix)) return false;
    }

    // Check trailing digits
    if(digitsAtEnd > 0) {
        const suffix = password.slice(-digitsAtEnd);
        if((suffix.match(/\d/g) || []).length < digitsAtEnd) return false;
    }

    return Object.values(requirements).every(v => v);
}

// Clipboard System
function copyToClipboard() {
    const passwordField = document.getElementById('password');
    try {
        passwordField.select();
        document.execCommand('copy');
        debug.log("Password copied to clipboard");
    } catch (error) {
        debug.error("Clipboard copy failed:", error);
    }
}