// Robust Save & Progression Manager for MindSphere 3D
const SAVE_VERSION = 1;
const STORAGE_KEY = "mindsphere_save_v1";

class SaveManager {
  constructor() {
    this.data = this.getDefaults();
    this.load();
  }

  getDefaults() {
    return {
      version: SAVE_VERSION,
      highestUnlocked: 1,
      currentLevel: 1,
      completedLevels: {}, // { [levelId]: { stars: 3, bestTime: 45, bestMoves: 6, score: 950 } }
      history: [],         // Last 10 levels played: [{ level, score, time, moves, date }]
      timeAttackEnabled: false,
      timeAttackRecords: {}, // { [levelId]: { bestScore, bestTime } }
      leaderboard: [
        { rank: 1, name: "NovaSol_AI", score: 14500, time: "00:14", flag: "🌐" },
        { rank: 2, name: "QuantumMind_X", score: 13200, time: "00:18", flag: "⚡" },
        { rank: 3, name: "CyberSage", score: 12100, time: "00:21", flag: "🔮" },
        { rank: 4, name: "NexusPrime", score: 11450, time: "00:24", flag: "🧠" },
        { rank: 5, name: "NeonSynapse", score: 9800, time: "00:27", flag: "💎" },
        { rank: 6, name: "AstroLogic", score: 8750, time: "00:30", flag: "🚀" }
      ],
      achievements: {},
      totalStars: 0,
      totalScore: 0,
      timestamp: Date.now()
    };
  }

  load() {
    try {
      let raw = null;
      if (window.AndroidBridge && typeof window.AndroidBridge.loadData === "function") {
        raw = window.AndroidBridge.loadData();
      }
      if (!raw) {
        raw = localStorage.getItem(STORAGE_KEY);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.highestUnlocked === "number") {
          this.data = Object.assign(this.getDefaults(), parsed);
          this.recalculateTotals();
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to load save data, using defaults", e);
    }
    this.data = this.getDefaults();
  }

  save() {
    try {
      this.data.timestamp = Date.now();
      this.recalculateTotals();
      const serialized = JSON.stringify(this.data);
      localStorage.setItem(STORAGE_KEY, serialized);

      if (window.AndroidBridge && typeof window.AndroidBridge.saveData === "function") {
        window.AndroidBridge.saveData(serialized);
      }
    } catch (e) {
      console.error("Save error", e);
    }
  }

  recalculateTotals() {
    let stars = 0;
    let score = 0;
    for (const lvlId in this.data.completedLevels) {
      const lvl = this.data.completedLevels[lvlId];
      if (lvl) {
        stars += lvl.stars || 0;
        score += lvl.score || 0;
      }
    }
    this.data.totalStars = stars;
    this.data.totalScore = score;
  }

  isUnlocked(levelId) {
    if (levelId === 1) return true;
    return (this.data.highestUnlocked >= levelId);
  }

  recordLevelComplete(levelId, stars, timeSeconds, moves, score) {
    const prev = this.data.completedLevels[levelId] || { stars: 0, bestTime: 999999, bestMoves: 999999, score: 0 };
    
    this.data.completedLevels[levelId] = {
      stars: Math.max(prev.stars, stars),
      bestTime: Math.min(prev.bestTime, timeSeconds),
      bestMoves: Math.min(prev.bestMoves, moves),
      score: Math.max(prev.score, score)
    };

    if (!this.data.history) {
      this.data.history = [];
    }

    this.data.history.push({
      level: levelId,
      levelName: `Chamber ${levelId}`,
      score: score,
      stars: stars,
      time: timeSeconds,
      moves: moves,
      timestamp: Date.now()
    });

    // Retain only the last 10 levels played
    if (this.data.history.length > 10) {
      this.data.history = this.data.history.slice(-10);
    }

    if (levelId + 1 > this.data.highestUnlocked && levelId < 15) {
      this.data.highestUnlocked = levelId + 1;
    }

    this.save();
  }

  getRecentIntelligenceData() {
    if (this.data.history && this.data.history.length > 0) {
      return this.data.history.slice(-10);
    }

    // Fallback baseline data if player hasn't completed levels yet
    // Shows initial calibration metrics
    return [
      { level: 1, levelName: "Chamber 1", score: 620, time: 35, moves: 2 },
      { level: 2, levelName: "Chamber 2", score: 710, time: 28, moves: 4 },
      { level: 3, levelName: "Chamber 3", score: 850, time: 22, moves: 3 }
    ];
  }

  recordTimeAttackScore(levelId, score, timeSec) {
    const numScore = (typeof score === "object" && score !== null) ? (score.totalScore || 0) : Number(score || 0);
    if (!this.data.timeAttackRecords) this.data.timeAttackRecords = {};
    const prev = this.data.timeAttackRecords[levelId] || { bestScore: 0, bestTime: 999 };
    this.data.timeAttackRecords[levelId] = {
      bestScore: Math.max(prev.bestScore, numScore),
      bestTime: Math.min(prev.bestTime, timeSec)
    };

    // Update Simulated Global Leaderboard with Player's Best Run
    const timeFormatted = `00:${timeSec.toString().padStart(2, "0")}`;
    const playerName = (typeof t === "function") ? t("player_you") : "You";
    const playerEntry = {
      rank: 99,
      name: playerName,
      score: numScore,
      time: timeFormatted,
      flag: "👑",
      isPlayer: true
    };

    let board = (this.data.leaderboard || []).filter(e => !e.isPlayer);
    board.push(playerEntry);
    board.sort((a, b) => b.score - a.score);

    // Re-rank top 10
    board.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    this.data.leaderboard = board.slice(0, 8);
    this.save();

    const rank = this.data.leaderboard.findIndex(e => e.isPlayer) + 1;
    return rank > 0 ? rank : 9;
  }

  getPlayerRankAndBestScore() {
    const board = this.data.leaderboard || [];
    const player = board.find(e => e.isPlayer);
    if (player) {
      return { rank: player.rank, score: player.score, time: player.time };
    }
    return { rank: null, score: 0, time: "--:--" };
  }

  getLeaderboard() {
    return this.data.leaderboard || [];
  }

  resetAllProgress() {
    this.data = this.getDefaults();
    this.save();
  }
}

const SaveSys = new SaveManager();
