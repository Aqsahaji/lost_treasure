/**
 * LOST TREASURE: CRYPTOGRAPHIC PUZZLES ENGINE
 * 1. Caesar Shift Cipher Wheel
 * 2. Nautical Semaphore / Maritime Signal Flags
 * 3. Aztec Astrological Celestial Dial
 * 4. Booby Trap & Pressure Plate Chamber
 */

class PuzzleEngine {
  constructor() {
    this.currentPuzzle = null;
    this.onPuzzleSolvedCallback = null;

    // Caesar Shift State
    this.caesarState = {
      targetShift: 3,
      currentShift: 0,
      cipherText: "WKH VHUSHQW VSLUH SRUWV WR WKH QRUWK VWDU",
      solvedMessage: "THE SERPENT SPIRE PORTS TO THE NORTH STAR"
    };

    // Nautical Flags State
    this.nauticalState = {
      targetWord: "REEF",
      selectedFlags: [null, null, null, null],
      availableLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W']
    };

    // Astrological Dial State
    this.aztecState = {
      outerRotation: 90,   // Target: 0 (Coatl at Top)
      midRotation: 180,    // Target: 0 (Eclipse at Top)
      innerRotation: 270   // Target: 0 (Eye at Top)
    };
  }

  // =========================================================================
  // 1. CAESAR SHIFT CIPHER
  // =========================================================================
  initCaesarPuzzle(containerEl, onSolved) {
    this.currentPuzzle = 'caesar';
    this.onPuzzleSolvedCallback = onSolved;

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    let outerLettersHtml = "";
    let innerLettersHtml = "";

    const radiusOuter = 125;
    const radiusInner = 80;
    const center = 150;

    alphabet.forEach((char, i) => {
      const angle = (i * (360 / 26) - 90) * (Math.PI / 180);
      const xOuter = center + radiusOuter * Math.cos(angle) - 10;
      const yOuter = center + radiusOuter * Math.sin(angle) - 10;
      outerLettersHtml += `<div class="cipher-letter outer-letter" style="left:${xOuter}px; top:${yOuter}px;">${char}</div>`;

      const xInner = center + radiusInner * Math.cos(angle) - 10;
      const yInner = center + radiusInner * Math.sin(angle) - 10;
      innerLettersHtml += `<div class="cipher-letter inner-letter" style="left:${xInner}px; top:${yInner}px;">${char}</div>`;
    });

    containerEl.innerHTML = `
      <div class="cipher-wheel-container">
        <div class="cipher-interactive-stage">
          <div class="wheel-dial-wrapper" id="wheelDial">
            <div class="cipher-outer-ring">${outerLettersHtml}</div>
            <div class="cipher-inner-ring" id="innerCipherRing" style="transform: rotate(0deg);">${innerLettersHtml}</div>
            <div class="wheel-center-boss">⚓</div>
          </div>

          <div class="cipher-controls-panel">
            <div class="cipher-shift-slider-group">
              <div class="shift-label-row">
                <span>Brass Shift Key:</span>
                <strong id="shiftDisplayVal">+0 Shift</strong>
              </div>
              <input type="range" min="0" max="25" value="0" class="shift-range-input" id="caesarShiftSlider">
            </div>

            <div class="cipher-text-display-box">
              <span class="label">WATERLOGGED CIPHER:</span>
              <div class="encoded-msg">${this.caesarState.cipherText}</div>
              <span class="label">CURRENT DECRYPTION:</span>
              <div class="decoded-preview" id="decodedPreviewText">---</div>
            </div>

            <button class="verify-puzzle-btn" id="btnVerifyCaesar">Break Cipher Seal</button>
          </div>
        </div>
      </div>
    `;

    const slider = containerEl.querySelector('#caesarShiftSlider');
    const displayVal = containerEl.querySelector('#shiftDisplayVal');
    const innerRing = containerEl.querySelector('#innerCipherRing');
    const preview = containerEl.querySelector('#decodedPreviewText');
    const verifyBtn = containerEl.querySelector('#btnVerifyCaesar');

    const updateCipherDisplay = (shift) => {
      this.caesarState.currentShift = shift;
      displayVal.textContent = `+${shift} Shift`;
      const deg = (shift * (360 / 26));
      innerRing.style.transform = `rotate(-${deg}deg)`;

      // Decrypt cipher text with current shift
      const decoded = this.decryptCaesar(this.caesarState.cipherText, shift);
      preview.textContent = decoded;

      if (window.seaAudio) window.seaAudio.playGearClick();
    };

    slider.addEventListener('input', (e) => {
      updateCipherDisplay(parseInt(e.target.value, 10));
    });

    verifyBtn.addEventListener('click', () => {
      if (this.caesarState.currentShift === this.caesarState.targetShift) {
        if (window.seaAudio) window.seaAudio.playDiscoveryChime();
        if (window.captainAuth) window.captainAuth.unlockAchievement('master_cryptographer');
        if (this.onPuzzleSolvedCallback) this.onPuzzleSolvedCallback();
      } else {
        if (window.seaAudio) window.seaAudio.playCursedHum();
        alert("The transcribed text remains garbled! Adjust the shift dial until the sea words make sense.");
      }
    });

    updateCipherDisplay(0);
  }

