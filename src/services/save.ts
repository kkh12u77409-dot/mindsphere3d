import { SaveData, HistoryRecord, LeaderboardEntry } from '../types/game';
import { ACHIEVEMENTS, ExtendedAchievementDefinition } from '../data/achievements';

const SAVE_VERSION = 1;
const STORAGE_KEY = 'mindsphere_save_v1';

export function getDefaultSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    highestUnlocked: 1,
    currentLevel: 1,
    completedLevels: {},
    history: [
      { level: 1, levelName: "Chamber 1", score: 620, stars: 2, time: 35, moves: 2, timestamp: Date.now() - 3600000 },
      { level: 2, levelName: "Chamber 2", score: 710, stars: 3, time: 28, moves: 4, timestamp: Date.now() - 1800000 },
      { level: 3, levelName: "Chamber 3", score: 850, stars: 3, time: 22, moves: 3, timestamp: Date.now() - 600000 }
    ],
    timeAttackEnabled: false,
    timeAttackRecords: {},
    leaderboard: [
      { rank: 1, name: "NovaSol_AI", score: 14500, time: "00:14", flag: "🌐" },
      { rank: 2, name: "QuantumMind_X", score: 13200, time: "00:18", flag: "⚡" },
      { rank: 3, name: "CyberSage", score: 12100, time: "00:21", flag: "🔮" },
      { rank: 4, name: "NexusPrime", score: 11450, time: "00:24", flag: "🧠" },
      { rank: 5, name: "NeonSynapse", score: 9800, time: "00:27", flag: "💎" },
      { rank: 6, name: "AstroLogic", score: 8750, time: "00:30", flag: "🚀" }
    ],
    totalStars: 0,
    totalScore: 0,
    totalMoves: 9,
    unlockedAchievements: {},
    timestamp: Date.now()
  };
}

class SaveManager {
  public data: SaveData;

  constructor() {
    this.data = this.load();
  }

