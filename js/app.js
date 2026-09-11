/**
 * LOST TREASURE: CORE APPLICATION CONTROLLER
 * Coordinates UI rendering, narrative state, interactive modals,
 * inventory management, puzzles, and checkpoint persistence.
 */

class LostTreasureApp {
  constructor() {
    this.state = {
      currentNodeId: 'act1_start',
      morale: 65,
      dread: 15,
      gold: 25,
      history: ['act1_start'],
      solvedPuzzles: []
    };

    this.activeEnding = null;
    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  initElements() {
    // HUD elements
    this.elCaptainName = document.getElementById('captainNameDisplay');
    this.elCaptainCrest = document.getElementById('captainCrestDisplay');
    this.elMoraleVal = document.getElementById('moraleValue');
    this.elDreadVal = document.getElementById('dreadValue');
    this.elGoldVal = document.getElementById('goldValue');
    this.elInventoryBadge = document.getElementById('inventoryBadgeCount');

    // Page elements
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

    // Modals
    this.modalAuth = document.getElementById('authModal');
    this.modalPuzzle = document.getElementById('puzzleModal');
    this.modalInventory = document.getElementById('inventoryModal');
    this.modalHints = document.getElementById('hintsModal');
    this.modalBadges = document.getElementById('badgesModal');
    this.puzzleModalContent = document.getElementById('puzzleModalBody');
  }

  bindEvents() {
    // First interaction unlocks Web Audio context
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

    // Modal Close Buttons
    document.querySelectorAll('.modal-close-wax-seal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Top HUD Action Buttons
    document.getElementById('btnOpenInventory').addEventListener('click', () => this.openInventoryModal());
    document.getElementById('btnOpenHints').addEventListener('click', () => this.openHintsModal());
    document.getElementById('btnOpenBadges').addEventListener('click', () => this.openBadgesModal());
    document.getElementById('btnQuicksave').addEventListener('click', () => this.quicksaveVoyage());
    document.getElementById('btnNewVoyage').addEventListener('click', () => this.confirmRestartVoyage());
    document.getElementById('captainBadgeBtn').addEventListener('click', () => this.openAuthModal());

    // Discovery strip collect/inspect button
    if (this.elInspectBtn) {
      this.elInspectBtn.addEventListener('click', () => {
        const node = window.storyEngine.getNode(this.state.currentNodeId);
        if (node && node.discoveryItem) {
          const added = window.inventorySystem.addItem(node.discoveryItem);
          if (added) {
            this.showToast(`Acquired: ${node.discoveryName}!`);
            this.updateHUD();
            this.elInspectBtn.textContent = 'In Pouch';
            this.elInspectBtn.disabled = true;
          }
        }
      });
    }

    // Auth tabs
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tab = e.target.getAttribute('data-tab');
        document.getElementById('authRegisterForm').style.display = tab === 'register' ? 'flex' : 'none';
        document.getElementById('authLoginForm').style.display = tab === 'login' ? 'flex' : 'none';
      });
    });

    // Crest selector in register form
    document.querySelectorAll('.crest-option').forEach(crest => {
      crest.addEventListener('click', (e) => {
        document.querySelectorAll('.crest-option').forEach(c => c.classList.remove('selected'));
        crest.classList.add('selected');
        document.getElementById('regCrestInput').value = crest.getAttribute('data-crest');
      });
    });

    // Register Form Submit
    document.getElementById('authRegisterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regCaptainName').value;
      const pass = document.getElementById('regSecretMark').value;
      const title = document.getElementById('regTitleSelect').value;
      const crest = document.getElementById('regCrestInput').value || '☠️';

      const res = window.captainAuth.register(name, pass, title, crest);
      if (res.success) {
        this.showToast(`Welcome aboard, Captain ${res.captain.name}!`);
        this.closeAllModals();
        this.updateHUD();
      } else {
        alert(res.message);
      }
    });

    // Login Form Submit
    document.getElementById('authLoginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('loginCaptainName').value;
      const pass = document.getElementById('loginSecretMark').value;

      const res = window.captainAuth.login(name, pass);
      if (res.success) {
        this.showToast(`Captain ${res.captain.name} returned to the helm!`);
        this.closeAllModals();
        this.resumeSavedVoyage();
        this.updateHUD();
      } else {
        alert(res.message);
      }
    });

    // Play as Guest
    document.getElementById('btnPlayAsGuest').addEventListener('click', () => {
      const guest = window.captainAuth.playAsGuest();
      this.showToast(`Sailing as ${guest.name}!`);
      this.closeAllModals();
      this.updateHUD();
    });

    // Workbench combine action
    document.getElementById('btnWorkbenchCombine').addEventListener('click', () => {
      const res = window.inventorySystem.attemptCombination();
      if (res.success) {
        this.showToast(`Forged: ${res.resultItem.name}!`);
        this.renderInventoryGrid();
        this.renderWorkbenchSlots();
        this.updateHUD();
        // Check if current narrative node has condition updates
        this.renderRightPage(window.storyEngine.getNode(this.state.currentNodeId));
      } else {
        alert(res.message);
      }
    });
  }

  initApp() {
    // Check if user is logged in
    if (!window.captainAuth.isLoggedIn()) {
      this.openAuthModal();
    } else {
      this.resumeSavedVoyage();
    }
    this.renderCurrentNode();
    this.updateHUD();
  }

  resumeSavedVoyage() {
    const saved = window.captainAuth.loadActiveVoyage();
    if (saved) {
      this.state = {
        currentNodeId: saved.currentNodeId || 'act1_start',
        morale: saved.morale !== undefined ? saved.morale : 65,
        dread: saved.dread !== undefined ? saved.dread : 15,
        gold: saved.gold !== undefined ? saved.gold : 25,
        history: saved.history || ['act1_start'],
        solvedPuzzles: saved.solvedPuzzles || []
      };
      if (saved.inventory) {
        window.inventorySystem.loadState(saved.inventory);
      }
      this.showToast("Resumed voyage from ship's log!");
    } else {
      window.inventorySystem.reset();
    }
  }

  quicksaveVoyage() {
    const voyageState = {
      currentNodeId: this.state.currentNodeId,
      morale: this.state.morale,
      dread: this.state.dread,
      gold: this.state.gold,
      history: this.state.history,
      solvedPuzzles: this.state.solvedPuzzles,
      inventory: window.inventorySystem.items
    };

    window.captainAuth.saveActiveVoyage(voyageState);
    if (window.seaAudio) window.seaAudio.playCoinClink();
    this.showToast("Voyage checkpoint saved to Captain's Logbook!");
  }

  confirmRestartVoyage() {
    if (confirm("Are you sure you wish to abandon this voyage and begin anew from Act I?")) {
      this.state = {
        currentNodeId: 'act1_start',
        morale: 65,
        dread: 15,
        gold: 25,
        history: ['act1_start'],
        solvedPuzzles: []
      };
      this.activeEnding = null;
      window.inventorySystem.reset();
      this.quicksaveVoyage();
      if (window.captainAuth) window.captainAuth.unlockAchievement('voyager_reborn');
      this.renderCurrentNode();
      this.updateHUD();
      this.showToast("A new voyage has commenced!");
    }
  }

  updateHUD() {
    const captain = window.captainAuth.getCurrentCaptain() || { name: 'Nameless Mariner', crest: '☠️', title: 'Buccaneer' };
    this.elCaptainName.textContent = captain.name;
    this.elCaptainCrest.textContent = captain.crest;

    this.elMoraleVal.textContent = `${this.state.morale}%`;
    this.elDreadVal.textContent = `${this.state.dread}%`;
    this.elGoldVal.textContent = `${this.state.gold}`;

    const itemCount = window.inventorySystem.items.length;
    this.elInventoryBadge.textContent = itemCount;
  }

  renderCurrentNode() {
    if (window.seaAudio) window.seaAudio.playPageTurn();

    if (this.activeEnding) {
      this.renderEndingView(this.activeEnding);
      return;
    }

    const node = window.storyEngine.getNode(this.state.currentNodeId);
    if (!node) return;

    // Auto-collect node discovery item into inventory
    if (node.discoveryItem) {
      window.inventorySystem.addItem(node.discoveryItem);
    }

    this.renderLeftPage(node);
    this.renderRightPage(node);
    this.quicksaveVoyage();
  }

  renderLeftPage(node) {
    this.elSceneImage.src = node.image;
    this.elChapterNumber.textContent = `${node.act} — ${node.chapterTitle}`;
    this.elChapterLocation.textContent = node.dateStamp.split('—')[1] || 'Sea of Serpents';

    if (node.discoveryItem) {
      this.elDiscoveryStrip.style.display = 'flex';
      const itemData = ARTIFACT_CATALOG[node.discoveryItem];
      this.elDiscoveryIcon.textContent = itemData ? itemData.icon : '✨';
      this.elDiscoveryTitle.textContent = node.discoveryName || (itemData ? itemData.name : 'Relic');
      this.elDiscoveryLore.textContent = node.discoveryLore || '';
      this.elInspectBtn.textContent = 'In Pouch';
      this.elInspectBtn.disabled = true;
    } else {
      this.elDiscoveryStrip.style.display = 'none';
    }

    this.elLoreQuote.innerHTML = node.loreQuote || '“The ocean remembers what men forget.”';
  }

  renderRightPage(node) {
    this.elSceneTitle.textContent = node.chapterTitle;
    this.elDateStamp.textContent = node.dateStamp;
    this.elNarrativeBody.innerHTML = node.text;

    // Check if puzzle is required
    if (node.puzzleType && !this.state.solvedPuzzles.includes(node.puzzleType)) {
      this.elPuzzleBanner.style.display = 'flex';
      document.getElementById('puzzleNameTag').textContent = 
        node.puzzleType === 'caesar' ? 'Caesar Shift Cipher' :
        node.puzzleType === 'nautical' ? 'Nautical Semaphore Signal' : 'Aztec Astrological Dial';

      document.getElementById('btnTriggerPuzzleModal').onclick = () => {
        this.openPuzzleModal(node.puzzleType);
      };
    } else {
      this.elPuzzleBanner.style.display = 'none';
    }

    // Render Choice cards
    this.elChoiceList.innerHTML = '';
    node.choices.forEach(choice => {
      const btn = document.createElement('div');
      btn.className = 'choice-option-btn';

      // Check puzzle condition
      const isPuzzleLocked = choice.isPuzzleTrigger && 
        node.puzzleType && 
        !this.state.solvedPuzzles.includes(node.puzzleType);

      // Check custom inventory condition
      const isCondLocked = choice.condition && !choice.condition(window.inventorySystem);

      if (isPuzzleLocked || isCondLocked) {
        btn.classList.add('locked');
      }

      btn.innerHTML = `
        <div class="choice-title">
          <span>${choice.text}</span>
        </div>
        <div class="choice-description">${choice.desc}</div>
        <div class="consequence-tag ${choice.tag || ''}">${choice.tagText || ''}</div>
      `;

      btn.addEventListener('click', () => {
        if (isPuzzleLocked) {
          this.openPuzzleModal(node.puzzleType);
          return;
        }
        if (isCondLocked) {
          alert(choice.lockedMessage || "You lack the required relic to attempt this path!");
          return;
        }
        this.makeChoice(choice);
      });

      this.elChoiceList.appendChild(btn);
    });

    const pageIdx = this.state.history.length;
    this.elPageNumIndicator.textContent = `Log Entry #${pageIdx} — Isle of Serpents Expedition`;
  }

  makeChoice(choice) {
    // Apply stats changes
    if (choice.effect) {
      if (choice.effect.morale) {
        this.state.morale = Math.max(0, Math.min(100, this.state.morale + choice.effect.morale));
      }
      if (choice.effect.dread) {
        this.state.dread = Math.max(0, Math.min(100, this.state.dread + choice.effect.dread));
      }
      if (choice.effect.gold) {
        this.state.gold = Math.max(0, this.state.gold + choice.effect.gold);
      }
      if (choice.effect.item) {
        window.inventorySystem.addItem(choice.effect.item);
      }
    }

    if (choice.toast) {
      this.showToast(choice.toast);
    }

    if (choice.badge) {
      window.captainAuth.unlockAchievement(choice.badge);
    }

    // Check ending trigger
    if (choice.endingId) {
      this.activeEnding = window.storyEngine.endings[choice.endingId];
      if (choice.endingId === 'ending_pirate_king' && this.state.morale >= 80) {
        window.captainAuth.unlockAchievement('compassionate_captain');
      }
      this.renderCurrentNode();
      return;
    }

    if (choice.next) {
      this.state.currentNodeId = choice.next;
      this.state.history.push(choice.next);
      this.renderCurrentNode();
      this.updateHUD();
    }
  }

  renderEndingView(ending) {
    this.elSceneImage.src = ending.image;
    this.elChapterNumber.textContent = "Voyage Resolution";
    this.elChapterLocation.textContent = "Chronicles of the High Seas";

    this.elSceneTitle.textContent = ending.title;
    this.elDateStamp.textContent = "Recorded in Pirate Legend";
    this.elNarrativeBody.innerHTML = `
      <p><strong>${ending.summary}</strong></p>
      <br>
      <div style="background: rgba(0,0,0,0.1); border: 2px dashed #8b6b3e; padding: 18px; border-radius: 8px;">
        <h3 style="font-family: var(--font-heading); color: var(--ink-red);">CAPTAIN'S FINAL TALLY</h3>
        <p>Final Morale: <strong>${this.state.morale}%</strong></p>
        <p>Final Dread: <strong>${this.state.dread}%</strong></p>
        <p>Doubloons Claimed: <strong>${this.state.gold}</strong></p>
        <p>Relics Recovered: <strong>${window.inventorySystem.items.length}</strong></p>
      </div>
    `;

    this.elPuzzleBanner.style.display = 'none';
    this.elChoiceList.innerHTML = `
      <div class="choice-option-btn" id="btnRestartAfterEnding">
        <div class="choice-title">⚓ Sign New Ship's Articles & Replay Voyage</div>
        <div class="choice-description">Set sail again to discover alternative cryptographic paths and multiple endings.</div>
      </div>
    `;

    document.getElementById('btnRestartAfterEnding').onclick = () => {
      this.confirmRestartVoyage();
    };

    if (window.captainAuth) {
      window.captainAuth.unlockAchievement('voyager_reborn');
    }
  }

  // =========================================================================
  // PUZZLE MODAL
  // =========================================================================
  openPuzzleModal(puzzleType) {
    this.closeAllModals();
    this.modalPuzzle.classList.add('active');

    const titleEl = document.getElementById('puzzleModalTitle');
    const descEl = document.getElementById('puzzleModalDesc');

    if (puzzleType === 'caesar') {
      titleEl.textContent = "Captain Drake's Caesar Shift Dial";
      descEl.textContent = "Rotate the inner cipher disc to align the shift key and decode the waterlogged log.";
      window.puzzleEngine.initCaesarPuzzle(this.puzzleModalContent, () => {
        this.onPuzzleSolved('caesar');
      });
    } else if (puzzleType === 'nautical') {
      titleEl.textContent = "Nautical Semaphore & Maritime Signal Mast";
      descEl.textContent = "Hoist the 4-letter danger warning sequence up the rigging to steer safely through the reef.";
      window.puzzleEngine.initNauticalPuzzle(this.puzzleModalContent, () => {
        this.onPuzzleSolved('nautical');
      });
    } else if (puzzleType === 'aztec') {
      titleEl.textContent = "Aztec Astrological & Celestial Alignment Dial";
      descEl.textContent = "Rotate the Zodiac, Lunar Eclipse, and Serpent Eye into celestial harmony.";
      window.puzzleEngine.initAztecDialPuzzle(this.puzzleModalContent, () => {
        this.onPuzzleSolved('aztec');
      });
    }
  }

  onPuzzleSolved(puzzleType) {
    if (!this.state.solvedPuzzles.includes(puzzleType)) {
      this.state.solvedPuzzles.push(puzzleType);
    }
    this.showToast("Cryptographic riddle conquered!");
    this.closeAllModals();
    this.renderCurrentNode();
    this.updateHUD();
  }

  // =========================================================================
  // INVENTORY POUCH & WORKBENCH MODAL
  // =========================================================================
  openInventoryModal() {
    this.closeAllModals();
    this.modalInventory.classList.add('active');
    this.renderInventoryGrid();
    this.renderWorkbenchSlots();
  }

  renderInventoryGrid() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    const items = window.inventorySystem.getItems();

    for (let i = 0; i < 8; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';

      if (i < items.length) {
        const item = items[i];
        const isSelected = window.inventorySystem.selectedForCombination.includes(item.id);
        if (isSelected) slot.classList.add('selected');

        slot.innerHTML = `
          <div class="inventory-item-icon">${item.icon}</div>
          <div class="inventory-item-name">${item.name}</div>
        `;

        slot.addEventListener('click', () => {
          this.inspectItem(item);
          if (item.canCombine) {
            window.inventorySystem.toggleSelectForCombination(item.id);
            this.renderInventoryGrid();
            this.renderWorkbenchSlots();
          }
        });
      } else {
        slot.classList.add('empty');
        slot.innerHTML = `<span style="color: #665239; font-size: 20px;">🔒</span>`;
      }
      grid.appendChild(slot);
    }
  }

  inspectItem(item) {
    document.getElementById('inspectItemName').textContent = item.name;
    document.getElementById('inspectItemLore').textContent = item.lore;
    document.getElementById('inspectItemCategory').textContent = `Category: ${item.category.toUpperCase()}`;
  }

  renderWorkbenchSlots() {
    const slotA = document.getElementById('workbenchSlotA');
    const slotB = document.getElementById('workbenchSlotB');
    const selected = window.inventorySystem.selectedForCombination;

    if (selected[0] && ARTIFACT_CATALOG[selected[0]]) {
      const item = ARTIFACT_CATALOG[selected[0]];
      slotA.innerHTML = `<div style="font-size: 28px;">${item.icon}</div><div>${item.name}</div>`;
    } else {
      slotA.innerHTML = `Slot 1<br><small>(Select Relic)</small>`;
    }

    if (selected[1] && ARTIFACT_CATALOG[selected[1]]) {
      const item = ARTIFACT_CATALOG[selected[1]];
      slotB.innerHTML = `<div style="font-size: 28px;">${item.icon}</div><div>${item.name}</div>`;
    } else {
      slotB.innerHTML = `Slot 2<br><small>(Select Relic)</small>`;
    }
  }

  // =========================================================================
  // HINTS SYSTEM (3-TIER)
  // =========================================================================
  openHintsModal() {
    this.closeAllModals();
    this.modalHints.classList.add('active');

    const node = window.storyEngine.getNode(this.state.currentNodeId);
    const puzzleType = node ? node.puzzleType : null;
    const hints = window.puzzleEngine.getHintsForPuzzle(puzzleType);

    const container = document.getElementById('hintsContainer');
    container.innerHTML = '';

    hints.forEach((hint, idx) => {
      const card = document.createElement('div');
      card.className = 'hint-tier-card';
      const tierClass = `tier${hint.tier}`;

      card.innerHTML = `
        <div class="hint-header-bar">
          <span class="hint-badge ${tierClass}">Tier ${hint.tier}: ${hint.title}</span>
          <button class="unlock-hint-btn" id="btnUnlockHint_${idx}">Reveal Hint</button>
        </div>
        <div class="hint-content-text" id="hintText_${idx}" style="display: none;">
          ${hint.text}
        </div>
      `;

      const unlockBtn = card.querySelector(`#btnUnlockHint_${idx}`);
      const textEl = card.querySelector(`#hintText_${idx}`);

      unlockBtn.onclick = () => {
        textEl.style.display = 'block';
        unlockBtn.style.display = 'none';
        card.classList.add('unlocked');
        if (window.seaAudio) window.seaAudio.playPageTurn();
      };

      container.appendChild(card);
    });
  }

  // =========================================================================
  // BADGES & ENDINGS CHRONICLE MODAL
  // =========================================================================
  openBadgesModal() {
    this.closeAllModals();
    this.modalBadges.classList.add('active');

    const captain = window.captainAuth.getCurrentCaptain();
    const unlockedBadges = captain && captain.achievements ? captain.achievements : [];

    const badgesContainer = document.getElementById('badgesGridContainer');
    badgesContainer.innerHTML = '';

    Object.values(window.storyEngine.achievements).forEach(badge => {
      const isUnlocked = unlockedBadges.includes(badge.id);
      const card = document.createElement('div');
      card.className = `badge-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="badge-icon-stamp">${badge.icon}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-desc">${badge.desc}</div>
        <div style="font-size: 10px; font-weight: bold; margin-top: 4px; color: ${isUnlocked ? '#2b6e4e' : '#888'};">
          ${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
        </div>
      `;
      badgesContainer.appendChild(card);
    });

    const endingsContainer = document.getElementById('endingsArchiveContainer');
    endingsContainer.innerHTML = '';

    Object.values(window.storyEngine.endings).forEach(ending => {
      const item = document.createElement('div');
      item.className = 'ending-archive-item';
      item.innerHTML = `
        <div>
          <strong style="font-family: var(--font-heading); color: var(--ink-primary);">${ending.title}</strong>
          <p style="font-size: 13px; color: var(--ink-secondary); margin-top: 2px;">${ending.summary}</p>
        </div>
      `;
      endingsContainer.appendChild(item);
    });
  }

  // =========================================================================
  // AUTH MODAL
  // =========================================================================
  openAuthModal() {
    this.closeAllModals();
    this.modalAuth.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  showToast(message) {
    const toast = document.getElementById('voyageToast');
    if (!toast) return;
    toast.innerHTML = `<span>⚓</span><span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new LostTreasureApp();
});