  decryptCaesar(text, shift) {
    return text.replace(/[A-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      // Shift backward to decode
      let decoded = code - shift;
      if (decoded < 65) decoded += 26;
      return String.fromCharCode(decoded);
    });
  }

  // =========================================================================
  // 2. NAUTICAL SIGNAL FLAGS (SEMAPHORE)
  // =========================================================================
  initNauticalPuzzle(containerEl, onSolved) {
    this.currentPuzzle = 'nautical';
    this.onPuzzleSolvedCallback = onSolved;
    this.nauticalState.selectedFlags = [null, null, null, null];

    const generateFlagSVG = (letter) => {
      switch (letter) {
        case 'R': // Romeo: Red with yellow cross
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#d62828"/>
            <rect x="40" width="20" height="100" fill="#f4d03f"/>
            <rect y="40" width="100" height="20" fill="#f4d03f"/>
          </svg>`;
        case 'E': // Echo: Blue over red
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="100" height="50" fill="#0077b6"/>
            <rect y="50" width="100" height="50" fill="#d62828"/>
          </svg>`;
        case 'F': // Foxtrot: White with red diamond
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#f8f9fa"/>
            <polygon points="50,15 85,50 50,85 15,50" fill="#d62828"/>
          </svg>`;
        case 'A': // Alpha: White and blue swallowtail
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="50" height="100" fill="#fff"/>
            <rect x="50" width="50" height="100" fill="#0077b6"/>
          </svg>`;
        case 'B': // Bravo: Solid red
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#d62828"/></svg>`;
        case 'C': // Charlie: Blue, white, red, white, blue stripes
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect y="0" width="100" height="20" fill="#0077b6"/>
            <rect y="20" width="100" height="20" fill="#fff"/>
            <rect y="40" width="100" height="20" fill="#d62828"/>
            <rect y="60" width="100" height="20" fill="#fff"/>
            <rect y="80" width="100" height="20" fill="#0077b6"/>
          </svg>`;
        case 'D': // Delta: Yellow, blue, yellow
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect y="0" width="100" height="30" fill="#f4d03f"/>
            <rect y="30" width="100" height="40" fill="#0077b6"/>
            <rect y="70" width="100" height="30" fill="#f4d03f"/>
          </svg>`;
        case 'S': // Sierra: White with blue square
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#fff"/>
            <rect x="25" y="25" width="50" height="50" fill="#0077b6"/>
          </svg>`;
        default:
          return `<svg class="signal-flag-svg" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#495057"/>
            <text x="50" y="65" font-size="40" text-anchor="middle" fill="#fff" font-weight="bold">${letter}</text>
          </svg>`;
      }
    };

    let flagCardsHtml = "";
    this.nauticalState.availableLetters.forEach(letter => {
      flagCardsHtml += `
        <div class="flag-pick-card" data-letter="${letter}">
          ${generateFlagSVG(letter)}
          <span>[${letter}]</span>
        </div>
      `;
    });

    containerEl.innerHTML = `
      <div class="nautical-signals-board">
        <div class="signal-mast-rigging">
          <p style="font-family: var(--font-heading); color: var(--gold-primary); font-size: 13px; letter-spacing: 2px;">
            SIGNAL MAST HALYARD (4 FLAGS SEQUENCE)
          </p>
          <div class="mast-halyard-slots" id="mastHalyard">
            <div class="flag-slot" data-slot="0"><span class="slot-hint-letter">1st</span></div>
            <div class="flag-slot" data-slot="1"><span class="slot-hint-letter">2nd</span></div>
            <div class="flag-slot" data-slot="2"><span class="slot-hint-letter">3rd</span></div>
            <div class="flag-slot" data-slot="3"><span class="slot-hint-letter">4th</span></div>
          </div>
          <button class="verify-puzzle-btn" id="btnHoistSignals">Hoist Flags & Signal Channel</button>
        </div>

        <div style="font-family: var(--font-heading); font-size: 13px; color: var(--ink-secondary);">
          SIGNAL CODEBOOK DECK (Click flag to hoist into halyard):
        </div>
        <div class="maritime-flag-picker" id="flagDeck">
          ${flagCardsHtml}
        </div>
      </div>
    `;

    const halyardSlots = containerEl.querySelectorAll('.flag-slot');
    const flagCards = containerEl.querySelectorAll('.flag-pick-card');
    const hoistBtn = containerEl.querySelector('#btnHoistSignals');

    const renderSlots = () => {
      halyardSlots.forEach((slot, idx) => {
        const letter = this.nauticalState.selectedFlags[idx];
        if (letter) {
          slot.classList.add('filled');
          slot.innerHTML = `
            <span class="slot-hint-letter">${letter}</span>
            ${generateFlagSVG(letter)}
          `;
        } else {
          slot.classList.remove('filled');
          const num = ['1st', '2nd', '3rd', '4th'][idx];
          slot.innerHTML = `<span class="slot-hint-letter">${num}</span>`;
        }
      });
    };

    flagCards.forEach(card => {
      card.addEventListener('click', () => {
        const letter = card.getAttribute('data-letter');
        const emptyIdx = this.nauticalState.selectedFlags.indexOf(null);
        if (emptyIdx !== -1) {
          this.nauticalState.selectedFlags[emptyIdx] = letter;
          if (window.seaAudio) window.seaAudio.playGearClick();
          renderSlots();
        }
      });
    });

    halyardSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const slotIdx = parseInt(slot.getAttribute('data-slot'), 10);
        if (this.nauticalState.selectedFlags[slotIdx]) {
          this.nauticalState.selectedFlags[slotIdx] = null;
          if (window.seaAudio) window.seaAudio.playGearClick();
          renderSlots();
        }
      });
    });

    hoistBtn.addEventListener('click', () => {
      const currentWord = this.nauticalState.selectedFlags.join("");
      if (currentWord === this.nauticalState.targetWord) {
        if (window.seaAudio) window.seaAudio.playDiscoveryChime();
        if (window.captainAuth) window.captainAuth.unlockAchievement('semaphore_signaler');
        if (this.onPuzzleSolvedCallback) this.onPuzzleSolvedCallback();
      } else {
        if (window.seaAudio) window.seaAudio.playCursedHum();
        alert(`The lookout yells: "The signal '${currentWord}' is unrecognized! The reef teeth draw near!" Check the captain's log for the true reef warning.`);
      }
    });
  }

  // =========================================================================
  // 3. AZTEC ASTROLOGICAL CELESTIAL DIAL
  // =========================================================================
  initAztecDialPuzzle(containerEl, onSolved) {
    this.currentPuzzle = 'aztec';
    this.onPuzzleSolvedCallback = onSolved;

    this.aztecState.outerRotation = 90;
    this.aztecState.midRotation = 180;
    this.aztecState.innerRotation = 270;

    const outerGlyphs = ['🐍', '🦅', '🐆', '🐊', '💀', '🐒', '🏠', '🌀'];
    const outerLabels = ['Coatl', 'Eagle', 'Jaguar', 'Crocodile', 'Death', 'Monkey', 'House', 'Movement'];
    const midGlyphs = ['🌑', '🌓', '🌕', '🌘'];
    const midLabels = ['New Moon', 'Crescent', 'Solstice', 'Eclipse'];

    let outerNodes = "";
    outerGlyphs.forEach((glyph, i) => {
      const angle = (i * (360 / 8) - 90) * (Math.PI / 180);
      const x = 145 + 130 * Math.cos(angle) - 15;
      const y = 145 + 130 * Math.sin(angle) - 15;
      outerNodes += `<div class="ring-glyph-node" title="${outerLabels[i]}" style="left:${x}px; top:${y}px;">${glyph}</div>`;
    });

    let midNodes = "";
    midGlyphs.forEach((glyph, i) => {
      const angle = (i * (360 / 4) - 90) * (Math.PI / 180);
      const x = 100 + 85 * Math.cos(angle) - 15;
      const y = 100 + 85 * Math.sin(angle) - 15;
      midNodes += `<div class="ring-glyph-node" title="${midLabels[i]}" style="left:${x}px; top:${y}px;">${glyph}</div>`;
    });

    containerEl.innerHTML = `
      <div class="aztec-dial-wrapper">
        <div style="font-family: var(--font-heading); font-size: 13px; color: var(--gold-light); text-align: center;">
          ALIGN THE CELESTIAL RINGS TO THE ZENITH (NORTH)
        </div>

        <div class="celestial-wheel-canvas-box">
          <div class="aztec-ring-outer" id="outerRingDial">${outerNodes}</div>
          <div class="aztec-ring-mid" id="midRingDial">${midNodes}</div>
          <div class="aztec-ring-inner" id="innerRingDial">👁️</div>
          <div style="position: absolute; top: 4px; color: var(--gold-primary); font-size: 20px; font-weight: bold; z-index: 20;">▲</div>
        </div>

        <div class="aztec-dial-controls">
          <button class="dial-step-btn" id="btnRotOuter">Rotate Outer Zodiac (Coatl)</button>
          <button class="dial-step-btn" id="btnRotMid">Rotate Celestial Phase</button>
          <button class="dial-step-btn" id="btnRotInner">Rotate Serpent Eye</button>
        </div>

        <button class="verify-puzzle-btn" id="btnVerifyAztec">Align Celestial Rays</button>
      </div>
    `;

    const outerEl = containerEl.querySelector('#outerRingDial');
    const midEl = containerEl.querySelector('#midRingDial');
    const innerEl = containerEl.querySelector('#innerRingDial');

    const updateRotations = () => {
      outerEl.style.transform = `rotate(${this.aztecState.outerRotation}deg)`;
      midEl.style.transform = `rotate(${this.aztecState.midRotation}deg)`;
      innerEl.style.transform = `rotate(${this.aztecState.innerRotation}deg)`;
      if (window.seaAudio) window.seaAudio.playGearClick();
    };

    containerEl.querySelector('#btnRotOuter').addEventListener('click', () => {
      this.aztecState.outerRotation = (this.aztecState.outerRotation + 45) % 360;
      updateRotations();
    });

    containerEl.querySelector('#btnRotMid').addEventListener('click', () => {
      this.aztecState.midRotation = (this.aztecState.midRotation + 90) % 360;
      updateRotations();
    });

    containerEl.querySelector('#btnRotInner').addEventListener('click', () => {
      this.aztecState.innerRotation = (this.aztecState.innerRotation + 90) % 360;
      updateRotations();
    });

    containerEl.querySelector('#btnVerifyAztec').addEventListener('click', () => {
      // Solved when outer = 0 (Coatl North), mid = 90 or 270 (Eclipse), inner = 0
      const outerSolved = (this.aztecState.outerRotation % 360 === 0);
      const midSolved = (this.aztecState.midRotation % 360 === 90);
      const innerSolved = (this.aztecState.innerRotation % 360 === 0);

      if (outerSolved && midSolved && innerSolved) {
        if (window.seaAudio) window.seaAudio.playDiscoveryChime();
        if (window.captainAuth) window.captainAuth.unlockAchievement('celestial_navigator');
        if (this.onPuzzleSolvedCallback) this.onPuzzleSolvedCallback();
      } else {
        if (window.seaAudio) window.seaAudio.playCursedHum();
        alert("The stone dials grind against the lock. The riddle said: Coatl (Serpent) must face North, aligned with the Solar Eclipse, as the Eye watches the Zenith.");
      }
    });

    updateRotations();
  }

  // =========================================================================
  // 4. PROGRESSIVE HINTS SYSTEM
  // =========================================================================
  getHintsForPuzzle(puzzleType) {
    switch (puzzleType) {
      case 'caesar':
        return [
          {
            tier: 1,
            title: "Captain's Instinct",
            text: "Look at the marginalia in the journal: Captain Drake penned the Roman numeral 'III' with a drawing of three shifting coins."
          },
          {
            tier: 2,
            title: "Quartermaster's Clue",
            text: "Each letter in the journal was moved forward by 3 places in the Latin alphabet. A Caesar shift of +3 decodes the words."
          },
          {
            tier: 3,
            title: "Decoded Rubbing",
            text: "Move the Brass Shift slider to precisely +3. The decrypted coordinates will read: 'THE SERPENT SPIRE PORTS TO THE NORTH STAR'."
          }
        ];
      case 'nautical':
        return [
          {
            tier: 1,
            title: "Lookout's Warning",
            text: "The jagged corals beneath the waves are known in sailor's tongue as the submerged barrier teeth."
          },
          {
            tier: 2,
            title: "Maritime Signal Code",
            text: "The ghost ship signaled the danger ahead. You must hoist the 4 flags spelling R - E - E - F."
          },
          {
            tier: 3,
            title: "Rigging Master Chart",
            text: "Slot the flags in exact order: 1st: Romeo [R], 2nd: Echo [E], 3rd: Echo [E], 4th: Foxtrot [F]."
          }
        ];
      case 'aztec':
        return [
          {
            tier: 1,
            title: "Stargazer's Glimpse",
            text: "Your combined Celestial Monocle illuminates serpent markings pointing directly upward toward the North Star."
          },
          {
            tier: 2,
            title: "Sun Priest's Alignment",
            text: "The outer ring must place the Coatl (Serpent 🐍) at the top North arrow. The middle ring must bring the Solar Eclipse (🌘) to the top."
          },
          {
            tier: 3,
            title: "Sacred Altar Solution",
            text: "Rotate the Outer dial until 🐍 is at the top arrow. Rotate Middle dial until 🌘 is at the top. Rotate Inner dial until the 👁️ looks straight up."
          }
        ];
      default:
        return [
          {
            tier: 1,
            title: "Log Note",
            text: "Search your inventory pouch. Combining ancient relics at the workbench may forge the master key you need."
          }
        ];
    }
  }
}

window.puzzleEngine = new PuzzleEngine();
