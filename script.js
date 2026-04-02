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

        autoToggle.checked = autoConvertEnabled ? true : false; 
    }
    
    // Toggle auto conversion
    autoToggle.addEventListener('change', () => {
        autoConvertEnabled = autoToggle.checked;
        updateToggleLabel();
    });
    
    // NEW: Keyboard shortcut - Ctrl + K to toggle Auto Kannada
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault(); // FIXME Prevent browser default (e.g. find in some browsers)
            
            // Toggle the checkbox and state
            autoToggle.checked = !autoToggle.checked;
            autoConvertEnabled = autoToggle.checked;
            updateToggleLabel();
            
            // FIXME (should this be in the css file somehow?) Optional: visual feedback (brief flash on toggle label)
            toggleLabel.style.transition = 'transform 0.1s';
            toggleLabel.style.transform = 'scale(1.15)';
            setTimeout(() => {
                toggleLabel.style.transform = 'scale(1)';
            }, 150);
        }
    });
    
    // Core conversion: happens ONLY on SPACE key
    editor.addEventListener('keyup', (e) => {
        if (!autoConvertEnabled) return;
        if (e.key !== ' ') return;
        
        const fullText = editor.value;
        const cursorPosition = editor.selectionStart; 
        const suffixText = (fullText.length == cursorPosition) ? " " : fullText.slice(cursorPosition-1); 
        let word = "";
        
        for (let i=cursorPosition-2; i>=0; i--) {
            if (fullText[i] == ' ' || fullText[i] == '\n' || fullText[i] == '\t') {
                break; 
            } else {
                word += fullText[i]; 
            }
        }
        const prefixText = fullText.slice(0, Math.max(0, cursorPosition-word.length-1)); 
        word = word.split('').reverse().join(''); 

        // console.log(`prefix: |${prefixText}|`); 
        // console.log(`word: |${word}|`); 
        // console.log(`suffix: |${suffixText}|`); 

        const convertedWord = transliterateToKannada(word); 

        // console.log(`word: ${word}; converted word: ${convertedWord}`);  

        const newCursorPosition = prefixText.length + convertedWord.length + 1; 
        const newText = prefixText + convertedWord + suffixText;  
        
        editor.value = newText; 
        editor.selectionStart = newCursorPosition; 
        editor.selectionEnd = newCursorPosition; 
    });

    // Initial label update
    updateToggleLabel();
});