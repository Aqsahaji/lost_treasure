<?php
/**
 * LOST TREASURE: THE ISLE OF SERPENTS
 * Main Game Page (Protected by Session Authentication)
 */
session_start();

// If not logged in, redirect to standalone login page
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
  <title>Lost Treasure: The Isle of Serpents | Cryptographic Sea Narrative</title>
  <meta name="description" content="An interactive sea narrative game combining cryptographic sea riddles, inventory discovery mechanics, moral captain decisions, and branching paths to ancient Aztec hoard endings.">
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚓</text></svg>">
</head>
<body>

  <!-- Ambient Environmental Atmosphere Layers -->
  <div class="sea-atmosphere-layer"></div>
  <div class="ambient-fog"></div>
  <div class="storm-flash" id="stormFlash"></div>

  <!-- Top Captain HUD Bar -->
  <header class="captain-header-hud">
    <div class="hud-container">
      
      <!-- Brand & Ship Crest -->
      <div class="brand-section">
        <div class="ship-crest-icon" id="captainCrestDisplay"><?= $captain_crest ?></div>
        <div class="game-title-group">
          <h1>LOST TREASURE</h1>
          <span class="subtitle">The Isle of Serpents • Sea Lore Adventure</span>
        </div>
      </div>

      <!-- Morale, Dread, Gold Trackers -->
      <div class="captain-stats-cluster">
        <div class="stat-item morale" title="Crew Morale: High morale prevents mutiny and unlocks cooperative endings">
          <span class="stat-icon">⚓</span>
          <span>Morale:</span>
          <span class="stat-value" id="moraleValue">65%</span>
        </div>
        <div class="stat-item dread" title="Dread: Fear and supernatural Aztec curses lingering over the crew">
          <span class="stat-icon">💀</span>
          <span>Dread:</span>
          <span class="stat-value" id="dreadValue">15%</span>
        </div>
        <div class="stat-item gold" title="Spanish Gold Doubloons collected during expedition">
          <span class="stat-icon">🪙</span>
          <span>Doubloons:</span>
          <span class="stat-value" id="goldValue">25</span>
        </div>
      </div>

      <!-- Action Navigation Buttons -->
      <div class="hud-actions">
        <button class="hud-btn primary-highlight" id="btnOpenInventory" title="Inspect relic pouch and combine artifacts">
          🎒 Relic Pouch <span class="badge-pill" id="inventoryBadgeCount">1</span>
        </button>

        <button class="hud-btn" id="btnOpenHints" title="Consult the 3-Tier progressive hint system">
          💡 Hints
        </button>

        <button class="hud-btn" id="btnOpenBadges" title="View unlocked achievement badges and endings">
          🏆 Chronicles
        </button>

        <button class="hud-btn" id="btnQuicksave" title="Save current voyage checkpoint to Database">
          💾 Save Log
        </button>

        <button class="hud-btn" id="btnNewVoyage" title="Restart a new expedition">
          🔄 Replay
        </button>

        <button class="hud-btn audio-toggle-btn" id="btnToggleAudio" title="Toggle sea ambiance and sound effects">
          🔊 <span class="badge-pill">ON</span>
        </button>

        <!-- Captain Profile Badge & Logout -->
        <div class="captain-identity-tag" title="Mariner: <?= $captain_title ?>">
          <span>Capt:</span>
          <strong id="captainNameDisplay"><?= $captain_name ?></strong>
        </div>

        <a href="logout.php" class="hud-btn" style="text-decoration: none; border-color: #8b1e1e;" title="Leave the helm and return to port">
          🚪 Logout
        </a>
      </div>

    </div>
  </header>

  <!-- Main Adventure Manuscript Stage -->
  <main class="adventure-stage">
    <div class="manuscript-tome">
      <div class="bookmark-ribbon"></div>

      <!-- LEFT PAGE: SCENE ILLUSTRATION, DISCOVERY STRIP, ENVIRONMENTAL LORE -->
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

        <!-- Relic / Artifact Discovery Spotter -->
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

        <!-- Lore Quote from Mariner Lore -->
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

        <!-- Parchment Narrative Text -->
        <div class="narrative-body-text" id="narrativeBody">
          <p>
            A tempest howls with feral fury as your brigantine pulls alongside the black hull of the <em>El Cazador</em>. 
            The Spanish galleon drifted out of the mist like a vengeful specter—shrouded in eerie teal lanterns, its canvas sails torn to ribbons.
          </p>
        </div>

        <!-- Cryptographic Puzzle Trigger Announcement Banner -->
        <div class="puzzle-challenge-card" id="puzzleBanner" style="display: none;">
          <div class="challenge-details">
            <h4>📜 Cryptographic Sea Riddle: <span id="puzzleNameTag">Caesar Shift Cipher</span></h4>
            <p>You must solve this nautical riddle to decipher the navigation route.</p>
          </div>
          <button class="open-puzzle-btn" id="btnTriggerPuzzleModal">Solve Riddle</button>
        </div>

        <!-- Moral Captain Decisions & Branching Options -->
        <div class="decision-fork-section">
          <div class="decision-section-label">Captain's Moral Decision</div>
          <div class="choice-cards-list" id="choiceList">
            <!-- Dynamically populated choices -->
          </div>
        </div>

        <!-- Page Turn Footer -->
        <div class="page-navigation-footer">
          <span class="page-num-indicator" id="pageNumIndicator">Log Entry #1 — Isle of Serpents Expedition</span>
          <button class="history-back-btn" id="btnHistoryBack" style="display: none;">
            ← Previous Log Entry
          </button>
        </div>

      </section>

    </div>
  </main>

  <!-- =========================================================================
       MODAL 1: INTERACTIVE CRYPTOGRAPHIC PUZZLE MODAL
       ========================================================================= -->
  <div class="modal-backdrop" id="puzzleModal">
    <div class="parchment-modal-box">
      <div class="modal-close-wax-seal" title="Close">✕</div>

      <div class="modal-title-header">
        <h2 id="puzzleModalTitle">Cryptographic Sea Riddle</h2>
        <p id="puzzleModalDesc">Manipulate the ancient mechanism to decipher the coordinates</p>
      </div>

      <div id="puzzleModalBody">
        <!-- Interactive puzzle contents injected dynamically -->
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 2: INVENTORY POUCH & COMBINATION WORKBENCH
       ========================================================================= -->
  <div class="modal-backdrop" id="inventoryModal">
    <div class="parchment-modal-box">
      <div class="modal-close-wax-seal" title="Close">✕</div>

      <div class="modal-title-header">
        <h2>Captain’s Relic Pouch</h2>
        <p>Inspect discovered artifacts and combine sea relics on the alchemical workbench</p>
      </div>

      <!-- 8-Slot Relic Pouch -->
      <div class="inventory-pouch-grid" id="inventoryGrid">
        <!-- Injected dynamically -->
      </div>

      <!-- Relic Inspect Inspector -->
      <div style="margin-top: 16px; background: rgba(255,255,255,0.4); border: 1px solid #8b6b3e; padding: 12px; border-radius: 6px;">
        <h4 id="inspectItemName" style="font-family: var(--font-heading); color: var(--ink-primary);">Select a Relic</h4>
        <p id="inspectItemLore" style="font-size: 14px; color: var(--ink-secondary); margin-top: 4px;">Click an item in your pouch to examine its history and select it for combination.</p>
        <span id="inspectItemCategory" style="font-size: 11px; font-weight: bold; color: var(--ink-red); display: block; margin-top: 4px;">CATEGORY: NONE</span>
      </div>

      <!-- Combination Workbench -->
      <div class="combination-workbench">
        <h4 style="font-family: var(--font-heading); color: var(--ink-primary); text-align: center;">
          Alchemical Relic Workbench (Select 2 combinable artifacts)
        </h4>
        <div class="workbench-slots-row">
          <div class="combine-target-slot" id="workbenchSlotA">Slot 1<br><small>(Select Relic)</small></div>
          <span class="combine-plus-sign">+</span>
          <div class="combine-target-slot" id="workbenchSlotB">Slot 2<br><small>(Select Relic)</small></div>
        </div>
        <button class="combine-action-btn" id="btnWorkbenchCombine">Forge Combined Relic</button>
      </div>

    </div>
  </div>

  <!-- =========================================================================
       MODAL 3: 3-TIER PROGRESSIVE HINTS SYSTEM
       ========================================================================= -->
  <div class="modal-backdrop" id="hintsModal">
    <div class="parchment-modal-box" style="max-width: 600px;">
      <div class="modal-close-wax-seal" title="Close">✕</div>

      <div class="modal-title-header">
        <h2>Captain’s Guidance & Clues</h2>
        <p>3-Tier progressive hints to assist you on challenging cryptographic riddles</p>
      </div>

      <div class="hints-tiers-list" id="hintsContainer">
        <!-- Dynamically injected hints -->
      </div>
    </div>
  </div>

  <!-- =========================================================================
       MODAL 4: CHRONICLES, BADGES & ENDINGS ARCHIVE
       ========================================================================= -->
  <div class="modal-backdrop" id="badgesModal">
    <div class="parchment-modal-box">
      <div class="modal-close-wax-seal" title="Close">✕</div>

      <div class="modal-title-header">
        <h2>Voyage Chronicles & Accolades</h2>
        <p>Recorded achievements and discovered narrative resolutions</p>
      </div>

      <h3 style="font-family: var(--font-heading); font-size: 16px; margin-bottom: 12px; color: var(--ink-red);">
        ACHIEVEMENT BADGES (8 REPUTATIONS)
      </h3>
      <div class="badges-grid" id="badgesGridContainer">
        <!-- Injected badges -->
      </div>

      <h3 style="font-family: var(--font-heading); font-size: 16px; margin-bottom: 12px; color: var(--ink-red);">
        NARRATIVE ENDINGS CHRONICLE (5 RESOLUTIONS)
      </h3>
      <div class="endings-archive-list" id="endingsArchiveContainer">
        <!-- Injected endings -->
      </div>
    </div>
  </div>

  <!-- Dynamic Voyage Toast Notification -->
  <div class="voyage-toast" id="voyageToast">
    <span>⚓</span>
    <span>Voyage checkpoint recorded.</span>
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
