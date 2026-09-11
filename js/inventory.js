/**
 * LOST TREASURE: INVENTORY & COMBINATION MECHANICS
 * Handles relic pouch slots, artifact inspection, and multi-item combination recipes.
 */

const ARTIFACT_CATALOG = {
  waterlogged_journal: {
    id: 'waterlogged_journal',
    name: "Captain's Waterlogged Journal",
    icon: '📖',
    category: 'tome',
    rarity: 'common',
    modelType: 'sun_medallion',
    lore: "Salvaged from the drowned galleon El Cazador. Its pages are stiff with brine and locked with ancient cryptographic ciphers.",
    canCombine: false
  },
  brass_astrolabe: {
    id: 'brass_astrolabe',
    name: 'Brass Navigational Astrolabe',
    icon: '🧭',
    category: 'instrument',
    rarity: 'rare',
    modelType: 'brass_astrolabe',
    lore: "A 16th-century astronomical dial. Its sight vanes are calibrated to track polar stars and secret Aztec planetary alignments.",
    canCombine: true
  },
  obsidian_lens: {
    id: 'obsidian_lens',
    name: 'Smoky Obsidian Lens',
    icon: '🔮',
    category: 'relic',
    rarity: 'rare',
    modelType: 'sun_medallion',
    lore: "Crafted from dark volcanic glass by Aztec priests. When held against torchlight, it reveals hidden astrological alignments.",
    canCombine: true
  },
  skeleton_key: {
    id: 'skeleton_key',
    name: 'Serpent Bone Key',
    icon: '🗝️',
    category: 'key',
    rarity: 'rare',
    modelType: 'skeleton_key',
    lore: "Pried from the clenched fingers of a dead Spanish officer. Shaped like a coiled viper's vertebrae.",
    canCombine: true
  },
  jade_serpent_eye: {
    id: 'jade_serpent_eye',
    name: 'Jade Serpent Eye',
    icon: '🟢',
    category: 'gem',
    rarity: 'rare',
    modelType: 'skeleton_key',
    lore: "Carved from solid Guatemalan nephrite. Legend says it neutralizes the paralyzing venom of temple booby traps.",
    canCombine: true
  },
  aztec_sun_medallion: {
    id: 'aztec_sun_medallion',
    name: 'Gold Sun Medallion',
    icon: '🪙',
    category: 'treasure',
    rarity: 'legendary',
    modelType: 'aztec_sun_medallion',
    lore: "Heavy Aztec gold stamped with the solar face of Tonatiuh. Emits a faint warmth even in freezing sea caverns.",
    canCombine: false
  },
  cursed_emerald_skull: {
    id: 'cursed_emerald_skull',
    name: 'Cursed Emerald Aztec Skull',
    icon: '💀',
    category: 'relic',
    rarity: 'cursed',
    modelType: 'cursed_emerald_skull',
    lore: "Unearthed from the crypt altar. Glowing green witchfire burns inside the eye sockets, whispering forgotten Aztec hexes.",
    canCombine: false
  },
  spanish_gold_doubloons: {
    id: 'spanish_gold_doubloons',
    name: 'Royal Spanish Doubloons',
    icon: '💰',
    category: 'treasure',
    rarity: 'common',
    modelType: 'aztec_sun_medallion',
    lore: "Minted in Seville in 1714. Stamped with the cross of Burgundy, salvaged from the seabed of Dead Man's Reef.",
    canCombine: false
  },
  ghost_lantern: {
    id: 'ghost_lantern',
    name: 'Phantom Ghost Lantern',
    icon: '🏮',
    category: 'relic',
    rarity: 'rare',
    modelType: 'sun_medallion',
    lore: "Burns with a perpetual cold blue flame requiring no whale oil. Illuminates spirits that haunt the Isle of Serpents.",
    canCombine: false
  },
  obsidian_dagger: {
    id: 'obsidian_dagger',
    name: 'Sacrificial Aztec Dagger',
    icon: '🗡️',
    category: 'weapon',
    rarity: 'legendary',
    modelType: 'skeleton_key',
    lore: "Carved from raw volcanic obsidian glass, untouched by rust or decay after four centuries.",
    canCombine: false
  },
  celestial_monocle: {
    id: 'celestial_monocle',
    name: "Stargazer's Celestial Monocle",
    icon: '👁️',
    category: 'master_artifact',
    rarity: 'legendary',
    modelType: 'brass_astrolabe',
    lore: "Forged by combining the Brass Astrolabe with the Obsidian Lens. Decodes invisible starlight glyphs on the Sun Door!",
    canCombine: false
  },
  venom_ward_key: {
    id: 'venom_ward_key',
    name: 'Venom-Warded Serpent Key',
    icon: '🐍',
    category: 'master_artifact',
    rarity: 'legendary',
    modelType: 'skeleton_key',
    lore: "Created by embedding the Jade Serpent Eye into the Bone Key. Disarms ancient pressure plates and dart mechanisms.",
    canCombine: false
  }
};

