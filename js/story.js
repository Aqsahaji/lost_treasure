/**
 * LOST TREASURE: NARRATIVE ENGINE & BRANCHING STORYLINE
 * Features 5 Acts, moral captain dilemmas, environmental discoveries,
 * state persistence checkpoints, and 5 distinct endings.
 */

const ACHIEVEMENTS_CATALOG = {
  master_cryptographer: {
    id: 'master_cryptographer',
    name: 'Master Cryptographer',
    icon: '📜',
    desc: "Deciphered Captain Drake's waterlogged Caesar shift cipher."
  },
  semaphore_signaler: {
    id: 'semaphore_signaler',
    name: 'Semaphore Signaler',
    icon: '🚩',
    desc: 'Hoisted the maritime signal flags to navigate the Razor Reefs safely.'
  },
  celestial_navigator: {
    id: 'celestial_navigator',
    name: 'Celestial Navigator',
    icon: '✨',
    desc: 'Aligned the Aztec sun and serpent celestial rings to the Zenith.'
  },
  alchemist_deep: {
    id: 'alchemist_deep',
    name: 'Alchemist of the Deep',
    icon: '🔮',
    desc: "Combined ancient relics on the captain's pouch workbench."
  },
  compassionate_captain: {
    id: 'compassionate_captain',
    name: 'Compassionate Captain',
    icon: '❤️',
    desc: 'Maintained high crew morale and protected your crewmates from death.'
  },
  pirate_king: {
    id: 'pirate_king',
    name: 'Sovereign Pirate King',
    icon: '👑',
    desc: 'Discovered the Aztec sun hoard and shared wealth equally with the crew.'
  },
  cursed_immortal: {
    id: 'cursed_immortal',
    name: 'Cursed Skeletal Guard',
    icon: '💀',
    desc: 'Claimed the cursed black gold and became the eternal guardian of the deep.'
  },
  voyager_reborn: {
    id: 'voyager_reborn',
    name: 'Voyager Reborn',
    icon: '⚓',
    desc: 'Restarted a new voyage or replayed a chapter from the ship chronicles.'
  }
};

const ENDINGS_CATALOG = {
  ending_pirate_king: {
    id: 'ending_pirate_king',
    title: 'Ending I: The Pirate King Sovereign',
    image: 'assets/images/treasure_hoard.jpg',
    summary: 'With honor, intellect, and brotherhood, you unlocked the Sun Hoard and divided centuries of Aztec gold among your loyal crew. Your fleet rules the Caribbean as free kings.'
  },
  ending_cursed_skeleton: {
    id: 'ending_cursed_skeleton',
    title: 'Ending II: The Cursed Skeletal Eternal Guard',
    image: 'assets/images/cursed_skeleton.jpg',
    summary: 'Blinded by ruthless greed, you seized the black obsidian skull. Flesh withered from your bones as emerald fire engulfed your chest. You now sit upon the bone throne forever.'
  },
  ending_scholar_sun: {
    id: 'ending_scholar_sun',
    title: 'Ending III: Scholar of the Forgotten Sun',
    image: 'assets/images/aztec_crypt.jpg',
    summary: 'You spurned bloody gold in favor of ancient astronomical codices and lost navigation globes. The academies of the Old World hailed you as the greatest explorer of the century.'
  },
  ending_ghost_captain: {
    id: 'ending_ghost_captain',
    title: 'Ending IV: The Ghost Ship’s Damned Helmsman',
    image: 'assets/images/ghost_ship_storm.jpg',
    summary: 'You locked your comrades in the cavern to claim the gold alone. But the ocean demanded tribute. You were condemned to helm the rotting galleon El Cazador across ghost seas for eternity.'
  },
  ending_survivor_maw: {
    id: 'ending_survivor_maw',
    title: 'Ending V: Survivor of the Serpent’s Maw',
    image: 'assets/images/isle_of_serpents.jpg',
    summary: 'The booby-trapped temple collapsed into the boiling surf. You barely reached your longboat clutching a solitary gold sun medallion. A battered survivor with an unforgettable legend.'
  }
};

