/**
 * LOST TREASURE: PS #07 — THE LOST TREASURE HUNT
 * Core Application Controller (5-Screen Architecture)
 * Controls:
 * 1. Screen Navigation (Log, Map, Cipher Chamber, Inventory & Crew, Final Hoard)
 * 2. Persistent HUD (Timer, Current Location, Mini Crew Meters, Doubloons, Quicksave)
 * 3. Screen 1: Captain's Log (Hero card, 4 gameplay pillars, story manuscript engine)
 * 4. Screen 2: Interactive Pirate Map (7 locations, SVG routes, moving ship, fog-of-war)
 * 5. Screen 3: 3D Riddle & Cipher Chamber (Three.js 3D cipher wheel, clues, validation, unlock)
 * 6. Screen 4: 20-Slot Relic Pouch & Crew Status (Rarity ranks, 3D inspection, workbench)
 * 7. Screen 5: Final Chamber & 4 Branching Endings (Score calculation XXX/1000, replay)
 */

class LostTreasureApp {
  constructor() {
    this.currentScreen = 'screenLog';
    this.startTime = Date.now();
    this.timerInterval = null;

    this.state = {
      currentNodeId: 'act1_start',
      currentLocation: 'ghost_ship',
      morale: 80,
      health: 100,
      supplies: 65,
      gold: 25,
      history: ['act1_start'],
      solvedPuzzles: [],
      unlockedLocations: ['ghost_ship', 'skull_island', 'dead_mans_reef', 'isle_of_serpents'],
      hintsUsed: 0,
      hintsRemaining: 3,
      currentCipherIndex: 0,
      activeEnding: null
    };

    // 3 Cipher Quests
    this.cipherQuests = [
      {
        id: 'caesar_moon',
        title: 'Riddle of the Moon Altar',
        targetIsland: 'TARGET: SKULL ISLAND',
        prompt: '“The logbook page has been scrambled by sea water. Shift each glyph by +3 to decipher the hidden navigational coordinates:”',
        encryptedText: 'WKH VHUSHQW VSLUH',
        solution: 'THE SERPENT SPIRE',
        shift: 3,
        unlocksLocation: 'skull_island',
        unlockedMsg: 'Coordinates deciphered! Skull Island is now charted and marked safe to anchor.',
        hints: [
          'Clue 1: This is a classic Roman military shift cipher.',
          'Clue 2: Each letter is shifted forward by exactly 3 positions in the alphabet (e.g. W -> T, K -> H).',
          'Clue 3: The first word begins with "THE" and describes a mythical sea beast.'
        ]
      },
      {
        id: 'semaphore_reef',
        title: 'Nautical Semaphore of the Reef',
        targetIsland: 'TARGET: DEAD MAN’S REEF',
        prompt: '“Ghost lanterns flicker through the mist at Dead Man’s Reef. Decode the maritime signal word to navigate the razor coral:”',
        encryptedText: 'UHHIV',
        solution: 'REEFS',
        shift: 3,
        unlocksLocation: 'dead_mans_reef',
        unlockedMsg: 'Signal understood! Dead Man’s Reef is now navigable without wrecking your brigantine.',
        hints: [
          'Clue 1: The signal warns sailors of sharp underwater hazards.',
          'Clue 2: Reverse a Caesar shift of +3 on the word UHHIV.',
          'Clue 3: The word starts with R and ends with FS.'
        ]
      },
      {
        id: 'aztec_temple',
        title: 'Astrological Seal of Tonatiuh',
        targetIsland: 'TARGET: ANCIENT TEMPLE',
        prompt: '“The stone door beneath the Isle of Serpents is carved with celestial sun runes. Speak the Aztec Solar God’s name:”',
        encryptedText: 'WRQDWLXK',
        solution: 'TONATIUH',
        shift: 3,
        unlocksLocation: 'ancient_temple',
        unlockedMsg: 'The Sun Door grinds open! Ancient Temple and Forbidden Cove are charted.',
        hints: [
          'Clue 1: The fifth Aztec sun deity who demands reverence.',
          'Clue 2: Decrypt WRQDWLXK with shift -3.',
          'Clue 3: The name begins with TON and ends with TIUH.'
        ]
      }
    ];

    // Map Locations Data
    this.mapLocations = {
      ghost_ship: {
        id: 'ghost_ship',
        title: '1. Derelict Galleon El Cazador',
        left: '12%',
        top: '75%',
        lore: 'A silent ghost galleon drifting through the tempest. The salvaged captain\'s log was pulled from the drowned captain\'s cabin.',
        status: 'unlocked'
      },
      skull_island: {
        id: 'skull_island',
        title: '2. Skull Island Caverns',
        left: '28%',
        top: '35%',
        lore: 'Limestone crags shaped like a screaming skull. Pirate coves here harbor Spanish doubloons and hidden smugglers.',
        status: 'unlocked'
      },
      dead_mans_reef: {
        id: 'dead_mans_reef',
        title: '3. Dead Man\'s Coral Reef',
        left: '42%',
        top: '80%',
        lore: 'Treacherous shallows filled with barnacle-encrusted ship ribs. The Brass Astrolabe was retrieved from the sea floor.',
        status: 'unlocked'
      },
      isle_of_serpents: {
        id: 'isle_of_serpents',
        title: '4. The Isle of Serpents',
        left: '58%',
        top: '45%',
        lore: 'A jagged volcanic jungle island surrounded by serpent-infested currents. Beneath the peak lies the subterranean Sun Temple.',
        status: 'unlocked'
      },
      ancient_temple: {
        id: 'ancient_temple',
        title: '5. Ancient Aztec Sun Temple',
        left: '72%',
        top: '25%',
        lore: 'A subterranean stone pyramid guarded by poison dart traps, serpent altars, and glowing emerald relics.',
        status: 'locked'
      },
      forbidden_cove: {
        id: 'forbidden_cove',
        title: '6. Forbidden Cove',
        left: '82%',
        top: '70%',
        lore: 'A hidden tidal lagoon concealed by sea mist. Sea channels here lead directly into the treasure hoard chamber.',
        status: 'locked'
      },
      hidden_treasure: {
        id: 'hidden_treasure',
        title: '7. The Crypt of Tonatiuh',
        left: '92%',
        top: '40%',
        lore: 'The ultimate resting place of the legendary Aztec hoard. A chamber overflowing with gold and supernatural moral reckoning.',
        status: 'locked'
      }
    };

    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  initElements() {
    // Top HUD
    this.elHudTimer = document.getElementById('hudGameTimer');
    this.elHudLocation = document.getElementById('hudLocationText');
    this.elCaptainName = document.getElementById('captainNameDisplay');
    this.elGoldVal = document.getElementById('goldValue');
    this.elMiniHealthVal = document.getElementById('miniHealthVal');
    this.elMiniHealthFill = document.getElementById('miniHealthFill');
    this.elMiniMoraleVal = document.getElementById('miniMoraleVal');
    this.elMiniMoraleFill = document.getElementById('miniMoraleFill');
    this.elMiniSuppliesVal = document.getElementById('miniSuppliesVal');
    this.elMiniSuppliesFill = document.getElementById('miniSuppliesFill');

    // Navigation Tabs
    this.navTabs = document.querySelectorAll('.screen-nav-tab');
    this.gameScreens = document.querySelectorAll('.game-screen');

    // Screen 1: Log Elements
    this.elProgressText = document.getElementById('voyageProgressText');
    this.btnHeroBeginVoyage = document.getElementById('btnHeroBeginVoyage');
    this.elSceneImage = document.getElementById('sceneImage');
    this.elChapterNumber = document.getElementById('chapterNumber');
    this.elChapterLocation = document.getElementById('chapterLocation');
    this.elDiscoveryStrip = document.getElementById('discoveryStrip');
    this.elDiscoveryIcon = document.getElementById('discoveryIcon');
    this.elDiscoveryTitle = document.getElementById('discoveryTitle');
    this.elDiscoveryLore = document.getElementById('discoveryLore');
    this.elInspectBtn = document.getElementById('discoveryInspectBtn');
    this.elLoreQuote = document.getElementById('loreQuoteText');
    this.elSceneTitle = document.getElementById('sceneTitle');
    this.elDateStamp = document.getElementById('dateStamp');
    this.elNarrativeBody = document.getElementById('narrativeBody');
    this.elPuzzleBanner = document.getElementById('puzzleBanner');
    this.elChoiceList = document.getElementById('choiceList');
    this.elPageNumIndicator = document.getElementById('pageNumIndicator');
    this.btnHistoryBack = document.getElementById('btnHistoryBack');

    // Screen 2: Map Elements
    this.elMovingShipMarker = document.getElementById('movingShipMarker');
    this.elMapPopup = document.getElementById('mapLocationPopup');
    this.elMapPopupTitle = document.getElementById('mapPopupTitle');
    this.elMapPopupLore = document.getElementById('mapPopupLore');
    this.btnMapPopupAction = document.getElementById('btnPopupAction');
    this.btnCloseMapPopup = document.getElementById('btnCloseMapPopup');

    // Screen 3: Cipher Elements
    this.elCipherChamberStage = document.getElementById('cipherChamberStage');
    this.elCipherTitle = document.getElementById('cipherRiddleTitle');
    this.elCipherTargetIsland = document.getElementById('cipherTargetIsland');
    this.elCipherPrompt = document.getElementById('cipherCluePrompt');
    this.elCipherEncryptedBox = document.getElementById('cipherEncryptedBox');
    this.elCipherInput = document.getElementById('cipherInput');
    this.btnSubmitCipher = document.getElementById('btnSubmitCipher');
    this.elHintsBadge = document.getElementById('hintsRemainingBadge');
    this.btnUseHint = document.getElementById('btnUseCipherHint');
    this.elHintText = document.getElementById('cipherHintText');
    this.elShiftBadge = document.getElementById('shiftReadoutBadge');
    this.btnShiftDec = document.getElementById('btnShiftDec');
    this.btnShiftInc = document.getElementById('btnShiftInc');
    this.elLocationUnlockedCard = document.getElementById('locationUnlockedCard');
    this.elLocationUnlockedMsg = document.getElementById('locationUnlockedMsg');
    this.btnPlotOnMap = document.getElementById('btnPlotOnMap');

    // Screen 4: Inventory Elements
    this.elInventoryGrid20 = document.getElementById('inventorySlotsGrid20');
    this.elInventoryCount = document.getElementById('inventoryCountDisplay');
    this.elInspectorTitle = document.getElementById('inspectorItemTitle');
    this.elInspectorLore = document.getElementById('inspectorItemLore');
    this.elInspectorRarity = document.getElementById('inspectorItemRarity');
    this.elDetailHealthVal = document.getElementById('detailHealthVal');
    this.elDetailHealthFill = document.getElementById('detailHealthFill');
    this.elDetailMoraleVal = document.getElementById('detailMoraleVal');
    this.elDetailMoraleFill = document.getElementById('detailMoraleFill');
    this.elDetailSuppliesVal = document.getElementById('detailSuppliesVal');
    this.elDetailSuppliesFill = document.getElementById('detailSuppliesFill');
    this.elScreenWorkbenchSlotA = document.getElementById('screenWorkbenchSlotA');
    this.elScreenWorkbenchSlotB = document.getElementById('screenWorkbenchSlotB');
    this.btnScreenWorkbenchCombine = document.getElementById('btnScreenWorkbenchCombine');

    // Screen 5: Endings Elements
    this.moralDecisionsGrid = document.getElementById('moralDecisionsGrid');
    this.elEndingResolutionCard = document.getElementById('endingResolutionCard');
    this.elEndingHeroImage = document.getElementById('endingHeroImage');
    this.elEndingTitle = document.getElementById('endingTitleTag');
    this.elEndingProse = document.getElementById('endingProseText');
    this.elFinalScoreDisplay = document.getElementById('finalScoreDisplay');
    this.elScoreRiddles = document.getElementById('scoreRiddlesVal');
    this.elScoreRelics = document.getElementById('scoreRelicsVal');
    this.elScoreLocations = document.getElementById('scoreLocationsVal');
    this.elScoreHints = document.getElementById('scoreHintsVal');
    this.btnRestartGame = document.getElementById('btnRestartGame');
    this.btnReturnToMap = document.getElementById('btnReturnToMap');

    // Toast
    this.elToast = document.getElementById('voyageToast');
    this.elToastMsg = document.getElementById('toastMessage');
  }

  bindEvents() {
    // First interaction unlocks Web Audio API
    document.addEventListener('click', () => {
      if (window.seaAudio) window.seaAudio.ensureContext();
    }, { once: true });

    // Audio Toggle
    const btnAudio = document.getElementById('btnToggleAudio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isMuted = window.seaAudio.toggleMute();
        btnAudio.classList.toggle('muted', isMuted);
        btnAudio.innerHTML = isMuted ? '🔇 <span class="badge-pill">OFF</span>' : '🔊 <span class="badge-pill">ON</span>';
      });
    }

