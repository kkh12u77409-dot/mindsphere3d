import { AchievementDefinition, AchievementProgress, SaveData } from '../types/game';

export interface ExtendedAchievementDefinition extends AchievementDefinition {
  calculateProgress: (
    save: SaveData,
    sessionStats?: {
      moves?: number;
      time?: number;
      levelId?: number;
      hintsUsed?: number;
      isTimeAttack?: boolean;
      score?: number;
    }
  ) => AchievementProgress;
}

export const ACHIEVEMENTS: ExtendedAchievementDefinition[] = [
  {
    id: 'speed_10s',
    icon: 'Clock',
    category: 'speed',
    target: 10,
    unit: { en: 'seconds', ar: 'ثوانٍ' },
    title: {
      en: 'Quantum Velocity',
      ar: 'السرعة الكمومية'
    },
    description: {
      en: 'Finish any chamber in under 10 seconds.',
      ar: 'أنهِ أي غرفة في أقل من 10 ثوانٍ.'
    },
    calculateProgress: (save, session) => {
      // Find best (lowest) completion time across completedLevels and history
      let bestTime = 999999;

      if (save.completedLevels) {
        Object.values(save.completedLevels).forEach(lvl => {
          if (lvl.bestTime && lvl.bestTime > 0) {
            bestTime = Math.min(bestTime, lvl.bestTime);
          }
        });
      }

      if (save.history) {
        save.history.forEach(h => {
          if (h.time && h.time > 0) {
            bestTime = Math.min(bestTime, h.time);
          }
        });
      }

      if (session && typeof session.time === 'number' && session.time > 0) {
        bestTime = Math.min(bestTime, session.time);
      }

      const isUnlocked =
        Boolean(save.unlockedAchievements?.[`speed_10s`]) ||
        (bestTime < 999999 && bestTime < 10);

      const displayVal = bestTime < 999999 ? bestTime : 0;
      const percentage = isUnlocked
        ? 100
        : displayVal > 0
        ? Math.min(95, Math.max(10, Math.round((10 / displayVal) * 100)))
        : 0;

      return {
        current: displayVal,
        target: 10,
        percentage,
        isUnlocked,
        formattedProgress: isUnlocked
          ? `Best: ${displayVal}s (Goal: < 10s)`
          : displayVal > 0
          ? `Best: ${displayVal}s / < 10s`
          : 'Goal: < 10s'
      };
    }
  },
  {
    id: 'moves_100',
    icon: 'Activity',
    category: 'moves',
    target: 100,
    unit: { en: 'moves', ar: 'حركة' },
    title: {
      en: 'Centurion Mind',
      ar: 'مئوية الحركات'
    },
    description: {
      en: 'Execute 100 total moves across your puzzle journey.',
      ar: 'قم بتنفيذ 100 حركة إجمالية خلال رحلتك.'
    },
    calculateProgress: (save, session) => {
      const current = save.totalMoves || 0;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['moves_100']) || current >= 100;
      const percentage = Math.min(100, Math.round((current / 100) * 100));

      return {
        current,
        target: 100,
        percentage,
        isUnlocked,
        formattedProgress: `${Math.min(current, 100)} / 100 moves`
      };
    }
  },
  {
    id: 'moves_250',
    icon: 'Zap',
    category: 'moves',
    target: 250,
    unit: { en: 'moves', ar: 'حركة' },
    title: {
      en: 'Grand Strategist',
      ar: 'خبير التكتيك'
    },
    description: {
      en: 'Execute 250 total moves across your puzzle journey.',
      ar: 'قم بتنفيذ 250 حركة إجمالية خلال رحلتك.'
    },
    calculateProgress: (save, session) => {
      const current = save.totalMoves || 0;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['moves_250']) || current >= 250;
      const percentage = Math.min(100, Math.round((current / 250) * 100));

      return {
        current,
        target: 250,
        percentage,
        isUnlocked,
        formattedProgress: `${Math.min(current, 250)} / 250 moves`
      };
    }
  },
  {
    id: 'first_chamber',
    icon: 'CheckCircle2',
    category: 'mastery',
    target: 1,
    unit: { en: 'chamber', ar: 'غرفة' },
    title: {
      en: 'First Awakening',
      ar: 'الصحوة الأولى'
    },
    description: {
      en: 'Successfully calibrate and solve your very first chamber.',
      ar: 'قم بمعايرة وحل غرفتك الأولى بنجاح.'
    },
    calculateProgress: (save, session) => {
      const completedCount = Object.keys(save.completedLevels || {}).length;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['first_chamber']) ||
        completedCount >= 1 ||
        Boolean(session && session.levelId);
      const current = isUnlocked ? 1 : Math.min(1, completedCount);

      return {
        current,
        target: 1,
        percentage: isUnlocked ? 100 : 0,
        isUnlocked,
        formattedProgress: isUnlocked ? '1 / 1 chamber' : '0 / 1 chamber'
      };
    }
  },
  {
    id: 'minimal_moves',
    icon: 'Target',
    category: 'moves',
    target: 3,
    unit: { en: 'moves', ar: 'حركات' },
    title: {
      en: 'Minimalist Calibration',
      ar: 'المعايرة الدقيقة'
    },
    description: {
      en: 'Solve any chamber using 3 moves or fewer.',
      ar: 'حل أي غرفة خلال 3 حركات أو أقل.'
    },
    calculateProgress: (save, session) => {
      let minMoves = 999999;

      if (save.completedLevels) {
        Object.values(save.completedLevels).forEach(lvl => {
          if (lvl.bestMoves && lvl.bestMoves > 0) {
            minMoves = Math.min(minMoves, lvl.bestMoves);
          }
        });
      }

      if (save.history) {
        save.history.forEach(h => {
          if (h.moves && h.moves > 0) {
            minMoves = Math.min(minMoves, h.moves);
          }
        });
      }

      if (session && typeof session.moves === 'number' && session.moves > 0) {
        minMoves = Math.min(minMoves, session.moves);
      }

      const isUnlocked =
        Boolean(save.unlockedAchievements?.['minimal_moves']) ||
        (minMoves < 999999 && minMoves <= 3);

      const displayVal = minMoves < 999999 ? minMoves : 0;
      const percentage = isUnlocked
        ? 100
        : displayVal > 0
        ? Math.min(80, Math.round((3 / displayVal) * 100))
        : 0;

      return {
        current: displayVal,
        target: 3,
        percentage,
        isUnlocked,
        formattedProgress: isUnlocked
          ? `Best: ${displayVal} moves (Goal: ≤ 3)`
          : displayVal > 0
          ? `Best: ${displayVal} / ≤ 3 moves`
          : 'Goal: ≤ 3 moves'
      };
    }
  },
  {
    id: 'three_stars_3',
    icon: 'Star',
    category: 'stars',
    target: 3,
    unit: { en: 'chambers', ar: 'غرف' },
    title: {
      en: 'Tri-Resonance Master',
      ar: 'سيد الرنين الثلاثي'
    },
    description: {
      en: 'Earn 3 stars in 3 or more chambers.',
      ar: 'احصل على 3 نجوم في 3 غرف على الأقل.'
    },
    calculateProgress: (save, session) => {
      let threeStarCount = 0;
      if (save.completedLevels) {
        Object.values(save.completedLevels).forEach(lvl => {
          if (lvl.stars === 3) threeStarCount++;
        });
      }

      const isUnlocked =
        Boolean(save.unlockedAchievements?.['three_stars_3']) ||
        threeStarCount >= 3;
      const current = Math.min(3, threeStarCount);
      const percentage = Math.min(100, Math.round((current / 3) * 100));

      return {
        current,
        target: 3,
        percentage,
        isUnlocked,
        formattedProgress: `${current} / 3 chambers (3★)`
      };
    }
  },
  {
    id: 'stars_15',
    icon: 'Sparkles',
    category: 'stars',
    target: 15,
    unit: { en: 'stars', ar: 'نجمة' },
    title: {
      en: 'Stellar Constellation',
      ar: 'الكوكبة المتألقة'
    },
    description: {
      en: 'Collect a total of 15 resonance stars across all chambers.',
      ar: 'اجمع 15 نجمة رنين إجمالية في جميع الغرف.'
    },
    calculateProgress: (save, session) => {
      const current = save.totalStars || 0;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['stars_15']) || current >= 15;
      const percentage = Math.min(100, Math.round((current / 15) * 100));

      return {
        current,
        target: 15,
        percentage,
        isUnlocked,
        formattedProgress: `${Math.min(current, 15)} / 15 stars`
      };
    }
  },
  {
    id: 'score_1000',
    icon: 'Flame',
    category: 'mastery',
    target: 1000,
    unit: { en: 'points', ar: 'نقطة' },
    title: {
      en: 'Apex Intelligence',
      ar: 'الذكاء الأقصى'
    },
    description: {
      en: 'Score 1,000+ points in a single chamber calibration.',
      ar: 'حقق 1000+ نقطة في معايرة غرفة واحدة.'
    },
    calculateProgress: (save, session) => {
      let maxScore = 0;
      if (save.completedLevels) {
        Object.values(save.completedLevels).forEach(lvl => {
          if (lvl.score) maxScore = Math.max(maxScore, lvl.score);
        });
      }
      if (save.history) {
        save.history.forEach(h => {
          if (h.score) maxScore = Math.max(maxScore, h.score);
        });
      }
      if (session && typeof session.score === 'number') {
        maxScore = Math.max(maxScore, session.score);
      }

      const isUnlocked =
        Boolean(save.unlockedAchievements?.['score_1000']) || maxScore >= 1000;
      const percentage = Math.min(100, Math.round((maxScore / 1000) * 100));

      return {
        current: maxScore,
        target: 1000,
        percentage,
        isUnlocked,
        formattedProgress: `${Math.min(maxScore, 1000)} / 1000 pts`
      };
    }
  },
  {
    id: 'time_attack_win',
    icon: 'Zap',
    category: 'speed',
    target: 1,
    unit: { en: 'victory', ar: 'انتصار' },
    title: {
      en: 'Chrono Synchronizer',
      ar: 'ملاح الزمن'
    },
    description: {
      en: 'Conquer a chamber in Time Attack mode before the clock runs out.',
      ar: 'تغلب على غرفة بنجاح في وضع تحدي الوقت قبل انتهاء العداد.'
    },
    calculateProgress: (save, session) => {
      const taWins = Object.keys(save.timeAttackRecords || {}).length;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['time_attack_win']) ||
        taWins > 0 ||
        Boolean(session && session.isTimeAttack);
      const current = isUnlocked ? 1 : 0;

      return {
        current,
        target: 1,
        percentage: isUnlocked ? 100 : 0,
        isUnlocked,
        formattedProgress: isUnlocked ? '1 / 1 Time Attack' : '0 / 1 Time Attack'
      };
    }
  },
  {
    id: 'chambers_5',
    icon: 'Compass',
    category: 'mastery',
    target: 5,
    unit: { en: 'chambers', ar: 'غرف' },
    title: {
      en: 'Vault Explorer',
      ar: 'مستكشف السراديب'
    },
    description: {
      en: 'Unlock 5 or more futuristic puzzle chambers.',
      ar: 'افتح 5 غرف مستقبلية أو أكثر.'
    },
    calculateProgress: (save, session) => {
      const unlockedCount = save.highestUnlocked || 1;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['chambers_5']) || unlockedCount >= 5;
      const current = Math.min(5, unlockedCount);
      const percentage = Math.min(100, Math.round((current / 5) * 100));

      return {
        current,
        target: 5,
        percentage,
        isUnlocked,
        formattedProgress: `${current} / 5 chambers`
      };
    }
  },
  {
    id: 'pure_intuition',
    icon: 'Brain',
    category: 'mastery',
    target: 1,
    unit: { en: 'chamber', ar: 'غرفة' },
    title: {
      en: 'Pure Intuition',
      ar: 'الحدس الخالص'
    },
    description: {
      en: 'Solve any chamber without unlocking any guidance clues.',
      ar: 'أكمل أي غرفة بدون فتح أي تلميحات توجيهية.'
    },
    calculateProgress: (save, session) => {
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['pure_intuition']) ||
        Boolean(session && session.hintsUsed === 0 && session.moves && session.moves > 0);
      const current = isUnlocked ? 1 : 0;

      return {
        current,
        target: 1,
        percentage: isUnlocked ? 100 : 0,
        isUnlocked,
        formattedProgress: isUnlocked ? '1 / 1 solved' : '0 / 1 solved'
      };
    }
  },
  {
    id: 'chambers_10',
    icon: 'Trophy',
    category: 'mastery',
    target: 10,
    unit: { en: 'chambers', ar: 'غرف' },
    title: {
      en: 'MindSphere Master',
      ar: 'سيد كرة العقل'
    },
    description: {
      en: 'Conquer and calibrate 10 different puzzle chambers.',
      ar: 'تغلب على 10 غرف مختلفة وأتمم معايرتها.'
    },
    calculateProgress: (save, session) => {
      const completedCount = Object.keys(save.completedLevels || {}).length;
      const isUnlocked =
        Boolean(save.unlockedAchievements?.['chambers_10']) ||
        completedCount >= 10;
      const current = Math.min(10, completedCount);
      const percentage = Math.min(100, Math.round((current / 10) * 100));

      return {
        current,
        target: 10,
        percentage,
        isUnlocked,
        formattedProgress: `${current} / 10 chambers`
      };
    }
  }
];
