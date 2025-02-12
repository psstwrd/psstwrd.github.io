// Configuration - EXPAND THESE WORD LISTS IN PRODUCTION
const WORD_LISTS = {
    adjectives: ["Quick", "Bright", "Happy", "Clever", "Loud", "Simple", "Brave", "Calm"],
    nouns: ["Fox", "Cloud", "Tree", "Moon", "Fish", "Dog", "Star", "Book"],
    verbs: ["Run", "Jump", "Eat", "Read", "Play", "Walk", "Sing", "Draw"],
    adverbs: ["Fast", "Well", "High", "Late", "Near", "Hard", "Slow", "Soon"]
};

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const passwordField = document.getElementById('password');

document.addEventListener('DOMContentLoaded', () => {
    generateBtn.addEventListener('click', generateAndDisplay);
    generateAndDisplay(); // Initial generation
});

function generateAndDisplay() {
    try {
        const password = generatePassword();
        passwordField.value = password || "Error generating password";
    } catch (error) {
        console.error("Generation error:", error);
        passwordField.value = "Generation failed - check console";
    }
}

// ================== CORE LOGIC ================== //
function generatePassword() {
    const minLength = parseInt(document.getElementById('minLength').value) || 12;
    const maxLength = parseInt(document.getElementById('maxLength').value) || 16;
    const digitsAtEnd = parseInt(document.getElementById('digitsAtEnd').value) || 0;
    const forceDigitsEnd = document.getElementById('forceDigitsEnd').checked;

    // Modified substitution map based on user choice
    const subMap = {...SUBSTITUTIONS};
    if (forceDigitsEnd) {
        Object.keys(subMap).forEach(char => {
            if (!isNaN(subMap[char])) delete subMap[char];
        });
    }

    for (let attempt = 0; attempt < 100; attempt++) {
        const targetLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        const phrase = generatePhrase(targetLength, digitsAtEnd);
        if (!phrase) continue;

        const { substituted, subs } = substitutePhrase(phrase, subMap);
        const password = buildPassword(substituted, subs, targetLength, digitsAtEnd, forceDigitsEnd);
        
        if (validatePassword(password, minLength, maxLength, digitsAtEnd, forceDigitsEnd)) {
            return password;
        }
    }
    return "Failed to generate after 100 attempts";
}

// ================== HELPER FUNCTIONS ================== //
function generatePhrase(targetLength, digitsAtEnd) {
    const templates = [
        ["adjective", "noun"],
        ["adjective", "noun", "verb"],
        ["noun", "verb", "adverb"],
        ["adjective", "noun", "verb", "adverb"]
    ];

    // Try different templates until we find a suitable one
    for (const template of templates) {
        let words = [];
        let currentLength = 0;
        const maxBaseLength = targetLength - digitsAtEnd - 2;

        for (const wordType of template) {
            const wordList = WORD_LISTS[wordType + "s"];
            if (!wordList || wordList.length === 0) continue;

            const word = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
            if (currentLength + word.length > maxBaseLength) break;
            
            words.push(word);
            currentLength += word.length;
        }

        if (words.length > 0 && currentLength >= Math.max(4, 0.5 * maxBaseLength)) {
            return words;
        }
    }
    return null;
}

function substitutePhrase(words, subMap) {
    let hasDigit = false;
    let hasSymbol = false;
    let anySubs = false;

    const substituted = words.map(word => {
        let modified = word.toLowerCase().split('');
        const possibleSubs = [];

        // Identify substitution points
        modified.forEach((char, index) => {
            if (subMap[char]) {
                possibleSubs.push(index);
            }
        });

        // Perform substitutions
        if (possibleSubs.length > 0) {
            anySubs = true;
            const numSubs = Math.min(
                Math.floor(Math.random() * possibleSubs.length) + 1,
                possibleSubs.length
            );
            const selected = possibleSubs.sort(() => 0.5 - Math.random()).slice(0, numSubs);

            selected.forEach(index => {
                const replacement = subMap[modified[index]];
                modified[index] = replacement;
                if (!isNaN(replacement)) hasDigit = true;
                if (isNaN(replacement)) hasSymbol = true;
            });
        }

        // Capitalize first letter
        modified[0] = modified[0].toUpperCase();
        return modified.join('');
    });

    return {
        substituted: substituted.join(''),
        subs: { hasDigit, hasSymbol, anySubs }
    };
}