// Pure JavaScript phonetic English → Kannada transliterator (self-contained, no external libraries)
const consonants = {
    'kh': 'ಖ', 'gh': 'ಘ', 'ng': 'ಙ',
    'ch': 'ಛ', 'jh': 'ಝ', 'ny': 'ಞ',
    'th': 'ಥ', 'dh': 'ಧ',
    'ph': 'ಫ', 'bh': 'ಭ',
    'sh': 'ಶ',
    'T': 'ಟ', 'Th': 'ಠ',
    'D': 'ಡ', 'Dh': 'ಢ',
    'N': 'ಣ', 'L': 'ಳ', 'S': 'ಷ',
    'k': 'ಕ', 'g': 'ಗ',
    'c': 'ಚ', 'j': 'ಜ',
    't': 'ತ', 'd': 'ದ',
    'n': 'ನ', 'p': 'ಪ', 'b': 'ಬ',
    'm': 'ಮ', 'y': 'ಯ', 'r': 'ರ',
    'l': 'ಲ', 'v': 'ವ', 's': 'ಸ', 'h': 'ಹ'
};

const standaloneVowels = {
    'a': 'ಅ', 'aa': 'ಆ',
    'i': 'ಇ', 'ii': 'ಈ',
    'u': 'ಉ', 'uu': 'ಊ',
    'e': 'ಎ', 'ee': 'ಏ',
    'ai': 'ಐ',
    'o': 'ಒ', 'oo': 'ಓ', 'au': 'ಔ'
};

const matras = {
    'a': '',
    'aa': 'ಾ',
    'i': 'ಿ', 'ii': 'ೀ',
    'u': 'ು', 'uu': 'ೂ',
    'e': 'ೆ', 'ee': 'ೇ',
    'ai': 'ೈ',
    'o': 'ೊ', 'oo': 'ೋ', 'au': 'ೌ'
};

function transliterateToKannada(input) {
    if (!input || typeof input !== 'string' || input.trim() === '') return input;
    
    let str = input.toLowerCase(); // case-insensitive for most, but we kept capital support in map
    let result = '';
    let i = 0;
    let lastWasConsonant = false;

    // Restore original case handling for retroflex (T/D/N/L/S)
    // But for simplicity we use the map as-is (capitals are already handled)
    str = input; // keep original for capital detection

    while (i < str.length) {
        let matched = false;
        
        // Try longest match first (3 → 2 → 1 chars)
        for (let len = 3; len >= 1; len--) {
            if (i + len > str.length) continue;
            const chunk = str.substring(i, i + len);
            
            // Consonant match
            if (consonants[chunk] !== undefined) {
                if (lastWasConsonant) {
                    result += '್' + consonants[chunk]; // virama + consonant (creates conjuncts like ನ್ನ, ಕ್ಕ)
                } else {
                    result += consonants[chunk];
                }
                lastWasConsonant = true;
                i += len;
                matched = true;
                break;
            }
            
            // Vowel match
            if (standaloneVowels[chunk] !== undefined) {
                if (lastWasConsonant && matras[chunk] !== undefined) {
                    result += matras[chunk];
                } else {
                    result += standaloneVowels[chunk];
                }
                lastWasConsonant = false;
                i += len;
                matched = true;
                break;
            }
        }
        
        // No phonetic match → keep original character (punctuation, numbers, spaces, etc.)
        if (!matched) {
            result += str[i];
            lastWasConsonant = false;
            i++;
        }
    }
    
    return result;
}

// Main app logic
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const autoToggle = document.getElementById('auto-toggle');
    const toggleLabel = document.getElementById('toggle-label');
    
    let autoConvertEnabled = true;
    
    function updateToggleLabel() {
        toggleLabel.textContent = autoConvertEnabled ? 'Auto Kannada ON' : 'Auto Kannada OFF';
        toggleLabel.style.color = autoConvertEnabled ? '#00c853' : '#aaa';
    }
    
    // Toggle auto conversion
    autoToggle.addEventListener('change', () => {
        autoConvertEnabled = autoToggle.checked;
        updateToggleLabel();
    });
    
    // Core conversion: happens ONLY on SPACE key
    editor.addEventListener('keyup', (e) => {
        if (!autoConvertEnabled) return;
        if (e.key !== ' ') return;
        
        const fullText = editor.value;
        const trimmed = fullText.trimEnd();
        const words = trimmed.split(/\s+/);
        
        if (words.length === 0) return;
        
        const lastWord = words[words.length - 1];
        const convertedWord = transliterateToKannada(lastWord);
        
        // Only replace if conversion actually changed something
        if (convertedWord !== lastWord) {
            words[words.length - 1] = convertedWord;
            
            let newText = words.join(' ');
            if (fullText.endsWith(' ')) newText += ' ';
            
            editor.value = newText;
            // Keep cursor at end
            editor.selectionStart = editor.selectionEnd = newText.length;
        }
    });

    // Optional: support "Enter" without breaking conversion (just in case)
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && autoConvertEnabled) {
            // No special handling needed - space logic already covers words
        }
    });
});