// Crafting / Combination Recipes
const COMBINATION_RECIPES = [
  {
    ingredients: ['brass_astrolabe', 'obsidian_lens'],
    result: 'celestial_monocle',
    successMessage: "You set the obsidian lens into the brass astrolabe housing! The lenses flare with celestial starlight.",
    badgeUnlock: 'alchemist_deep'
  },
  {
    ingredients: ['skeleton_key', 'jade_serpent_eye'],
    result: 'venom_ward_key',
    successMessage: "The jade serpent eye clicks into the bone key's socket. A calming emerald glow envelops the warding talisman.",
    badgeUnlock: 'alchemist_deep'
  }
];

class InventorySystem {
  constructor() {
    this.totalSlots = 20;
    this.items = ['waterlogged_journal', 'brass_astrolabe', 'spanish_gold_doubloons'];
    this.selectedForCombination = [];
    this.crewStatus = {
      captainHealth: 100,
      crewMorale: 80,
      shipSupplies: 65
    };
  }

  reset() {
    this.items = ['waterlogged_journal', 'brass_astrolabe', 'spanish_gold_doubloons'];
    this.selectedForCombination = [];
    this.crewStatus = {
      captainHealth: 100,
      crewMorale: 80,
      shipSupplies: 65
    };
  }

  loadState(savedItems) {
    if (Array.isArray(savedItems)) {
      this.items = savedItems.filter(id => ARTIFACT_CATALOG[id]);
    } else {
      this.reset();
    }
  }

  addItem(itemId) {
    if (!ARTIFACT_CATALOG[itemId]) return false;
    if (!this.items.includes(itemId)) {
      this.items.push(itemId);
      if (window.seaAudio) window.seaAudio.playCoinClink();
      return true;
    }
    return false;
  }

  removeItem(itemId) {
    const idx = this.items.indexOf(itemId);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      return true;
    }
    return false;
  }

  hasItem(itemId) {
    return this.items.includes(itemId);
  }

  getItems() {
    return this.items.map(id => ARTIFACT_CATALOG[id]);
  }

  toggleSelectForCombination(itemId) {
    const idx = this.selectedForCombination.indexOf(itemId);
    if (idx !== -1) {
      this.selectedForCombination.splice(idx, 1);
      return false;
    } else {
      if (this.selectedForCombination.length >= 2) {
        this.selectedForCombination.shift(); // keep max 2 selected
      }
      this.selectedForCombination.push(itemId);
      return true;
    }
  }

  clearCombinationSelection() {
    this.selectedForCombination = [];
  }

  /**
   * Attempt to combine currently selected pair
   */
  attemptCombination() {
    if (this.selectedForCombination.length !== 2) {
      return { success: false, message: "Select two relics from your pouch to combine them on the workbench." };
    }

    const [itemA, itemB] = this.selectedForCombination;

    const matchedRecipe = COMBINATION_RECIPES.find(recipe => 
      (recipe.ingredients.includes(itemA) && recipe.ingredients.includes(itemB))
    );

    if (!matchedRecipe) {
      return { success: false, message: "These relics do not fit together. Perhaps another combination holds the secret?" };
    }

    // Success!
    this.removeItem(itemA);
    this.removeItem(itemB);
    this.addItem(matchedRecipe.result);
    this.clearCombinationSelection();

    if (window.seaAudio) window.seaAudio.playDiscoveryChime();
    if (matchedRecipe.badgeUnlock && window.captainAuth) {
      window.captainAuth.unlockAchievement(matchedRecipe.badgeUnlock);
    }

    return {
      success: true,
      resultItem: ARTIFACT_CATALOG[matchedRecipe.result],
      message: matchedRecipe.successMessage
    };
  }
}

window.inventorySystem = new InventorySystem();
