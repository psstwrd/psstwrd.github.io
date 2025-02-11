// Configuration
const WORD_LISTS = {
    adjectives: ["Quick", "Bright", "Happy", "Small", "Loud", "Clever"],
    nouns: ["Fox", "Cloud", "Tree", "Moon", "Fish", "Dog"],
    verbs: ["Run", "Jump", "Eat", "Sing", "Play"],
    adverbs: ["Fast", "High", "Well", "Hard"]
};

const SUBSTITUTIONS = {
    'a': '@', 'e': '3', 'i': '!', 'o': '0',
    's': '$', 't': '7', 'l': '1', 'b': '8'
};

const SYMBOLS = "!@#$%^&*";

// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const passwordField = document.getElementById('password');

// Event Listeners
generateBtn.addEventListener('click', generateAndDisplay);
copyBtn.addEventListener('click', copyToClipboard);

// Core Logic (Same as previous JavaScript code)
// [Include all the generatePassword, substitutePhrase, 
// buildPassword, validatePassword functions here]

// Helper Functions
function generateAndDisplay() {
    const password = generatePassword();
    passwordField.value = password;
}

function copyToClipboard() {
    passwordField.select();
    document.execCommand('copy');
    alert('Password copied to clipboard!');
}

// Initial Generation
generateAndDisplay();