const STORY_NODES = {
  // =========================================================================
  // ACT I: GHOST SHIP EL CAZADOR
  // =========================================================================
  act1_start: {
    id: 'act1_start',
    act: 'Act I',
    chapterTitle: 'The Derelict in the Tempest',
    dateStamp: 'October 14th, 1718 — 21° North, Gulf of Shadows',
    image: 'assets/images/ghost_ship_storm.jpg',
    discoveryItem: 'brass_astrolabe',
    discoveryName: 'Brass Navigational Astrolabe',
    discoveryLore: 'Found clutched in the dead navigator’s hands.',
    loreQuote: '“Beware the ship that sails with no wind, for its cargo is paid in souls.” — Old Mariner Proverb',
    text: `
      A tempest howls with feral fury as your brigantine pulls alongside the black hull of the <em>El Cazador</em>. 
      The Spanish galleon drifted out of the mist like a vengeful specter—shrouded in eerie teal lanterns, its canvas sails torn to ribbons.
      <br><br>
      As your boarding party leaps onto the slick, salt-crusted deck, a deafening crack of thunder shakes the timbers. 
      Below decks, you hear desperate pounding: a wounded crewman trapped in the rising bilge water. 
      Simultaneously, your quartermaster spots Captain Drake’s private cabin door swinging open, where an open brass strongbox glints in the lightning flash.
    `,
    choices: [
      {
        text: 'Rush into the flooding hold to rescue the trapped sailor',
        desc: 'Save a human life before the water rises. Shows captain’s mercy.',
        tag: 'crew',
        tagText: '+Morale (+20), -Gold',
        effect: { morale: 20, dread: -5, item: 'jade_serpent_eye' },
        toast: 'You kicked the bilge door open! The grateful sailor handed you a jade serpent eye he salvaged from the bilge.',
        next: 'act1_cipher_node'
      },
      {
        text: 'Kick open the Captain’s Stateroom to secure the navigational charts and gold',
        desc: 'Prioritize the expedition mission and heavy Spanish coin.',
        tag: 'glory',
        tagText: '+Gold (+50 Doubloons), +Dread (+10)',
        effect: { gold: 50, dread: 10, morale: -10 },
        toast: 'You scooped up 50 Spanish gold doubloons, but the cries below drowned in the dark water.',
        next: 'act1_cipher_node'
      }
    ]
  },

  act1_cipher_node: {
    id: 'act1_cipher_node',
    act: 'Act I',
    chapterTitle: 'The Waterlogged Journal',
    dateStamp: 'October 14th, 1718 — Cabin of Captain Drake',
    image: 'assets/images/ghost_ship_storm.jpg',
    discoveryItem: 'waterlogged_journal',
    discoveryName: "Captain Drake's Encrypted Logbook",
    discoveryLore: 'Soaked with sea spray. Its crucial navigation line is sealed by cipher.',
    loreQuote: '“To hide the path from mutinous eyes, shift each letter by the mark of the Trinity.”',
    text: `
      Beneath the shattered navigational desk lies a leather-bound journal encrusted with barnacles. 
      The pages describe the location of the fabled <em>Isle of Serpents</em> and its subterranean Aztec vault.
      <br><br>
      However, the crucial sailing coordinate has been deliberately scrambled with a cryptographic Caesar shift:
      <br>
      <strong>“WKH VHUSHQW VSLUH SRUWV WR WKH QRUWK VWDU”</strong>
      <br><br>
      Beside the cipher, Drake drew a brass circular wheel with three gold coins. You must use the brass cipher dial to decrypt the text before the ship sinks into the abyss.
    `,
    puzzleType: 'caesar',
    choices: [
      {
        text: 'Examine the Brass Cipher Wheel and Decrypt the Log',
        desc: 'Rotate the inner dial to crack the encrypted Spanish coordinates.',
        isPuzzleTrigger: true,
        tag: 'puzzle-lock',
        tagText: 'Requires Cipher Solution',
        next: 'act2_reefs'
      }
    ]
  },

  // =========================================================================
  // ACT II: RAZOR REEFS & NAUTICAL SIGNALS
  // =========================================================================
  act2_reefs: {
    id: 'act2_reefs',
    act: 'Act II',
    chapterTitle: 'The Shrouded Straits & Razor Reefs',
    dateStamp: 'October 16th, 1718 — Approach to the Isle of Serpents',
    image: 'assets/images/isle_of_serpents.jpg',
    discoveryItem: 'obsidian_lens',
    discoveryName: 'Smoky Obsidian Lens',
    discoveryLore: 'Found wedged between the dead lookout’s spyglass fittings.',
    loreQuote: '“The rocks have teeth, and the fog has eyes.” — Quartermaster Higgins',
    text: `
      Following the decoded coordinates—<em>“THE SERPENT SPIRE PORTS TO THE NORTH STAR”</em>—your vessel cuts through the boiling sea mist.
      Ahead rises the terrifying silhouette of the <strong>Isle of Serpents</strong>. Colossal serpent statues carved into volcanic cliffs loom over crashing waves.
      <br><br>
      The narrow channel into the cove is bordered by razor-sharp submerged reefs capable of tearing your hull to splinters. 
      A lookout atop the ghost mast left a sequence of semaphore maritime flags fluttering in the gale to mark the safe passage. 
      You must hoist the correct 4-flag warning sequence up your halyard to signal your helmsman.
    `,
    puzzleType: 'nautical',
    choices: [
      {
        text: 'Consult Signal Codebook & Hoist Channel Flags',
        desc: 'Identify the 4 flags spelling REEF to steer through the shoals.',
        isPuzzleTrigger: true,
        tag: 'puzzle-lock',
        tagText: 'Requires Semaphore Solution',
        next: 'act3_caverns'
      },
      {
        text: 'Order the Cannons and Ballast Jettisoned to Ride Over the Shallows',
        desc: 'Bypass the signals by lightening ship, risking heavy losses.',
        tag: 'dread',
        tagText: '-Gold (-30 Doubloons), +Dread (+15)',
        effect: { gold: -30, dread: 15, morale: -5 },
        toast: 'You scraped through the reef, but threw valuable cannons and treasure chests overboard.',
        next: 'act3_caverns'
      }
    ]
  },

  // =========================================================================
  // ACT III: ISLE OF SERPENTS & WORKBENCH COMBINATION
  // =========================================================================
  act3_caverns: {
    id: 'act3_caverns',
    act: 'Act III',
    chapterTitle: 'The Serpent’s Grotto & Mutinous Whispers',
    dateStamp: 'October 17th, 1718 — Subterranean Sea Caves',
    image: 'assets/images/isle_of_serpents.jpg',
    discoveryItem: 'skeleton_key',
    discoveryName: 'Serpent Bone Key',
    discoveryLore: 'An ancient key fashioned from calcified viper bones.',
    loreQuote: '“When greed enters a pirate crew, brother draws cutlass against brother.”',
    text: `
      Your longboats scrape against the black volcanic sand inside the cavern cove. Torches cast flickering, monstrous shadows of stone vipers across the vaulted ceiling.
      <br><br>
      Near a skeletal remains of an ancient conquistador, you uncover a <strong>Serpent Bone Key</strong> and a mysterious <strong>Smoky Obsidian Lens</strong>. 
      As you inspect the artifacts, First Mate Higgins steps forward, pistol cocked in his sash.
      <br><br>
      <em>“Listen here, Captain,”</em> Higgins growls, his voice echoing in the cave. <em>“The men bled for this. We demand an equal share of every gold idol and gem in that vault, signed in blood on the articles, or we turn back now!”</em>
    `,
    choices: [
      {
        text: 'Sign the Blood Articles: Agree to Equal Shares with all crew members',
        desc: 'Cement loyalty and trust. Inspire unwavering camaraderie.',
        tag: 'crew',
        tagText: '+Morale (+30), -Dread (-15)',
        effect: { morale: 30, dread: -15 },
        toast: 'The men roar their approval! “Long live our Captain!” echoed through the cavern.',
        next: 'act3_crafting_junction'
      },
      {
        text: 'Draw your cutlass: “I am Captain of this ship, and mutiny means a yardarm dance!”',
        desc: 'Maintain fierce iron discipline through intimidation.',
        tag: 'dread',
        tagText: '+Dread (+25), -Morale (-20)',
        effect: { dread: 25, morale: -20 },
        toast: 'Higgins stepped back, eyes smoldering with hatred. Fear rules the crew tonight.',
        next: 'act3_crafting_junction'
      }
    ]
  },

  act3_crafting_junction: {
    id: 'act3_crafting_junction',
    act: 'Act III',
    chapterTitle: 'The Alchemist’s Workbench',
    dateStamp: 'October 17th, 1718 — The Cavern Antechamber',
    image: 'assets/images/isle_of_serpents.jpg',
    loreQuote: '“Two halves of ancient craft make whole what mortal eyes cannot behold.”',
    text: `
      Before you stands the cyclopean entrance to the Aztec Vault. 
      The massive basalt arch is carved with celestial constellations that shimmer faintly with phosphorescent starlight. 
      <br><br>
      To decipher the celestial dials ahead, you must open your <strong>Captain’s Pouch</strong> and combine your relics on the workbench:
      <br>
      • Combine the <strong>Brass Astrolabe</strong> with the <strong>Obsidian Lens</strong> to forge the <em>Stargazer’s Celestial Monocle</em>!
      <br>
      • If you have the <strong>Serpent Bone Key</strong> and <strong>Jade Serpent Eye</strong>, combine them to fashion the <em>Venom-Warded Serpent Key</em>.
    `,
    choices: [
      {
        text: 'Proceed to the Aztec Sun Temple Gates',
        desc: 'Advance into the heart of the temple with your prepared artifacts.',
        tag: 'glory',
        tagText: 'Approaching Act IV',
        next: 'act4_sun_temple'
      }
    ]
  },

  // =========================================================================
  // ACT IV: AZTEC SUN TEMPLE & BOOBY-TRAPPED VAULT
  // =========================================================================
  act4_sun_temple: {
    id: 'act4_sun_temple',
    act: 'Act IV',
    chapterTitle: 'The Gate of Tonatiuh',
    dateStamp: 'October 18th, 1718 — Deep Aztec Crypt',
    image: 'assets/images/aztec_crypt.jpg',
    discoveryItem: 'aztec_sun_medallion',
    discoveryName: 'Gold Sun Medallion',
    discoveryLore: 'Pure Aztec gold radiating supernatural solar warmth.',
    loreQuote: '“The Sun God demands alignment before his gates yield to mortal footsteps.”',
    text: `
      You step into a colossal subterranean temple beneath the ocean bed. 
      In the center of the granite wall is an immense, glowing Aztec calendar wheel forged of gold and obsidian, radiating solar fire.
      <br><br>
      Looking through your <strong>Celestial Monocle</strong>, glowing emerald glyphs appear upon the rotating rings:
      <br>
      <em>“When Coatl the Serpent turns toward the North Zenith, and the Solar Eclipse aligns with the Serpent’s Eye, the Sun Gate shall open.”</em>
    `,
    puzzleType: 'aztec',
    choices: [
      {
        text: 'Manipulate the Celestial Astrological Rings',
        desc: 'Rotate the Zodiac, Eclipse phase, and Serpent Eye into sacred alignment.',
        isPuzzleTrigger: true,
        tag: 'puzzle-lock',
        tagText: 'Requires Celestial Dial Solution',
        next: 'act4_traps'
      }
    ]
  },

  act4_traps: {
    id: 'act4_traps',
    act: 'Act IV',
    chapterTitle: 'The Hall of Venomous Spikes',
    dateStamp: 'October 18th, 1718 — Booby-Trapped Passage',
    image: 'assets/images/aztec_crypt.jpg',
    loreQuote: '“One false step unleashes the venom that slumbers in stone.”',
    text: `
      The golden calendar wheel grinds backward into the granite wall with a resonant boom, revealing a torchlit corridor.
      However, the stone floor is paved with deadly booby-trap pressure tiles: razor-sharp iron spikes and blowdart serpents lurk beneath each engraved stone.
      <br><br>
      Beside the doorway is a serpentine keyhole enveloped in carvings of green nephrite. 
    `,
    choices: [
      {
        text: 'Insert the Venom-Warded Serpent Key into the disarm mechanism',
        desc: 'Use your crafted master key (Bone Key + Jade Eye) to lock the trap triggers in place.',
        tag: 'puzzle-lock',
        tagText: 'Disarms All Booby Traps',
        condition: (inv) => inv.hasItem('venom_ward_key'),
        lockedMessage: "You require the Venom-Warded Serpent Key (Crafted from Bone Key + Jade Eye).",
        effect: { morale: 20, dread: -10 },
        toast: 'The key clicked smoothly. You heard the click of iron counterweights disarming every dart trigger!',
        next: 'act5_climax'
      },
      {
        text: 'Navigate the tiles carefully using the Serpent path (Serpent -> Eagle -> Sun)',
        desc: 'Test your agility and nerve on the hazardous stepping stones.',
        tag: 'dread',
        tagText: 'Risks +15 Dread',
        effect: { dread: 15, morale: -5 },
        toast: 'You narrowly dodged a hiss of poisoned darts, though the close brush shook the men.',
        next: 'act5_climax'
      }
    ]
  },

  // =========================================================================
  // ACT V: THE FINAL CHAMBER & MORAL RECKONING
  // =========================================================================
  act5_climax: {
    id: 'act5_climax',
    act: 'Act V',
    chapterTitle: 'The Hoard of Tonatiuh',
    dateStamp: 'October 18th, 1718 — The Sanctum Sanctorum',
    image: 'assets/images/treasure_hoard.jpg',
    loreQuote: '“Gold is the test of the heart; some it liberates, some it crowns, and some it damns.”',
    text: `
      You cross into the inner sanctum. The spectacle takes your breath away.
      Mountains of Spanish doubloons, emerald-encrusted Aztec chalices, and golden crowns cover the floor in shimmering brilliance.
      <br><br>
      In the center stands a throne carved of obsidian and bone. 
      Upon it rests a cursed emerald skull that hums with sinister power, offering absolute immortality and dominion over the dead. 
      Beside the throne lie ancient astronomical globes, star charts, and medicine scrolls containing the lost wisdom of the Aztec priests.
      <br><br>
      Your crew gathers behind you with eyes wide with wonder and greed. This is the moment of ultimate reckoning:
    `,
    choices: [
      {
        text: 'Share the Gold Equally: Distribute the Hoard with your crew and sail as Pirate Kings!',
        desc: 'Honor the Pirate Code. Cast the cursed skull into the sea trench and take the legitimate riches.',
        tag: 'glory',
        tagText: 'Leads to Ending I (Pirate King)',
        endingId: 'ending_pirate_king',
        badge: 'pirate_king'
      },
      {
        text: 'Claim the Dark Power: Seize the Cursed Emerald Skull and the Black Gold for Yourself!',
        desc: 'Drink from the dark chalice. Demand eternal life and supreme dominion over the oceans.',
        tag: 'dread',
        tagText: 'Leads to Ending II (Cursed Skeleton Guard)',
        endingId: 'ending_cursed_skeleton',
        badge: 'cursed_immortal'
      },
      {
        text: 'Spurn the Gold: Salvage the Ancient Celestial Knowledge, Star Codices, and Healing Secrets',
        desc: 'Leave the cursed gold undisturbed. Take the scientific wonders to become a legendary scholar of the seas.',
        tag: 'crew',
        tagText: 'Leads to Ending III (Scholar of the Forgotten Sun)',
        endingId: 'ending_scholar_sun',
        badge: 'scholar_sun'
      },
      {
        text: 'Treacherous Betrayal: Drop the stone portcullis, trapping the crew inside to take the entire hoard!',
        desc: 'Cold-blooded pirate greed. Flee back to the longboat loaded with treasure.',
        tag: 'dread',
        tagText: 'Leads to Ending IV (Ghost Ship’s Captain)',
        endingId: 'ending_ghost_captain',
        badge: 'ghost_captain'
      }
    ]
  }
};

window.storyEngine = {
  nodes: STORY_NODES,
  endings: ENDINGS_CATALOG,
  achievements: ACHIEVEMENTS_CATALOG,
  getNode(id) {
    return this.nodes[id] || this.nodes['act1_start'];
  }
};
