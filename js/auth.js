/**
 * LOST TREASURE: CLIENT-TO-DATABASE BRIDGE & AUTHENTICATION ENGINE
 * Synchronizes voyage saves, achievements, and player profiles directly with PHP & MySQL.
 */

class CaptainAuthBridge {
  constructor() {
    this.currentCaptain = null;
    this.unlockedAchievements = [];
    this.unlockedEndings = [];
    this.isGuest = false;
  }

  /**
   * Load active captain profile and saved voyage from MySQL database
   */
  async loadFromDatabase() {
    try {
      const response = await fetch('api/load_voyage.php', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();

      if (data.success) {
        this.isGuest = !!data.is_guest;
        this.currentCaptain = data.captain || {
          name: 'The Nameless Mariner',
          title: 'Drifter of the Seas',
          crest: '🧭'
        };
        this.unlockedAchievements = data.achievements || [];
        this.unlockedEndings = data.endings || [];
        return data.savedVoyage;
      }
    } catch (e) {
      console.warn("Failed to load from MySQL database, checking local fallback:", e);
    }

    // Fallback if offline or guest
    const local = localStorage.getItem('lost_treasure_local_save');
    return local ? JSON.parse(local) : null;
  }

  /**
   * Save voyage state to MySQL database
   */
  async saveActiveVoyage(voyageState) {
    // Local backup
    localStorage.setItem('lost_treasure_local_save', JSON.stringify(voyageState));

    try {
      const response = await fetch('api/save_voyage.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voyageState)
      });
      const res = await response.json();
      return res.success;
    } catch (e) {
      console.warn("Failed to save to database:", e);
      return false;
    }
  }

  /**
   * Unlock achievement badge in MySQL database
   */
  async unlockAchievement(badgeId) {
    if (!this.unlockedAchievements.includes(badgeId)) {
      this.unlockedAchievements.push(badgeId);

      try {
        await fetch('api/unlock_badge.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ badgeId })
        });
      } catch (e) {
        console.warn("Failed to record badge in database:", e);
      }
    }
  }

  getCurrentCaptain() {
    return this.currentCaptain;
  }

  getAchievements() {
    return this.unlockedAchievements;
  }

  getEndings() {
    return this.unlockedEndings;
  }
}

window.captainAuth = new CaptainAuthBridge();