    // Quicksave button
    const btnQuicksave = document.getElementById('btnQuicksave');
    if (btnQuicksave) {
      btnQuicksave.addEventListener('click', () => this.quicksaveVoyage());
    }

    // Screen Navigation Tab Clicks
    this.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetScreen = tab.getAttribute('data-screen');
        this.switchScreen(targetScreen);
      });
    });

    // Screen 1: Hero button & Pillar Cards
    if (this.btnHeroBeginVoyage) {
      this.btnHeroBeginVoyage.addEventListener('click', () => {
        this.switchScreen('screenMap');
      });
    }

    const cardExplore = document.getElementById('cardPillarExplore');
    if (cardExplore) cardExplore.addEventListener('click', () => this.switchScreen('screenMap'));

    const cardDecrypt = document.getElementById('cardPillarDecrypt');
    if (cardDecrypt) cardDecrypt.addEventListener('click', () => this.switchScreen('screenCipher'));

    const cardCollect = document.getElementById('cardPillarCollect');
    if (cardCollect) cardCollect.addEventListener('click', () => this.switchScreen('screenInventory'));

    const cardChoose = document.getElementById('cardPillarChoose');
    if (cardChoose) cardChoose.addEventListener('click', () => this.switchScreen('screenEndings'));

    // Screen 1: Relic collect button in story
    if (this.elInspectBtn) {
      this.elInspectBtn.addEventListener('click', () => {
        const node = window.storyEngine ? window.storyEngine.getNode(this.state.currentNodeId) : null;
        if (node && node.discoveryItem) {
          window.inventorySystem.addItem(node.discoveryItem);
          this.showToast(`Acquired: ${node.discoveryName || 'Relic'}!`);
          this.elInspectBtn.textContent = 'In Pouch';
          this.elInspectBtn.disabled = true;
          this.updateHUD();
          this.renderInventory20Slots();
        }
      });
    }

    // Screen 1: Trigger Cipher Modal / Screen button
    const btnTriggerPuzzle = document.getElementById('btnTriggerPuzzleModal');
    if (btnTriggerPuzzle) {
      btnTriggerPuzzle.addEventListener('click', () => {
        this.switchScreen('screenCipher');
      });
    }

    // Screen 1: History Back button
    if (this.btnHistoryBack) {
      this.btnHistoryBack.addEventListener('click', () => {
        if (this.state.history.length > 1) {
          this.state.history.pop();
          this.state.currentNodeId = this.state.history[this.state.history.length - 1];
          this.renderCurrentStoryNode();
          this.updateHUD();
        }
      });
    }

    // Screen 2: Map Location Pins
    document.querySelectorAll('.map-location-pin').forEach(pin => {
      pin.addEventListener('click', () => {
        const locId = pin.getAttribute('data-loc');
        this.selectMapLocation(locId);
      });
    });

    if (this.btnCloseMapPopup) {
      this.btnCloseMapPopup.addEventListener('click', () => {
        this.elMapPopup.style.display = 'none';
      });
    }

    if (this.btnMapPopupAction) {
      this.btnMapPopupAction.addEventListener('click', () => {
        const target = this.btnMapPopupAction.getAttribute('data-target-loc');
        this.sailToLocation(target);
      });
    }

    // Screen 3: Cipher Wheel Shift Controls
    if (this.btnShiftDec) {
      this.btnShiftDec.addEventListener('click', () => {
        this.adjustCipherShift(-1);
      });
    }
    if (this.btnShiftInc) {
      this.btnShiftInc.addEventListener('click', () => {
        this.adjustCipherShift(1);
      });
    }

    // Screen 3: Cipher Submit Verification
    if (this.btnSubmitCipher) {
      this.btnSubmitCipher.addEventListener('click', () => {
        this.verifyCipherAnswer();
      });
    }
    if (this.elCipherInput) {
      this.elCipherInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.verifyCipherAnswer();
      });
    }

    // Screen 3: Hints Button
    if (this.btnUseHint) {
      this.btnUseHint.addEventListener('click', () => {
        this.revealCipherHint();
      });
    }

    // Screen 3: Plot on Map CTA
    if (this.btnPlotOnMap) {
      this.btnPlotOnMap.addEventListener('click', () => {
        this.switchScreen('screenMap');
      });
    }

    // Screen 4: Relic Workbench combine button
    if (this.btnScreenWorkbenchCombine) {
      this.btnScreenWorkbenchCombine.addEventListener('click', () => {
        const res = window.inventorySystem.attemptCombination();
        if (res.success) {
          this.showToast(`Forged: ${res.resultItem.name}!`);
          this.renderInventory20Slots();
          this.updateHUD();
        } else {
          this.showToast(res.message);
        }
      });
    }

    // Screen 5: Moral Decisions
    if (this.moralDecisionsGrid) {
      this.moralDecisionsGrid.querySelectorAll('.decision-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          const endingType = card.getAttribute('data-ending');
          this.triggerEnding(endingType);
        });
      });
    }

    if (this.btnRestartGame) {
      this.btnRestartGame.addEventListener('click', () => {
        this.confirmRestartVoyage();
      });
    }

    if (this.btnReturnToMap) {
      this.btnReturnToMap.addEventListener('click', () => {
        this.switchScreen('screenMap');
      });
    }
  }

  async initApp() {
    this.startVoyageTimer();

    // 1. Initialize 3D Aztec Doubloon in HUD
    if (window.lostTreasure3D) {
      window.lostTreasure3D.initHeroModel('hud3DCoin', 'sun_medallion');
    }

    // 2. Load saved voyage from DB if exists
    if (window.captainAuth) {
      const saved = await window.captainAuth.loadActiveVoyage();
      if (saved && saved.checkpoint_node) {
        this.state.currentNodeId = saved.checkpoint_node;
        this.state.morale = saved.crew_morale ?? 80;
        this.state.gold = saved.gold_doubloons ?? 25;
        if (saved.inventory && Array.isArray(saved.inventory)) {
          window.inventorySystem.loadState(saved.inventory);
        }
      }
    }

    // 3. Render Initial State
    this.renderCurrentStoryNode();
    this.renderInventory20Slots();
    this.renderCipherQuest(this.state.currentCipherIndex);
    this.updateHUD();
    this.updateMapVisuals();

    // 4. Init 3D Relic default inspector
    setTimeout(() => {
      if (window.lostTreasure3D) {
        window.lostTreasure3D.initInteractiveRelicModal('relic3DCanvas', 'brass_astrolabe');
      }
    }, 500);
  }

  // =========================================================================
  // LIVE VOYAGE TIMER
  // =========================================================================
  startVoyageTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
      const hrs = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
      const secs = String(elapsedSec % 60).padStart(2, '0');
      if (this.elHudTimer) {
        this.elHudTimer.textContent = `${hrs}:${mins}:${secs}`;
      }
    }, 1000);
  }

  // =========================================================================
  // SCREEN NAVIGATION
  // =========================================================================
  switchScreen(screenId) {
    if (window.seaAudio) window.seaAudio.playPageTurn();

    this.currentScreen = screenId;

    // Toggle Nav Tabs
    this.navTabs.forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-screen') === screenId);
    });

    // Toggle Game Screen Sections
    this.gameScreens.forEach(sec => {
      sec.classList.toggle('active', sec.id === screenId);
    });

    // Specific screen initialization hooks
    if (screenId === 'screenCipher') {
      this.initCipher3DWheel();
    } else if (screenId === 'screenInventory') {
      this.renderInventory20Slots();
    } else if (screenId === 'screenMap') {
      this.updateMapVisuals();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // SCREEN 1: CAPTAIN'S LOG & STORY ENGINE
  // =========================================================================
  renderCurrentStoryNode() {
    if (!window.storyEngine) return;
    const node = window.storyEngine.getNode(this.state.currentNodeId);
    if (!node) return;

    // Update Left Page
    if (this.elSceneImage) this.elSceneImage.src = node.image;
    if (this.elChapterNumber) this.elChapterNumber.textContent = `${node.act} — ${node.chapterTitle}`;
    if (this.elChapterLocation) this.elChapterLocation.textContent = node.dateStamp.split('—')[1] || 'Sea of Serpents';

    if (node.discoveryItem) {
      this.elDiscoveryStrip.style.display = 'flex';
      const itemData = ARTIFACT_CATALOG[node.discoveryItem];
      if (this.elDiscoveryIcon) this.elDiscoveryIcon.textContent = itemData ? itemData.icon : '✨';
      if (this.elDiscoveryTitle) this.elDiscoveryTitle.textContent = node.discoveryName || (itemData ? itemData.name : 'Relic');
      if (this.elDiscoveryLore) this.elDiscoveryLore.textContent = node.discoveryLore || '';
      
      const inPouch = window.inventorySystem.hasItem(node.discoveryItem);
      if (this.elInspectBtn) {
        this.elInspectBtn.textContent = inPouch ? 'In Pouch' : 'Collect to Pouch';
        this.elInspectBtn.disabled = inPouch;
      }
    } else {
      if (this.elDiscoveryStrip) this.elDiscoveryStrip.style.display = 'none';
    }

    if (this.elLoreQuote) this.elLoreQuote.innerHTML = node.loreQuote || '“The ocean remembers what men forget.”';

    // Update Right Page
    if (this.elSceneTitle) this.elSceneTitle.textContent = node.chapterTitle;
    if (this.elDateStamp) this.elDateStamp.textContent = node.dateStamp;
    if (this.elNarrativeBody) this.elNarrativeBody.innerHTML = node.text;

    // Puzzle Banner
    if (node.puzzleType && !this.state.solvedPuzzles.includes(node.puzzleType)) {
      if (this.elPuzzleBanner) this.elPuzzleBanner.style.display = 'flex';
    } else {
      if (this.elPuzzleBanner) this.elPuzzleBanner.style.display = 'none';
    }

    // Branching Choices
    if (this.elChoiceList) {
      this.elChoiceList.innerHTML = '';
      if (node.choices && node.choices.length > 0) {
        node.choices.forEach(choice => {
          const card = document.createElement('div');
          card.className = 'choice-card';
          card.innerHTML = `
            <div class="choice-title">${choice.text}</div>
            <div class="choice-preview">${choice.consequence || 'Chart this course across uncharted waters.'}</div>
          `;
          card.addEventListener('click', () => {
            this.handleChoiceSelection(choice);
          });
          this.elChoiceList.appendChild(card);
        });
      }
    }

    // Back button
    if (this.btnHistoryBack) {
      this.btnHistoryBack.style.display = this.state.history.length > 1 ? 'inline-block' : 'none';
    }

    // Update Progress percentage
    this.updateProgressGauge();
  }

  handleChoiceSelection(choice) {
    if (window.seaAudio) window.seaAudio.playChoiceSelect();

    if (choice.effects) {
      if (choice.effects.morale) this.state.morale = Math.max(0, Math.min(100, this.state.morale + choice.effects.morale));
      if (choice.effects.gold) this.state.gold = Math.max(0, this.state.gold + choice.effects.gold);
      if (choice.effects.health) this.state.health = Math.max(0, Math.min(100, this.state.health + choice.effects.health));
      if (choice.effects.supplies) this.state.supplies = Math.max(0, Math.min(100, this.state.supplies + choice.effects.supplies));
    }

    this.state.history.push(choice.nextNodeId);
    this.state.currentNodeId = choice.nextNodeId;

    this.renderCurrentStoryNode();
    this.updateHUD();
    this.quicksaveVoyage();
  }

  // =========================================================================
  // SCREEN 2: INTERACTIVE PIRATE MAP CONTROLLER
  // =========================================================================
  updateMapVisuals() {
    // Update Pins
    Object.keys(this.mapLocations).forEach(key => {
      const pin = document.getElementById(`pin-${key.replace(/_/g, '-')}`);
      if (!pin) return;

      const isUnlocked = this.state.unlockedLocations.includes(key);
      const isCurrent = this.state.currentLocation === key;

      pin.classList.toggle('unlocked', isUnlocked);
      pin.classList.toggle('locked', !isUnlocked);
      pin.classList.toggle('current', isCurrent);
    });

    // Update Moving Ship Position
    const curData = this.mapLocations[this.state.currentLocation];
    if (curData && this.elMovingShipMarker) {
      this.elMovingShipMarker.style.left = curData.left;
      this.elMovingShipMarker.style.top = curData.top;
    }

    // Fog of war
    const fog = document.getElementById('fogEasternSeas');
    if (fog) {
      const allUnlocked = this.state.unlockedLocations.includes('ancient_temple') &&
                          this.state.unlockedLocations.includes('forbidden_cove');
      fog.style.opacity = allUnlocked ? '0' : '0.75';
    }
  }

  selectMapLocation(locId) {
    if (window.seaAudio) window.seaAudio.playGearClick();

    const loc = this.mapLocations[locId];
    if (!loc) return;

    const isUnlocked = this.state.unlockedLocations.includes(locId);

    // Smoothly animate ship to target pin
    if (this.elMovingShipMarker) {
      this.elMovingShipMarker.style.left = loc.left;
      this.elMovingShipMarker.style.top = loc.top;
    }

    // Show location card popup
    if (this.elMapPopup) {
      this.elMapPopup.style.display = 'block';
      this.elMapPopupTitle.textContent = loc.title;
      this.elMapPopupLore.textContent = isUnlocked 
        ? loc.lore 
        : "🔒 Shrouded in fog of war! You must decipher cryptographic riddles in the Cipher Chamber to chart safe coordinates to this location.";

      this.btnMapPopupAction.setAttribute('data-target-loc', locId);
      if (isUnlocked) {
        this.btnMapPopupAction.textContent = "⚓ Anchor & Explore Location";
        this.btnMapPopupAction.style.background = "linear-gradient(135deg, #27ae60 0%, #1e7e44 100%)";
      } else {
        this.btnMapPopupAction.textContent = "🔐 Open Cipher Chamber to Decrypt";
        this.btnMapPopupAction.style.background = "linear-gradient(135deg, #8b2525 0%, #5a1414 100%)";
      }
    }
  }

  sailToLocation(locId) {
    const isUnlocked = this.state.unlockedLocations.includes(locId);
    if (!isUnlocked) {
      // Direct user to cipher chamber to unlock
      this.switchScreen('screenCipher');
      return;
    }

    this.state.currentLocation = locId;
    if (window.seaAudio) window.seaAudio.playWaves();

    this.updateHUD();
    this.updateMapVisuals();
    this.elMapPopup.style.display = 'none';

    this.showToast(`Anchored at: ${this.mapLocations[locId].title}`);

    // If anchoring at hidden treasure, go to Final Chamber
    if (locId === 'hidden_treasure') {
      this.switchScreen('screenEndings');
    } else {
      this.switchScreen('screenLog');
    }
  }

  // =========================================================================
  // SCREEN 3: 3D RIDDLE & CIPHER CHAMBER CONTROLLER
  // =========================================================================
  initCipher3DWheel() {
    const container = document.getElementById('cipherWheel3DCanvas');
    if (!container || container.children.length > 0) return;

    if (window.lostTreasure3D) {
      this.cipher3DWheel = window.lostTreasure3D.initCipherWheelViewer('cipherWheel3DCanvas', (newShift) => {
        this.onCipherWheelShiftChange(newShift);
      });
    }
  }

  onCipherWheelShiftChange(shift) {
    if (this.elShiftBadge) {
      this.elShiftBadge.textContent = `Shift: +${shift}`;
    }
    if (window.seaAudio) window.seaAudio.playGearClick();
  }

  adjustCipherShift(delta) {
    if (this.cipher3DWheel) {
      let cur = this.cipher3DWheel.getShift();
      cur = (cur + delta + 26) % 26;
      this.cipher3DWheel.setShift(cur);
      this.onCipherWheelShiftChange(cur);
    }
  }

  renderCipherQuest(index) {
    const quest = this.cipherQuests[index];
    if (!quest) return;

    if (this.elCipherTitle) this.elCipherTitle.textContent = quest.title;
    if (this.elCipherTargetIsland) this.elCipherTargetIsland.textContent = quest.targetIsland;
    if (this.elCipherPrompt) this.elCipherPrompt.textContent = quest.prompt;
    if (this.elCipherEncryptedBox) this.elCipherEncryptedBox.textContent = quest.encryptedText;
    if (this.elCipherInput) {
      this.elCipherInput.value = '';
      this.elCipherInput.disabled = false;
    }
    if (this.btnSubmitCipher) this.btnSubmitCipher.disabled = false;
    if (this.elLocationUnlockedCard) this.elLocationUnlockedCard.style.display = 'none';
    if (this.elHintText) this.elHintText.style.display = 'none';

    this.updateHintsDisplay();
  }

  verifyCipherAnswer() {
    const quest = this.cipherQuests[this.state.currentCipherIndex];
    if (!quest) return;

    const userAns = (this.elCipherInput.value || '').trim().toUpperCase();
    const correctAns = quest.solution.toUpperCase();

    if (userAns === correctAns) {
      // SUCCESS!
      if (window.seaAudio) window.seaAudio.playDiscoveryChime();

      if (!this.state.solvedPuzzles.includes(quest.id)) {
        this.state.solvedPuzzles.push(quest.id);
      }

      // Unlock destination island
      if (!this.state.unlockedLocations.includes(quest.unlocksLocation)) {
        this.state.unlockedLocations.push(quest.unlocksLocation);
      }
      if (quest.unlocksLocation === 'ancient_temple') {
        this.state.unlockedLocations.push('forbidden_cove');
        this.state.unlockedLocations.push('hidden_treasure');
      }

      // Show unlocked card
      if (this.elLocationUnlockedCard) {
        this.elLocationUnlockedCard.style.display = 'block';
        this.elLocationUnlockedMsg.textContent = quest.unlockedMsg;
      }
      if (this.btnSubmitCipher) this.btnSubmitCipher.disabled = true;
      if (this.elCipherInput) this.elCipherInput.disabled = true;

      this.updateProgressGauge();
      this.updateMapVisuals();
      this.quicksaveVoyage();
      this.showToast(`Victory! ${quest.title} Solved!`);

      // Advance to next quest if available
      if (this.state.currentCipherIndex < this.cipherQuests.length - 1) {
        this.state.currentCipherIndex++;
      }
    } else {
      // WRONG ANSWER: Screen Shake + Red Candle Flare
      if (window.seaAudio) window.seaAudio.playCursedHum();

      if (this.elCipherChamberStage) {
        this.elCipherChamberStage.classList.add('chamber-shake', 'red-flare-active');
        setTimeout(() => {
          this.elCipherChamberStage.classList.remove('chamber-shake', 'red-flare-active');
        }, 600);
      }

      this.showToast("The transcribed glyphs remain garbled! Inspect the shift wheel and try again.");
    }
  }

  revealCipherHint() {
    const quest = this.cipherQuests[this.state.currentCipherIndex];
    if (!quest) return;

    if (this.state.hintsRemaining <= 0) {
      this.showToast("No hints remaining for this voyage!");
      return;
    }

    const hintIdx = Math.min(this.state.hintsUsed, quest.hints.length - 1);
    const hintMsg = quest.hints[hintIdx];

    this.state.hintsUsed++;
    this.state.hintsRemaining--;

    if (this.elHintText) {
      this.elHintText.textContent = `💡 Hint #${this.state.hintsUsed}: ${hintMsg}`;
      this.elHintText.style.display = 'block';
    }

    this.updateHintsDisplay();
    if (window.seaAudio) window.seaAudio.playCoinClink();
  }

  updateHintsDisplay() {
    if (this.elHintsBadge) {
      this.elHintsBadge.textContent = `${this.state.hintsRemaining} / 3`;
    }
  }

  // =========================================================================
  // SCREEN 4: 20-SLOT INVENTORY & CREW QUARTERS CONTROLLER
  // =========================================================================
  renderInventory20Slots() {
    if (!this.elInventoryGrid20) return;
    this.elInventoryGrid20.innerHTML = '';

    const items = window.inventorySystem.items;
    const totalSlots = 20;

    for (let i = 0; i < totalSlots; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot-box';

      if (i < items.length) {
        const itemId = items[i];
        const item = ARTIFACT_CATALOG[itemId];
        if (item) {
          slot.classList.add(`rarity-${item.rarity || 'common'}`);
          slot.innerHTML = `
            <span class="rarity-tag">${item.rarity || 'COMMON'}</span>
            <div class="slot-item-icon">${item.icon}</div>
            <div class="slot-item-name" title="${item.name}">${item.name}</div>
          `;

          slot.addEventListener('click', () => {
            this.selectInventoryItem(item, slot);
          });
        }
      } else {
        slot.classList.add('empty');
        slot.innerHTML = `<span style="font-size: 11px; color: #6d5b43;">Slot #${i + 1}</span>`;
      }

      this.elInventoryGrid20.appendChild(slot);
    }

    if (this.elInventoryCount) {
      this.elInventoryCount.textContent = `${items.length} / 20 Discovered`;
    }

    this.renderWorkbenchSlots();
  }

  selectInventoryItem(item, slotEl) {
    if (window.seaAudio) window.seaAudio.playGearClick();

    // Remove selected state from all slots
    document.querySelectorAll('.inventory-slot-box').forEach(s => s.classList.remove('selected'));
    slotEl.classList.add('selected');

    // Update 3D Relic Inspector
    if (this.elInspectorTitle) this.elInspectorTitle.textContent = item.name;
    if (this.elInspectorLore) this.elInspectorLore.textContent = item.lore;
    if (this.elInspectorRarity) {
      this.elInspectorRarity.className = `rarity-tag rarity-${item.rarity || 'common'}`;
      this.elInspectorRarity.textContent = (item.rarity || 'COMMON').toUpperCase();
    }

    if (window.lostTreasure3D) {
      window.lostTreasure3D.initInteractiveRelicModal('relic3DCanvas', item.modelType || 'sun_medallion');
    }

    // Toggle for workbench combination
    if (item.canCombine) {
      window.inventorySystem.toggleSelectForCombination(item.id);
      this.renderWorkbenchSlots();
    }
  }

  renderWorkbenchSlots() {
    const sel = window.inventorySystem.selectedForCombination;
    const slotA = document.getElementById('screenWorkbenchSlotA');
    const slotB = document.getElementById('screenWorkbenchSlotB');

    if (slotA) {
      if (sel[0] && ARTIFACT_CATALOG[sel[0]]) {
        const it = ARTIFACT_CATALOG[sel[0]];
        slotA.innerHTML = `<strong>${it.icon} ${it.name}</strong>`;
        slotA.style.borderColor = '#2ecc71';
      } else {
        slotA.innerHTML = 'Slot 1<br><small>(Select Relic)</small>';
        slotA.style.borderColor = '#8b6b3e';
      }
    }

    if (slotB) {
      if (sel[1] && ARTIFACT_CATALOG[sel[1]]) {
        const it = ARTIFACT_CATALOG[sel[1]];
        slotB.innerHTML = `<strong>${it.icon} ${it.name}</strong>`;
        slotB.style.borderColor = '#2ecc71';
      } else {
        slotB.innerHTML = 'Slot 2<br><small>(Select Relic)</small>';
        slotB.style.borderColor = '#8b6b3e';
      }
    }
  }

  // =========================================================================
  // SCREEN 5: FINAL CHAMBER & 4 BRANCHING ENDINGS
  // =========================================================================
  triggerEnding(endingType) {
    if (window.seaAudio) window.seaAudio.playDiscoveryChime();

    const endings = {
      greed: {
        title: 'The Cursed Captain',
        image: 'assets/images/cursed_skeleton.jpg',
        prose: 'Greed consumes your soul. As you greedily hoard the Aztec gold for yourself, an ancient Aztec hex turns your flesh to ash. You become the skeletal immortal guardian of the crypt, eternally doomed to patrol the sun altar in cold darkness.',
        modifier: -100
      },
      honor: {
        title: 'The Golden Captain',
        image: 'assets/images/treasure_hoard.jpg',
        prose: 'Your crew roars in joyous celebration as chest after chest of gold doubloons, ruby chalices, and Aztec jewels are shared equally among every sailor. With boundless wealth and unbreakable crew loyalty, you are crowned Sovereign Pirate King of the West Indies!',
        modifier: 150
      },
      sacrifice: {
        title: 'The Honorable Captain',
        image: 'assets/images/aztec_crypt.jpg',
        prose: 'Recognizing the malevolent darkness lingering over the Aztec treasure, you ignite the powder barrels to bury the crypt beneath the roaring ocean waves. The curse is broken forever. Your crew returns to port alive and free, singing songs of your noble sacrifice.',
        modifier: 50
      },
      wisdom: {
        title: 'The Lost Legend',
        image: 'assets/images/isle_of_serpents.jpg',
        prose: 'You seal the Sun Door with the Serpent Bone Key and cast all sea charts into the abyss. The Aztec hoard remains undisturbed for eternity, and your name passes into immortal nautical mythology as the phantom captain who found the Isle of Serpents and kept its secret safe.',
        modifier: 100
      }
    };

    const ending = endings[endingType] || endings.honor;
    this.state.activeEnding = endingType;

    // Reveal Ending Card
    if (this.moralDecisionsGrid) this.moralDecisionsGrid.style.display = 'none';
    if (this.elEndingResolutionCard) this.elEndingResolutionCard.style.display = 'block';

    if (this.elEndingHeroImage) this.elEndingHeroImage.src = ending.image;
    if (this.elEndingTitle) this.elEndingTitle.textContent = ending.title;
    if (this.elEndingProse) this.elEndingProse.textContent = ending.prose;

    // Calculate Final Performance Score
    const riddlesCount = this.state.solvedPuzzles.length;
    const relicsCount = window.inventorySystem.items.length;
    const locationsCount = this.state.unlockedLocations.length;
    const hintsPenalty = this.state.hintsUsed * 50;

    let totalScore = (riddlesCount * 250) + (relicsCount * 75) + (locationsCount * 100) - hintsPenalty + ending.modifier;
    totalScore = Math.max(100, Math.min(1000, totalScore));

    if (this.elFinalScoreDisplay) this.elFinalScoreDisplay.textContent = `${totalScore} / 1000`;
    if (this.elScoreRiddles) this.elScoreRiddles.textContent = `${riddlesCount} (+${riddlesCount * 250})`;
    if (this.elScoreRelics) this.elScoreRelics.textContent = `${relicsCount} (+${relicsCount * 75})`;
    if (this.elScoreLocations) this.elScoreLocations.textContent = `${locationsCount} (+${locationsCount * 100})`;
    if (this.elScoreHints) this.elScoreHints.textContent = `${this.state.hintsUsed} (-${hintsPenalty})`;

    this.showToast(`Expedition Concluded! Ending: ${ending.title}`);
    this.quicksaveVoyage();
  }

  confirmRestartVoyage() {
    if (confirm("Reset voyage and begin a fresh expedition across the uncharted seas?")) {
      this.state = {
        currentNodeId: 'act1_start',
        currentLocation: 'ghost_ship',
        morale: 80,
        health: 100,
        supplies: 65,
        gold: 25,
        history: ['act1_start'],
        solvedPuzzles: [],
        unlockedLocations: ['ghost_ship', 'skull_island', 'dead_mans_reef', 'isle_of_serpents'],
        hintsUsed: 0,
        hintsRemaining: 3,
        currentCipherIndex: 0,
        activeEnding: null
      };

      window.inventorySystem.reset();
      this.startTime = Date.now();

      if (this.moralDecisionsGrid) this.moralDecisionsGrid.style.display = 'grid';
      if (this.elEndingResolutionCard) this.elEndingResolutionCard.style.display = 'none';

      this.renderCurrentStoryNode();
      this.renderInventory20Slots();
      this.renderCipherQuest(0);
      this.updateHUD();
      this.updateMapVisuals();
      this.switchScreen('screenLog');

      this.showToast("New voyage commenced!");
    }
  }

  // =========================================================================
  // HUD & PROGRESS GAUGES
  // =========================================================================
  updateHUD() {
    if (this.elGoldVal) this.elGoldVal.textContent = this.state.gold;

    // Mini Health
    if (this.elMiniHealthVal) this.elMiniHealthVal.textContent = `${this.state.health}%`;
    if (this.elMiniHealthFill) this.elMiniHealthFill.style.width = `${this.state.health}%`;
    if (this.elDetailHealthVal) this.elDetailHealthVal.textContent = `${this.state.health}%`;
    if (this.elDetailHealthFill) this.elDetailHealthFill.style.width = `${this.state.health}%`;

    // Mini Morale
    if (this.elMiniMoraleVal) this.elMiniMoraleVal.textContent = `${this.state.morale}%`;
    if (this.elMiniMoraleFill) this.elMiniMoraleFill.style.width = `${this.state.morale}%`;
    if (this.elDetailMoraleVal) this.elDetailMoraleVal.textContent = `${this.state.morale}%`;
    if (this.elDetailMoraleFill) this.elDetailMoraleFill.style.width = `${this.state.morale}%`;

    // Mini Supplies
    if (this.elMiniSuppliesVal) this.elMiniSuppliesVal.textContent = `${this.state.supplies}%`;
    if (this.elMiniSuppliesFill) this.elMiniSuppliesFill.style.width = `${this.state.supplies}%`;
    if (this.elDetailSuppliesVal) this.elDetailSuppliesVal.textContent = `${this.state.supplies}%`;
    if (this.elDetailSuppliesFill) this.elDetailSuppliesFill.style.width = `${this.state.supplies}%`;

    // Location
    const loc = this.mapLocations[this.state.currentLocation];
    if (this.elHudLocation && loc) {
      this.elHudLocation.textContent = loc.title.split('. ')[1] || loc.title;
    }

    this.updateProgressGauge();
  }

  updateProgressGauge() {
    // 7 locations + 3 puzzles + endings
    const locRatio = this.state.unlockedLocations.length / 7;
    const puzzleRatio = this.state.solvedPuzzles.length / 3;
    const progress = Math.min(100, Math.round((locRatio * 60) + (puzzleRatio * 40)));

    if (this.elProgressText) {
      this.elProgressText.textContent = `${progress}%`;
    }
  }

  // =========================================================================
  // TOAST & PERSISTENCE
  // =========================================================================
  showToast(message) {
    if (!this.elToast || !this.elToastMsg) return;
    this.elToastMsg.textContent = message;
    this.elToast.classList.add('show');
    setTimeout(() => {
      this.elToast.classList.remove('show');
    }, 3200);
  }

  async quicksaveVoyage() {
    const voyageState = {
      currentNodeId: this.state.currentNodeId,
      currentLocation: this.state.currentLocation,
      morale: this.state.morale,
      dread: 15,
      gold: this.state.gold,
      inventory: window.inventorySystem.items,
      solvedPuzzles: this.state.solvedPuzzles,
      unlockedLocations: this.state.unlockedLocations,
      hintsUsed: this.state.hintsUsed,
      activeEnding: this.state.activeEnding
    };

    if (window.captainAuth) {
      await window.captainAuth.saveActiveVoyage(voyageState);
    }
    if (window.seaAudio) window.seaAudio.playCoinClink();
    this.showToast("Voyage checkpoint recorded in MySQL database!");
  }
}

// Initialize Application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.lostTreasureApp = new LostTreasureApp();
});
