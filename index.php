<?php
/**
 * LOST TREASURE: PS #07 — THE LOST TREASURE HUNT
 * Interactive Branching Sea Lore Puzzle Adventure
 * Protected by Captain Session Authentication
 */
session_start();

// If not authenticated, redirect to standalone login
if (!isset($_SESSION['captain_id'])) {
    header("Location: login.php");
    exit;
}

$captain_name = htmlspecialchars($_SESSION['captain_name'] ?? 'The Nameless Mariner');
$captain_title = htmlspecialchars($_SESSION['captain_title'] ?? 'Buccaneer');
$captain_crest = htmlspecialchars($_SESSION['captain_crest'] ?? '☠️');
$is_guest = !empty($_SESSION['is_guest']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lost Treasure: The Isle of Serpents | PS #07 Hackathon</title>
  <meta name="description" content="An interactive branching sea puzzle adventure combining cryptographic sea riddles, inventory discovery mechanics, moral captain decisions, and diverse treasure endings.">
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚓</text></svg>">
  
  <!-- Three.js 3D WebGL Library & Custom Procedural 3D Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="js/three_models.js"></script>
</head>
<body>

  <!-- Ambient Sea Atmosphere & Weather Layers -->
  <div class="sea-atmosphere-layer"></div>
  <div class="ambient-fog"></div>
  <div class="storm-flash" id="stormFlash"></div>

  <!-- Top Persistent Captain HUD Bar -->
  <header class="captain-header-hud">
    <div class="hud-container">
      
      <!-- Brand & 3D Aztec Coin -->
      <div class="brand-section">
        <div id="hud3DCoin" style="width: 44px; height: 44px; cursor: grab;" title="3D Aztec Gold Doubloon (Drag to spin)"></div>
        <div class="game-title-group">
          <h1>LOST TREASURE</h1>
          <span class="subtitle">PS #07 • The Isle of Serpents</span>
        </div>
      </div>

      <!-- Live Voyage Clock & Location Badge -->
      <div class="hud-clock-widget" title="Expedition Elapsed Voyage Time">
        <span>⏱️</span>
        <strong id="hudGameTimer">00:00:00</strong>
      </div>

      <div class="hud-location-badge" id="hudLocationBadge" title="Current Location in Uncharted Waters">
        <span>📍</span>
        <span id="hudLocationText">Gulf of Shadows</span>
      </div>

      <!-- Persistent 5 Navigation Tabs -->
      <nav class="screen-nav-container" aria-label="Game Navigation">
        <button class="screen-nav-tab active" data-screen="screenLog" id="tabScreenLog" title="Screen 1: Captain's Log & Story Chapters">
          ⚓ Log
        </button>
        <button class="screen-nav-tab" data-screen="screenMap" id="tabScreenMap" title="Screen 2: Interactive Pirate Map of 7 Locations">
          🗺️ Sea Map
        </button>
        <button class="screen-nav-tab" data-screen="screenCipher" id="tabScreenCipher" title="Screen 3: 3D Riddle & Cipher Chamber">
          🔐 Ciphers
        </button>
        <button class="screen-nav-tab" data-screen="screenInventory" id="tabScreenInventory" title="Screen 4: 20-Slot Relic Inventory & Crew Status">
          🎒 Crew & Relics
        </button>
        <button class="screen-nav-tab" data-screen="screenEndings" id="tabScreenEndings" title="Screen 5: Final Chamber & 4 Branching Endings">
          💎 Final Hoard
        </button>
      </nav>

      <!-- Mini Crew Meters in HUD -->
      <div class="crew-meters-cluster">
        <div class="crew-meter-pill" title="Captain Health">
          <div class="meter-header">
            <span>Health</span>
            <span id="miniHealthVal">100%</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill health" id="miniHealthFill" style="width: 100%;"></div>
          </div>
        </div>
        <div class="crew-meter-pill" title="Crew Morale">
          <div class="meter-header">
            <span>Morale</span>
            <span id="miniMoraleVal">80%</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill morale" id="miniMoraleFill" style="width: 80%;"></div>
          </div>
        </div>
        <div class="crew-meter-pill" title="Ship Supplies">
          <div class="meter-header">
            <span>Supplies</span>
            <span id="miniSuppliesVal">65%</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill supplies" id="miniSuppliesFill" style="width: 65%;"></div>
          </div>
        </div>
      </div>

      <!-- Quick Action Controls -->
      <div class="hud-actions">
        <div class="stat-item gold" title="Spanish Gold Doubloons" style="padding: 4px 10px; font-size: 13px;">
          <span class="stat-icon">🪙</span>
          <span class="stat-value" id="goldValue">25</span>
        </div>

        <button class="hud-btn" id="btnQuicksave" title="Save voyage state to MySQL Database">
          💾 Save
        </button>

        <button class="hud-btn audio-toggle-btn" id="btnToggleAudio" title="Toggle sea ambiance and sound effects">
          🔊 <span class="badge-pill">ON</span>
        </button>

        <div class="captain-identity-tag" title="Mariner Title: <?= $captain_title ?>">
          <span>Capt:</span>
          <strong id="captainNameDisplay"><?= $captain_name ?></strong>
        </div>

        <a href="logout.php" class="hud-btn" style="text-decoration: none; border-color: #8b1e1e;" title="Abandon ship and return to port">
          🚪 Logout
        </a>
      </div>

    </div>
  </header>

  <!-- =========================================================================
       SCREEN 1: CAPTAIN'S LOG & HERO LAUNCHPAD
       ========================================================================= -->
  <section class="game-screen active" id="screenLog">
    
    <!-- Hero Banner with Aztec Lore Intro -->
    <div class="hero-stage-card">
      <div class="hero-content-inner">
        <span class="hero-tag">PS #07 Hackathon • Challenge Brief</span>
        <h1>THE LOST TREASURE HUNT</h1>
        <p class="hero-lore-paragraph">
          “A waterlogged captain's log salvaged from a ghost ship details an ancient Aztec hoard 
          buried beneath the Isle of Serpents. Solve cryptographic sea riddles, chart unknown routes, 
          manage your crew, and make moral decisions that will determine whether you claim eternal wealth 
          or fall victim to a cursed skeletal fate.”
        </p>

        <div class="hero-action-row">
          <button class="btn-hero-primary" id="btnHeroBeginVoyage">
            🗺️ Set Sail to Pirate Map ➔
          </button>
          
          <div class="hero-progress-meter">
            <span style="font-size: 13px; color: #bfa980; text-transform: uppercase;">Voyage Progress:</span>
            <span class="progress-dial-number" id="voyageProgressText">15%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Gameplay Feature Cards -->
    <div class="gameplay-pillars-grid">
      <div class="pillar-card" id="cardPillarExplore">
        <span class="pillar-icon">🧭</span>
        <h3>1. Chart Uncharted Seas</h3>
        <p>Explore 7 dangerous nautical locations from Dead Man's Reef to the Isle of Serpents on an animated pirate chart.</p>
      </div>

      <div class="pillar-card" id="cardPillarDecrypt">
        <span class="pillar-icon">🔐</span>
        <h3>2. Decrypt Ancient Ciphers</h3>
        <p>Rotate the 3D Caesar cipher dial, decode semaphore flag signals, and align Aztec astrological runes.</p>
      </div>

      <div class="pillar-card" id="cardPillarCollect">
        <span class="pillar-icon">🎒</span>
        <h3>3. Collect 3D Relics</h3>
        <p>Gather 20 inventory artifacts with rarity ranks, inspect interactive 3D models, and combine items on the alchemical workbench.</p>
      </div>

      <div class="pillar-card" id="cardPillarChoose">
        <span class="pillar-icon">⚖️</span>
        <h3>4. Moral Decisions</h3>
        <p>Choose between greed, honor, sacrifice, and wisdom to unlock 4 diverse endings and compute your captain score.</p>
      </div>
    </div>

    <!-- The Captain's Waterlogged Log Manuscript Tome -->
    <div class="adventure-stage" style="perspective: 1400px; transform-style: preserve-3d; margin-top: 10px;">
      <div class="manuscript-tome">
        <div class="bookmark-ribbon"></div>

        <!-- LEFT PAGE: SCENE ILLUSTRATION & DISCOVERY STRIP -->
        <section class="manuscript-page left-page">
          <div class="page-chapter-seal">
            <span class="chapter-number" id="chapterNumber">Act I — The Derelict in the Tempest</span>
            <span class="chapter-location" id="chapterLocation">Gulf of Shadows</span>
          </div>

          <div class="scene-illustration-frame">
            <div class="frame-corner top-left"></div>
            <div class="frame-corner top-right"></div>
            <div class="frame-corner bottom-left"></div>
            <div class="frame-corner bottom-right"></div>
            <img src="assets/images/ghost_ship_storm.jpg" alt="Scene Illustration" class="scene-image" id="sceneImage">
          </div>

          <!-- Relic Discovery Strip -->
          <div class="scene-discovery-strip" id="discoveryStrip">
            <div class="discovery-info">
              <div class="discovery-icon-bubble" id="discoveryIcon">🧭</div>
              <div class="discovery-text">
                <h4 id="discoveryTitle">Brass Navigational Astrolabe</h4>
                <p id="discoveryLore">Recovered from the drowned navigator's chest.</p>
              </div>
            </div>
            <button class="discovery-inspect-btn" id="discoveryInspectBtn">Collect to Pouch</button>
          </div>

          <!-- Lore Quote -->
          <div class="manuscript-lore-quote">
            <p id="loreQuoteText">“Beware the ship that sails with no wind, for its cargo is paid in souls.”</p>
            <span class="author">— Excerpt from Captain Drake's Waterlogged Log</span>
          </div>
        </section>

        <!-- RIGHT PAGE: NARRATIVE PROSE & BRANCHING DECISION FORK -->
        <section class="manuscript-page right-page">
          <div class="narrative-header-block">
            <div class="log-date-stamp" id="dateStamp">October 14th, 1718 — 21° North</div>
            <h2 class="scene-title" id="sceneTitle">The Derelict in the Tempest</h2>
          </div>

          <div class="narrative-body-text" id="narrativeBody">
            <p>
              A tempest howls with feral fury as your brigantine pulls alongside the black hull of the <em>El Cazador</em>. 
              The Spanish galleon drifted out of the mist like a vengeful specter—shrouded in eerie teal lanterns, its canvas sails torn to ribbons.
            </p>
          </div>

          <!-- Cipher Trigger Card -->
          <div class="puzzle-challenge-card" id="puzzleBanner" style="display: none;">
            <div class="challenge-details">
              <h4>📜 Cryptographic Sea Riddle: <span id="puzzleNameTag">Caesar Shift Cipher</span></h4>
              <p>Solve this nautical riddle to decipher coordinates and unlock uncharted islands on the map!</p>
            </div>
            <button class="open-puzzle-btn" id="btnTriggerPuzzleModal">Open Cipher Chamber</button>
          </div>

          <!-- Moral Decision Choices List -->
          <div class="decision-fork-section">
            <div class="decision-section-label">Captain's Moral Decision</div>
            <div class="choice-cards-list" id="choiceList">
              <!-- Populated dynamically by story.js -->
            </div>
          </div>

          <div class="page-navigation-footer">
            <span class="page-num-indicator" id="pageNumIndicator">Log Entry #1 — Isle of Serpents Expedition</span>
            <button class="history-back-btn" id="btnHistoryBack" style="display: none;">
              ← Previous Log Entry
            </button>
          </div>
        </section>
      </div>
    </div>

  </section>

  <!-- =========================================================================
       SCREEN 2: INTERACTIVE PIRATE MAP & UNCHARTED SEAS
       ========================================================================= -->
  <section class="game-screen" id="screenMap">
    <div class="map-chamber-wrapper">
      
      <div class="map-header-bar">
        <div>
          <h2>🗺️ UNCHARTED PIRATE CHART: 7 LOCATIONS</h2>
          <p style="font-size: 14px; color: #aebfd1;">Decryptions and navigation choices unlock safe passage through the fog of war.</p>
        </div>

        <div class="map-legend-items">
          <div><span class="legend-dot current"></span> Current Anchor</div>
          <div><span class="legend-dot unlocked"></span> Charted Port</div>
          <div><span class="legend-dot locked"></span> Shrouded in Fog</div>
        </div>
      </div>

      <!-- Parchment Chart Stage -->
      <div class="parchment-chart-canvas" id="parchmentChartStage">
        
        <!-- SVG Navigation Routes -->
        <svg class="chart-svg-layer" viewBox="0 0 1000 600" preserveAspectRatio="none">
          <!-- Route 1: Ghost Ship to Skull Island -->
          <path id="route-ghost-skull" class="voyage-svg-route" d="M 120,450 Q 200,320 280,210" />
          
          <!-- Route 2: Ghost Ship to Dead Man's Reef -->
          <path id="route-ghost-reef" class="voyage-svg-route" d="M 120,450 Q 270,520 420,480" />

          <!-- Route 3: Skull Island to Isle of Serpents -->
          <path id="route-skull-serpents" class="voyage-svg-route" d="M 280,210 Q 430,230 580,270" />

          <!-- Route 4: Reef to Isle of Serpents -->
          <path id="route-reef-serpents" class="voyage-svg-route" d="M 420,480 Q 500,400 580,270" />

          <!-- Route 5: Isle of Serpents to Ancient Temple -->
          <path id="route-serpents-temple" class="voyage-svg-route locked-route" d="M 580,270 Q 650,200 720,150" />

          <!-- Route 6: Isle of Serpents to Forbidden Cove -->
          <path id="route-serpents-cove" class="voyage-svg-route locked-route" d="M 580,270 Q 700,350 820,420" />

          <!-- Route 7: Temple & Cove to Hidden Treasure -->
          <path id="route-temple-treasure" class="voyage-svg-route locked-route" d="M 720,150 Q 820,190 920,240" />
          <path id="route-cove-treasure" class="voyage-svg-route locked-route" d="M 820,420 Q 870,330 920,240" />
        </svg>

        <!-- Compass Rose Decoration -->
        <div class="chart-compass-rose">
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#8b6b3e" stroke-width="1.5" stroke-dasharray="3 3"/>
            <polygon points="50,5 57,40 50,35 43,40" fill="#8b1e1e" />
            <polygon points="50,95 57,60 50,65 43,60" fill="#23190e" />
            <polygon points="95,50 60,57 65,50 60,43" fill="#23190e" />
            <polygon points="5,50 40,57 35,50 40,43" fill="#23190e" />
            <circle cx="50" cy="50" r="4" fill="#d4af37"/>
            <text x="47" y="18" font-family="'Cinzel', serif" font-size="10" font-weight="bold" fill="#8b1e1e">N</text>
          </svg>
        </div>

        <div class="sea-monster-icon" title="Here be Sea Serpents">🐉</div>

        <!-- Moving Ship Marker -->
        <div class="moving-ship-marker" id="movingShipMarker" style="left: 12%; top: 75%;" title="The Brigantine Black Gull">
          ⛵
        </div>

        <!-- Location 1: Ghost Ship (Starting) -->
        <div class="map-location-pin current" id="pin-ghost-ship" style="left: 12%; top: 75%;" data-loc="ghost_ship">
          <div class="pin-marker-body">👻</div>
          <span class="pin-label-tag">1. Ghost Ship</span>
        </div>

        <!-- Location 2: Skull Island -->
        <div class="map-location-pin unlocked" id="pin-skull-island" style="left: 28%; top: 35%;" data-loc="skull_island">
          <div class="pin-marker-body">💀</div>
          <span class="pin-label-tag">2. Skull Island</span>
        </div>

        <!-- Location 3: Dead Man's Reef -->
        <div class="map-location-pin unlocked" id="pin-dead-mans-reef" style="left: 42%; top: 80%;" data-loc="dead_mans_reef">
          <div class="pin-marker-body">🪸</div>
          <span class="pin-label-tag">3. Dead Man's Reef</span>
        </div>

        <!-- Location 4: Isle of Serpents -->
        <div class="map-location-pin unlocked" id="pin-isle-of-serpents" style="left: 58%; top: 45%;" data-loc="isle_of_serpents">
          <div class="pin-marker-body">🐍</div>
          <span class="pin-label-tag">4. Isle of Serpents</span>
        </div>

        <!-- Fog of War covering Eastern Uncharted Waters -->
        <div class="fog-of-war-region" id="fogEasternSeas" style="left: 80%; top: 40%;"></div>

        <!-- Location 5: Ancient Temple -->
        <div class="map-location-pin locked" id="pin-ancient-temple" style="left: 72%; top: 25%;" data-loc="ancient_temple">
          <div class="pin-marker-body">🏛️</div>
          <span class="pin-label-tag">5. Ancient Temple</span>
        </div>

        <!-- Location 6: Forbidden Cove -->
        <div class="map-location-pin locked" id="pin-forbidden-cove" style="left: 82%; top: 70%;" data-loc="forbidden_cove">
          <div class="pin-marker-body">🏝️</div>
          <span class="pin-label-tag">6. Forbidden Cove</span>
        </div>

        <!-- Location 7: Hidden Treasure Hoard -->
        <div class="map-location-pin locked" id="pin-hidden-treasure" style="left: 92%; top: 40%;" data-loc="hidden_treasure">
          <div class="pin-marker-body">💎</div>
          <span class="pin-label-tag">7. Aztec Hoard</span>
        </div>

        <!-- Location Popup Modal / Info Card -->
        <div class="map-location-popup" id="mapLocationPopup">
          <div class="popup-close-btn" id="btnCloseMapPopup">✕</div>
          <h4 class="popup-title" id="mapPopupTitle">Location Title</h4>
          <p class="popup-lore" id="mapPopupLore">Location lore will appear here.</p>
          <button class="popup-action-btn" id="btnPopupAction">Sail to Location</button>
        </div>

      </div>

    </div>
  </section>

  <!-- =========================================================================
       SCREEN 3: RIDDLE & CIPHER CHAMBER
       ========================================================================= -->
  <section class="game-screen" id="screenCipher">
    <div class="cipher-chamber-stage" id="cipherChamberStage">
      
      <!-- Ambient Candles -->
      <div class="cipher-ambient-candle candle-left"></div>
      <div class="cipher-ambient-candle candle-right"></div>

      <div class="cipher-split-layout">
        
        <!-- Left: 3D Caesar Cipher Wheel Canvas -->
        <div class="cipher-wheel-viewport">
          <h3 style="font-family: var(--font-heading); color: var(--gold-light); margin-bottom: 6px;">
            3D BRONZE CIPHER WHEEL
          </h3>
          <p style="font-size: 13px; color: #b7c8d9; margin-bottom: 12px;">
            Drag the 3D mechanism to align alphabet letters or use the shift buttons below.
          </p>

          <div class="wheel-canvas-box" id="cipherWheel3DCanvas"></div>

          <div class="wheel-controls-strip">
            <button class="cipher-shift-btn" id="btnShiftDec" title="Rotate counter-clockwise">-</button>
            <span class="shift-readout-badge" id="shiftReadoutBadge">Shift: +3</span>
            <button class="cipher-shift-btn" id="btnShiftInc" title="Rotate clockwise">+</button>
          </div>
        </div>

        <!-- Right: Parchment Challenge Desk -->
        <div class="cipher-desk-parchment">
          <h3 class="cipher-quest-title" id="cipherRiddleTitle">Riddle of the Moon Altar</h3>
          
          <div class="cipher-quest-meta">
            <span>CHALLENGE: CAESAR SHIFT CIPHER</span>
            <span id="cipherTargetIsland">TARGET: SKULL ISLAND</span>
          </div>

          <p style="font-size: 15px; color: var(--ink-secondary); margin-bottom: 12px;" id="cipherCluePrompt">
            “The logbook page has been scrambled by water and ink. Shift each glyph to decipher the hidden navigational coordinates:”
          </p>

          <div class="cipher-encrypted-box" id="cipherEncryptedBox">
            WKH VHUSHQW VSLUH
          </div>

          <div class="cipher-input-row">
            <input type="text" class="cipher-text-input" id="cipherInput" placeholder="Enter Decoded Answer..." autocomplete="off">
            <button class="cipher-submit-btn" id="btnSubmitCipher">Decrypt</button>
          </div>

          <!-- Hints Banner -->
          <div class="cipher-hints-banner">
            <div>
              <span>💡 Hints Remaining: </span>
              <strong id="hintsRemainingBadge">3 / 3</strong>
            </div>
            <button class="btn-use-hint" id="btnUseCipherHint">Reveal Clue</button>
          </div>
          <p id="cipherHintText" style="font-size: 13px; color: var(--ink-red); margin-top: 8px; font-style: italic; display: none;"></p>

          <!-- Victory Notification Card -->
          <div class="location-unlocked-card" id="locationUnlockedCard">
            <h4>✨ DECRYPTION SUCCESSFUL!</h4>
            <p id="locationUnlockedMsg">Coordinates unlocked! Skull Island is now charted on your map.</p>
            <button class="btn-plot-map" id="btnPlotOnMap">🗺️ Plot Route on Map ➔</button>
          </div>

        </div>

      </div>

    </div>
  </section>

  <!-- =========================================================================
       SCREEN 4: CAPTAIN'S INVENTORY & CREW QUARTERS
       ========================================================================= -->
  <section class="game-screen" id="screenInventory">
    <div class="inventory-stage-wrapper">
      
      <!-- Left: 20-Slot Relic Pouch -->
      <div class="inventory-pouch-chamber">
        <div class="inventory-header">
          <div>
            <h2>🎒 CAPTAIN'S RELIC POUCH (20 SLOTS)</h2>
            <p style="font-size: 13.5px; color: #c9baa0;">Click any discovered artifact to inspect its 3D model and properties.</p>
          </div>
          <span style="font-family: var(--font-heading); font-size: 14px; color: var(--gold-light);" id="inventoryCountDisplay">
            3 / 20 Discovered
          </span>
        </div>

        <div class="slots-grid-20" id="inventorySlotsGrid20">
          <!-- Populated dynamically: 20 slots with rarity tags -->
        </div>

        <!-- Alchemical Combination Workbench -->
        <div class="combination-workbench" style="margin-top: 20px;">
          <h4 style="font-family: var(--font-heading); color: var(--ink-primary); text-align: center; margin-bottom: 10px;">
            Alchemical Combination Workbench (Select 2 combinable relics)
          </h4>
          <div class="workbench-slots-row">
            <div class="combine-target-slot" id="screenWorkbenchSlotA">Slot 1<br><small>(Select Relic)</small></div>
            <span class="combine-plus-sign">+</span>
            <div class="combine-target-slot" id="screenWorkbenchSlotB">Slot 2<br><small>(Select Relic)</small></div>
          </div>
          <button class="combine-action-btn" id="btnScreenWorkbenchCombine">Forge Combined Relic</button>
        </div>
      </div>

      <!-- Right: 3D Relic Inspector & Crew Quarters -->
      <div class="inspector-crew-panel">
        
        <!-- 3D Relic Inspector -->
        <div class="item-3d-inspector-card">
          <span style="font-family: var(--font-heading); font-size: 12px; color: var(--sea-cyan); letter-spacing: 2px; text-transform: uppercase;">
            3D RELIC INSPECTOR
          </span>
          <div class="inspector-canvas-box" id="relic3DCanvas" title="Drag to rotate 3D artifact"></div>
          <h3 class="inspector-item-title" id="inspectorItemTitle">Brass Navigational Astrolabe</h3>
          <span id="inspectorItemRarity" class="rarity-tag rarity-rare" style="position: static; display: inline-block; margin-top: 4px;">RARE</span>
          <p class="inspector-item-lore" id="inspectorItemLore">
            A 16th-century astronomical dial. Its sight vanes track polar stars and secret Aztec planetary alignments.
          </p>
        </div>

        <!-- Crew Quarters Dashboard -->
        <div class="crew-quarters-card">
          <h3>⚓ CREW & SHIP STATUS</h3>
          
          <div class="crew-meter-row">
            <div class="crew-meter-label">
              <span>Captain Vitality & Health</span>
              <strong id="detailHealthVal">100%</strong>
            </div>
            <div class="crew-meter-bar-lg">
              <div class="meter-fill health" id="detailHealthFill" style="width: 100%;"></div>
            </div>
          </div>

          <div class="crew-meter-row">
            <div class="crew-meter-label">
              <span>Crew Loyalty & Morale</span>
              <strong id="detailMoraleVal">80%</strong>
            </div>
            <div class="crew-meter-bar-lg">
              <div class="meter-fill morale" id="detailMoraleFill" style="width: 80%;"></div>
            </div>
          </div>

          <div class="crew-meter-row">
            <div class="crew-meter-label">
              <span>Fresh Water & Ship Rations</span>
              <strong id="detailSuppliesVal">65%</strong>
            </div>
            <div class="crew-meter-bar-lg">
              <div class="meter-fill supplies" id="detailSuppliesFill" style="width: 65%;"></div>
            </div>
          </div>

          <p style="font-size: 12px; color: #aebfd1; font-style: italic; margin-top: 10px;">
            High morale prevents mutiny at sea. Moral choices in Act III heavily influence crew survival and score.
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- =========================================================================
       SCREEN 5: FINAL CHAMBER & 4 BRANCHING ENDINGS
       ========================================================================= -->
  <section class="game-screen" id="screenEndings">
    <div class="final-chamber-wrapper">
      
      <div class="final-chamber-hero-banner">
        <span class="hero-tag">THE CRYPT OF TONATIUH • THE ISLE OF SERPENTS</span>
        <h1>THE FINAL CHAMBER & MORAL RECKONING</h1>
        <p class="final-chamber-lore">
          Before you lies the glittering Aztec hoard—mounds of gold chalices, jade vipers, and the radiant Sun Medallion. 
          Ancient glyphs on the crypt wall pulse with an eerie teal phosphorescence. 
          Your crew stands behind you with bated breath. What shall be the legacy of your voyage?
        </p>
      </div>

      <!-- 4 Moral Captain Decisions -->
      <div class="moral-decisions-grid" id="moralDecisionsGrid">
        
        <!-- Option A: Greed -->
        <div class="decision-choice-card" data-ending="greed">
          <div>
            <span class="choice-header-tag">MORAL PATH A • GREED</span>
            <h3>Claim the Aztec Gold for Yourself</h3>
            <p>Order your officers to load the gold onto the longboats under armed guard, keeping the vast riches for your own vault.</p>
          </div>
          <button class="btn-select-decision">Select: Claim Wealth ➔</button>
        </div>

        <!-- Option B: Honor -->
        <div class="decision-choice-card" data-ending="honor">
          <div>
            <span class="choice-header-tag">MORAL PATH B • HONOR</span>
            <h3>Share the Hoard Equally with the Crew</h3>
            <p>Divide every gold doubloon and gem evenly among your sailors, cementing eternal loyalty as a righteous Pirate Lord.</p>
          </div>
          <button class="btn-select-decision">Select: Share Hoard ➔</button>
        </div>

        <!-- Option C: Sacrifice -->
        <div class="decision-choice-card" data-ending="sacrifice">
          <div>
            <span class="choice-header-tag">MORAL PATH C • SACRIFICE</span>
            <h3>Destroy the Crypt & Break the Aztec Curse</h3>
            <p>Ignite the black powder barrels to collapse the cursed chambers into the sea, saving your men from supernatural damnation.</p>
          </div>
          <button class="btn-select-decision">Select: Break Curse ➔</button>
        </div>

        <!-- Option D: Wisdom -->
        <div class="decision-choice-card" data-ending="wisdom">
          <div>
            <span class="choice-header-tag">MORAL PATH D • WISDOM</span>
            <h3>Seal the Chambers & Keep the Legend Secret</h3>
            <p>Lock the Sun Door with the Serpent Key and burn the navigation charts, preserving the hoard as an eternal sea myth.</p>
          </div>
          <button class="btn-select-decision">Select: Keep Secret ➔</button>
        </div>

      </div>

      <!-- Dynamic Ending Resolution Card -->
      <div class="ending-resolution-card" id="endingResolutionCard">
        <div class="ending-image-frame">
          <img src="assets/images/treasure_hoard.jpg" alt="Ending Resolution Artwork" id="endingHeroImage">
        </div>
        
        <div class="ending-body-content">
          <h2 class="ending-title-tag" id="endingTitleTag">The Golden Captain</h2>
          <p class="ending-prose" id="endingProseText">
            The crew roars in adulation as chests of Aztec gold are divided evenly. You are crowned Pirate King of the West Indies!
          </p>

          <!-- Final Score Calculation Box -->
          <div class="voyage-score-box">
            <div class="score-title-row">
              <h4>FINAL VOYAGE PERFORMANCE SCORE</h4>
              <div class="score-number-display" id="finalScoreDisplay">875 / 1000</div>
            </div>

            <div class="score-breakdown-grid">
              <div class="score-col">
                <span>Riddles Decrypted:</span>
                <strong id="scoreRiddlesVal">3 (+750)</strong>
              </div>
              <div class="score-col">
                <span>Relics Discovered:</span>
                <strong id="scoreRelicsVal">4 (+300)</strong>
              </div>
              <div class="score-col">
                <span>Locations Charted:</span>
                <strong id="scoreLocationsVal">5 (+500)</strong>
              </div>
              <div class="score-col">
                <span>Hints Penalty:</span>
                <strong id="scoreHintsVal">1 (-50)</strong>
              </div>
            </div>
          </div>

          <div class="ending-actions-row">
            <button class="btn-ending-action" id="btnRestartGame">🔄 Sail a New Voyage</button>
            <button class="btn-ending-secondary" id="btnReturnToMap">🗺️ Return to Sea Chart</button>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Dynamic Voyage Toast Notification -->
  <div class="voyage-toast" id="voyageToast">
    <span>⚓</span>
    <span id="toastMessage">Voyage checkpoint recorded.</span>
  </div>

  <!-- Application Scripts -->
  <script src="js/audio.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/inventory.js"></script>
  <script src="js/puzzles.js"></script>
  <script src="js/story.js"></script>
  <script src="js/app.js"></script>

</body>
</html>
