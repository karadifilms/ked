const isDebugMode = true; 

const consonants = {
  'k':'ಕ', 'kh':'ಖ', 'g':'ಗ', 'gh':'ಘ', 'ng':'ಙ', 
  'ch':'ಚ', 'Ch':'ಛ', 'j':'ಜ', 'jh':'ಝ', 'ny':'ಞ', 
  'T':'ಟ', 'Th':'ಠ', 'D':'ಡ', 'Dh':'ಢ', 'N':'ಣ', 
  't':'ತ', 'th':'ಥ', 'd':'ದ', 'dh':'ಧ', 'n':'ನ',
  'p':'ಪ', 'ph':'ಫ', 'b':'ಬ', 'bh':'ಭ', 'm':'ಮ', 
  'y':'ಯ', 'r':'ರ', 'l':'ಲ', 'v':'ವ', 'sh':'ಶ', 'Sh':'ಷ', 's':'ಸ', 'h':'ಹ', 'L':'ಳ' 
};

const swaragalu = {
    'a': {standalone:'ಅ',matra:''}, 
    'aa': {standalone:'ಆ', matra:'ಾ'},
    'i': {standalone:'ಇ', matra:'ಿ'}, 
    'ii': {standalone:'ಈ', matra:'ೀ'},
    'u': {standalone:'ಉ', matra:'ು'}, 
    'uu': {standalone:'ಊ', matra:'ೂ'},
    'R': {standalone:'ಋ', matra:'ೃ'},
    'e': {standalone:'ಎ', matra:'ೆ'}, 
    'ee': {standalone:'ಏ', matra:'ೇ'},
    'ai': {standalone:'ಐ', matra:'ೈ'},
    'o': {standalone:'ಒ', matra:'ೊ'}, 
    'oo': {standalone:'ಓ', matra:'ೋ'}, 
    'au': {standalone:'ಔ', matra:'ೌ'}, 
};

const yogavahas = {
    'M': {standalone:'ಅಂ', matra:'ಂ'}, 
    'Ha': {standalone:'ಅಃ', matra:'ಃ'}
}

const vowels = {
    ...swaragalu,
    ...yogavahas
};

const virama = {
    '\\': '್'
};

const VIRAMA_LETTER_EN = Object.keys(virama)[0]; 
const VIRAMA_LETTER_KN = virama[VIRAMA_LETTER_EN]; 

const ZERO_WIDTH_NON_JOINER = '\u200C';

if (isDebugMode) {console.assert(Object.keys(virama).length == 1, `virama length has to be 1`);}

function transliterateToKannada(word) {
    const wordLength = word.length; 
    let prevLetterType = "virama"; // consonant, vowel, virama
    let convertedWord = ""; 

    let pos = 0; 
    while (pos < wordLength) {
        const twoLetters = word.slice(pos, pos+2); 
        const singleLetter = word.slice(pos, pos+1); 

        if (isDebugMode) console.log(`converted word so far: ${convertedWord}`)

        for (letter of [twoLetters, singleLetter]) {
            // vowel  
            if (letter in vowels) {
                if (isDebugMode) console.log(`letter: ${letter} is a vowel`);

                // case 01: last letter was a consonant 
                //          then we use the matra next to the 
                //          previous consonant. 
                if (prevLetterType == "consonant") {
                    convertedWord += vowels[letter].matra; 
                    pos += letter.length; 
                    prevLetterType = "vowel";
                    break; 
                }

                // case 02: last letter was a vowel, if current is a yogavaha
                //          then use matra, else use standalone 
                if (prevLetterType == "vowel") { 
                    console.log(`${letter in yogavahas}`); 
                    convertedWord += (letter in yogavahas) ? vowels[letter].matra : vowels[letter].standalone; 
                    pos += letter.length; 
                    prevLetterType = "vowel";
                    break; 
                }

                // case 03: last letter was a virama, then use standalone 
                if (prevLetterType == "virama") { 
                    convertedWord += vowels[letter].standalone; 
                    pos += letter.length; 
                    prevLetterType = "vowel";
                    break; 
                }
            }

            // consonant 
            if (letter in consonants) {
                if (isDebugMode) console.log(`letter: ${letter} is a consonant`);
                // case 01: if previous letter was a consonant, we are at the start of a
                //          ottu akshara, so add a virama 
                if (prevLetterType == "consonant") {
                    convertedWord += VIRAMA_LETTER_KN; 
                }

                // add the current consonant as-is. 
                convertedWord += consonants[letter]; 
                pos += letter.length; 
                prevLetterType = "consonant";

                // if this is the last letter, then add a virama at the end. 
                if (pos == wordLength) {
                    convertedWord += VIRAMA_LETTER_KN; 
                    prevLetterType = "virama";
                }

                break; 
            }

            // virama 
            if (letter in virama) {
                if (isDebugMode) console.log(`letter: ${letter} is a virama`);
                // case 01: the only valid case is if previous letter was a consonant
                //          still, we just behave and use it as-is. 
                if (prevLetterType == "consonant") {
                    convertedWord += virama[letter] + ZERO_WIDTH_NON_JOINER; 
                    pos += letter.length;
                    prevLetterType = "virama";
                    break; 
                }
            }

            // if no matches with virama, consonant or vowel, retain it as-is. 
            if (letter.length == 1) {
                convertedWord += letter; 
                pos += letter.length;
                prevLetterType = "virama";
                break;
            }
        }
    }
    return convertedWord; 
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

        if (isDebugMode) {
            console.log(`prefix: |${prefixText}|`); 
            console.log(`word: |${word}|`); 
            console.log(`suffix: |${suffixText}|`); 
        }

        let convertedWord = ""; 
        if (word != "") {
            convertedWord = transliterateToKannada(word); 
            if (isDebugMode) console.log(`word: ${word}; converted word: ${convertedWord}`);  
        }

        const newCursorPosition = prefixText.length + convertedWord.length + 1; 
        const newText = prefixText + convertedWord + suffixText;  
        
        editor.value = newText; 
        editor.selectionStart = newCursorPosition; 
        editor.selectionEnd = newCursorPosition; 
    });

    // Initial label update
    updateToggleLabel();
});