  public load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.highestUnlocked === 'number') {
          const merged = Object.assign(getDefaultSaveData(), parsed);
          this.recalculateTotals(merged);
          return merged;
        }
      }
    } catch (e) {
      console.warn('Failed to load save data, using defaults', e);
    }
    const def = getDefaultSaveData();
    this.recalculateTotals(def);
    return def;
  }

  public save() {
    try {
      this.data.timestamp = Date.now();
      this.recalculateTotals(this.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Save error', e);
    }
  }

  public recalculateTotals(data: SaveData) {
    let stars = 0;
    let score = 0;
    for (const lvlId in data.completedLevels) {
      const lvl = data.completedLevels[lvlId];
      if (lvl) {
        stars += lvl.stars || 0;
        score += lvl.score || 0;
      }
    }
    data.totalStars = stars;
    data.totalScore = score;

    if (!data.unlockedAchievements) {
      data.unlockedAchievements = {};
    }
    if (typeof data.totalMoves !== 'number') {
      let movesSum = 0;
      if (data.history) {
        movesSum = data.history.reduce((acc, h) => acc + (h.moves || 0), 0);
      }
      data.totalMoves = Math.max(9, movesSum);
    }
  }

  public isUnlocked(levelId: number): boolean {
    if (levelId === 1) return true;
    return this.data.highestUnlocked >= levelId;
  }

  public recordMove(): ExtendedAchievementDefinition[] {
    this.data.totalMoves = (this.data.totalMoves || 0) + 1;
    const newlyUnlocked = this.checkAndUnlockAchievements();
    this.save();
    return newlyUnlocked;
  }

  public checkAndUnlockAchievements(sessionStats?: {
    moves?: number;
    time?: number;
    levelId?: number;
    hintsUsed?: number;
    isTimeAttack?: boolean;
    score?: number;
  }): ExtendedAchievementDefinition[] {
    const newlyUnlocked: ExtendedAchievementDefinition[] = [];
    if (!this.data.unlockedAchievements) {
      this.data.unlockedAchievements = {};
    }

    ACHIEVEMENTS.forEach(ach => {
      const isAlreadyUnlocked = Boolean(this.data.unlockedAchievements[ach.id]);
      const progress = ach.calculateProgress(this.data, sessionStats);

      if (progress.isUnlocked && !isAlreadyUnlocked) {
        this.data.unlockedAchievements[ach.id] = {
          unlockedAt: Date.now()
        };
        newlyUnlocked.push(ach);
      }
    });

    return newlyUnlocked;
  }

  public recordLevelComplete(
    levelId: number,
    stars: number,
    timeSeconds: number,
    moves: number,
    score: number,
    ghostRecording?: import('../types/game').GhostRecording,
    sessionMeta?: { hintsUsed?: number; isTimeAttack?: boolean }
  ): ExtendedAchievementDefinition[] {
    const prev = this.data.completedLevels[levelId] || { stars: 0, bestTime: 999999, bestMoves: 999999, score: 0 };

    const shouldUpdateGhost = !prev.ghostRecording || timeSeconds <= prev.bestTime;

    this.data.completedLevels[levelId] = {
      stars: Math.max(prev.stars, stars),
      bestTime: Math.min(prev.bestTime, timeSeconds),
      bestMoves: Math.min(prev.bestMoves, moves),
      score: Math.max(prev.score, score),
      ghostRecording: shouldUpdateGhost && ghostRecording ? ghostRecording : prev.ghostRecording
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

    if (this.data.history.length > 10) {
      this.data.history = this.data.history.slice(-10);
    }

    if (levelId + 1 > this.data.highestUnlocked && levelId < 15) {
      this.data.highestUnlocked = levelId + 1;
    }

    const newlyUnlocked = this.checkAndUnlockAchievements({
      moves,
      time: timeSeconds,
      levelId,
      hintsUsed: sessionMeta?.hintsUsed ?? 0,
      isTimeAttack: sessionMeta?.isTimeAttack ?? false,
      score
    });

    this.save();
    return newlyUnlocked;
  }

  public getGhostRecording(levelId: number): import('../types/game').GhostRecording | null {
    const lvl = this.data.completedLevels[levelId];
    if (lvl && lvl.ghostRecording) {
      return lvl.ghostRecording;
    }
    return null;
  }

  public recordTimeAttackScore(levelId: number, score: number, timeSec: number, playerName: string = "You"): number {
    const numScore = Number(score || 0);
    if (!this.data.timeAttackRecords) this.data.timeAttackRecords = {};
    const prev = this.data.timeAttackRecords[levelId] || { bestScore: 0, bestTime: 999 };
    this.data.timeAttackRecords[levelId] = {
      bestScore: Math.max(prev.bestScore, numScore),
      bestTime: Math.min(prev.bestTime, timeSec)
    };

    const timeFormatted = `00:${timeSec.toString().padStart(2, '0')}`;
    const playerEntry: LeaderboardEntry = {
      rank: 99,
      name: playerName,
      score: numScore,
      time: timeFormatted,
      flag: '👑',
      isPlayer: true
    };

    let board = (this.data.leaderboard || []).filter(e => !e.isPlayer);
    board.push(playerEntry);
    board.sort((a, b) => b.score - a.score);

    board.forEach((entry, i) => {
      entry.rank = i + 1;
    });

    this.data.leaderboard = board.slice(0, 8);
    this.save();

    const rank = this.data.leaderboard.findIndex(e => e.isPlayer) + 1;
    return rank > 0 ? rank : 9;
  }

  public getRecentIntelligenceData(): HistoryRecord[] {
    if (this.data.history && this.data.history.length > 0) {
      return this.data.history.slice(-10);
    }
    return [
      { level: 1, levelName: "Chamber 1", score: 620, stars: 2, time: 35, moves: 2, timestamp: Date.now() },
      { level: 2, levelName: "Chamber 2", score: 710, stars: 3, time: 28, moves: 4, timestamp: Date.now() },
      { level: 3, levelName: "Chamber 3", score: 850, stars: 3, time: 22, moves: 3, timestamp: Date.now() }
    ];
  }

  public resetAllProgress() {
    this.data = getDefaultSaveData();
    this.save();
  }
}

export const SaveSys = new SaveManager();
