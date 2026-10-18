import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LEVELS } from './data/levels';
import { LevelDefinition, PuzzlePlayState, SaveData } from './types/game';
import { SaveSys } from './services/save';
import { AudioSys } from './services/audio';
import {
  SupportedLanguage,
  getInitialLanguage,
  saveLanguage,
  translate
} from './services/i18n';
import { Chamber3D } from './components/Chamber3D';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelectModal } from './components/LevelSelectModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { HintsModal } from './components/HintsModal';
import { PauseModal } from './components/PauseModal';
import { VictoryModal } from './components/VictoryModal';
import { FinalVictoryModal } from './components/FinalVictoryModal';
import { SettingsModal } from './components/SettingsModal';
import { ManualModal } from './components/ManualModal';
import { Toast } from './components/Toast';

type ViewMode = 'main_menu' | 'playing';
type ActiveModal =
  | null
  | 'level_select'
  | 'analytics'
  | 'leaderboard'
  | 'hints'
  | 'pause'
  | 'victory'
  | 'final_victory'
  | 'settings'
  | 'manual';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('main_menu');
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [saveData, setSaveData] = useState<SaveData>(() => SaveSys.load());
  const [language, setLanguage] = useState<SupportedLanguage>(() => getInitialLanguage());

  // Sound toggles synced with state
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(() => AudioSys.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => AudioSys.musicEnabled);

  // Active Level definition
  const currentLevel: LevelDefinition =
    LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];

  // Puzzle gameplay state
  const [puzzleState, setPuzzleState] = useState<PuzzlePlayState>({
    solved: false,
    moves: 0,
    elapsedSeconds: 0,
    selectedOption: null,
    angles: {},
    nodes: [],
    unlockedHints: 0
  });

  const [isDoorOpening, setIsDoorOpening] = useState<boolean>(false);
  const [shakeTrigger, setShakeTrigger] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Victory stats snapshot
  const [victoryStats, setVictoryStats] = useState<{
    stars: number;
    timeSeconds: number;
    moves: number;
    score: number;
    bonus: number;
    baseScore: number;
    rank: number | null;
  }>({ stars: 0, timeSeconds: 0, moves: 0, score: 0, bonus: 0, baseScore: 0, rank: null });

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2400);
  }, []);

  const t = useCallback((k: string) => translate(k, language), [language]);

  // Sync language with document direction
  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  // Check retroactive achievements on mount
  useEffect(() => {
    const newly = SaveSys.checkAndUnlockAchievements();
    if (newly && newly.length > 0) {
      setSaveData(SaveSys.load());
    }
  }, []);

  // Load a level by ID
  const loadLevel = useCallback((lvlId: number) => {
    const def = LEVELS.find(l => l.id === lvlId) || LEVELS[0];
    setCurrentLevelId(def.id);
    setIsDoorOpening(false);
    setActiveModal(null);
    setViewMode('playing');

    const initialAngles: Record<string, number> = {};
    if (def.rings) {
      def.rings.forEach(r => {
        initialAngles[r.id] = r.initialAngle;
      });
    }

    const initialNodes = def.initialNodes ? [...def.initialNodes] : [];

    setPuzzleState({
      solved: false,
      moves: 0,
      elapsedSeconds: 0,
      selectedOption: null,
      angles: initialAngles,
      nodes: initialNodes,
      unlockedHints: 0
    });

    if (saveData.timeAttackEnabled) {
      showToast(t('time_attack_active_alert'), 'info');
    }

    AudioSys.playSelect();
  }, [saveData.timeAttackEnabled, showToast, t]);

  // Time Attack parameters
  const isTimeAttack = !!saveData.timeAttackEnabled;
  const timeAttackLimit =
    currentLevel.starCriteria && currentLevel.starCriteria.maxTime
      ? Math.max(25, currentLevel.starCriteria.maxTime)
      : 45;

  // Gameplay Timer Interval
  useEffect(() => {
    if (viewMode !== 'playing' || activeModal !== null || puzzleState.solved) {
      return;
    }

    const interval = window.setInterval(() => {
      setPuzzleState(prev => {
        if (prev.solved) return prev;
        const nextTime = prev.elapsedSeconds + 1;

        // Check Time Attack expiration
        if (isTimeAttack && nextTime >= timeAttackLimit) {
          AudioSys.playTimeout();
          showToast(t('time_expired_title'), 'error');
          setShakeTrigger(s => s + 1);
          // Reload level on timeout
          setTimeout(() => {
            loadLevel(currentLevelId);
          }, 800);
          return { ...prev, elapsedSeconds: nextTime };
        }

        // Ticking sound during last 5 seconds in Time Attack
        if (isTimeAttack && timeAttackLimit - nextTime <= 5 && timeAttackLimit - nextTime > 0) {
          AudioSys.playTick();
        }

        return { ...prev, elapsedSeconds: nextTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [viewMode, activeModal, puzzleState.solved, isTimeAttack, timeAttackLimit, showToast, t, loadLevel, currentLevelId]);

  // Calculate Stars (1 to 3)
  const calculateStars = (moves: number, timeSec: number): number => {
    const criteria = currentLevel.starCriteria || { maxMoves: 5, maxTime: 60 };
    if (moves <= criteria.maxMoves && timeSec <= criteria.maxTime) {
      return 3;
    } else if (moves <= criteria.maxMoves + 4 && timeSec <= criteria.maxTime + 30) {
      return 2;
    }
    return 1;
  };

  // Calculate Score
  const calculateScore = (moves: number, timeSec: number): { score: number; bonus: number } => {
    const stars = calculateStars(moves, timeSec);
    const timeBonus = Math.max(0, 300 - timeSec * 3);
    const movesBonus = Math.max(0, 200 - moves * 10);
    const baseScore = Math.max(100, stars * 350 + timeBonus + movesBonus);

    if (isTimeAttack) {
      const remaining = Math.max(0, timeAttackLimit - timeSec);
      const countdownBonus = Math.round(remaining * 30);
      const totalTimeAttackScore = Math.round((baseScore + countdownBonus) * 1.5);
      return { score: totalTimeAttackScore, bonus: countdownBonus };
    }

    return { score: baseScore, bonus: 0 };
  };

  // Handle Chamber Solve
  const handleSolveChamber = useCallback(
    (finalMoves: number, finalTime: number) => {
      AudioSys.playCorrect();
      showToast(t('action_correct'), 'success');

      const stars = calculateStars(finalMoves, finalTime);
      const { score, bonus } = calculateScore(finalMoves, finalTime);

      const baseScoreVal = Math.max(
        100,
        stars * 350 + Math.max(0, 300 - finalTime * 3) + Math.max(0, 200 - finalMoves * 10)
      );

      // Save progression
      const newlyUnlocked = SaveSys.recordLevelComplete(
        currentLevel.id,
        stars,
        finalTime,
        finalMoves,
        score,
        undefined,
        { hintsUsed: puzzleState.unlockedHints, isTimeAttack }
      );
      let rankAchieved: number | null = null;
      if (isTimeAttack) {
        rankAchieved = SaveSys.recordTimeAttackScore(currentLevel.id, score, finalTime, t('player_you'));
      }
      setSaveData(SaveSys.load());

      if (newlyUnlocked && newlyUnlocked.length > 0) {
        AudioSys.playAchievement();
        newlyUnlocked.forEach(ach => {
          showToast(`🏆 ${ach.title[language] || ach.title.en}`, 'success');
        });
      }

      setVictoryStats({
        stars,
        timeSeconds: finalTime,
        moves: finalMoves,
        score,
        bonus,
        baseScore: baseScoreVal,
        rank: rankAchieved
      });

      // Open 3D hydraulic blast door
      AudioSys.playDoorOpen();
      setIsDoorOpening(true);
    },
    [currentLevel, isTimeAttack, puzzleState.unlockedHints, showToast, t, language]
  );

  // Evaluates whether current state solves the level
  const checkWinCondition = (
    nextAngles: Record<string, number>,
    nextNodes: boolean[],
    nextOption: string | null
  ): boolean => {
    const def = currentLevel;

    if (def.type === 'rotation') {
      if (!def.rings) return false;
      return def.rings.every(r => (nextAngles[r.id] ?? 0) === r.targetAngle);
    }

    if (def.type === 'switch_network') {
      if (!def.targetNodes) return false;
      return nextNodes.every((val, idx) => val === def.targetNodes![idx]);
    }

    if (def.type === 'sequence' || def.type === 'pattern' || def.type === 'logic_deduction') {
      return nextOption === def.correctAnswer;
    }

    if (def.type === 'grand_puzzle') {
      const coreAligned = (nextAngles['coreRing'] ?? 180) === 0;
      const answerCorrect = nextOption === def.correctAnswer;
      return coreAligned && answerCorrect;
    }

    return false;
  };

  // Action: Rotate Ring
  const handleRotateRing = (ringId: string) => {
    if (puzzleState.solved) return;
    AudioSys.playRotate();

    const newlyUnlocked = SaveSys.recordMove();
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      AudioSys.playAchievement();
      newlyUnlocked.forEach(ach => {
        showToast(`🏆 ${ach.title[language] || ach.title.en}`, 'success');
      });
      setSaveData(SaveSys.load());
    }

    setPuzzleState(prev => {
      const currentAngle = prev.angles[ringId] || 0;
      const nextAngle = (currentAngle + 90) % 360;
      const nextAngles = { ...prev.angles, [ringId]: nextAngle };
      const nextMoves = prev.moves + 1;

      const won = checkWinCondition(nextAngles, prev.nodes, prev.selectedOption);
      if (won) {
        handleSolveChamber(nextMoves, prev.elapsedSeconds);
        return { ...prev, moves: nextMoves, angles: nextAngles, solved: true };
      }
      return { ...prev, moves: nextMoves, angles: nextAngles };
    });
  };

  // Action: Toggle Switch Node
  const handleToggleNode = (index: number) => {
    if (puzzleState.solved) return;
    AudioSys.playToggle();

    const newlyUnlocked = SaveSys.recordMove();
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      AudioSys.playAchievement();
      newlyUnlocked.forEach(ach => {
        showToast(`🏆 ${ach.title[language] || ach.title.en}`, 'success');
      });
      setSaveData(SaveSys.load());
    }

    setPuzzleState(prev => {
      const def = currentLevel;
      if (!def.adjacency || !def.adjacency[index]) return prev;

      const nextNodes = [...prev.nodes];
      def.adjacency[index].forEach(tgt => {
        nextNodes[tgt] = !nextNodes[tgt];
      });
      const nextMoves = prev.moves + 1;

      const won = checkWinCondition(prev.angles, nextNodes, prev.selectedOption);
      if (won) {
        handleSolveChamber(nextMoves, prev.elapsedSeconds);
        return { ...prev, moves: nextMoves, nodes: nextNodes, solved: true };
      }
      return { ...prev, moves: nextMoves, nodes: nextNodes };
    });
  };

  // Action: Select Multiple Choice Option
  const handleSelectOption = (option: string) => {
    if (puzzleState.solved) return;

    const newlyUnlocked = SaveSys.recordMove();
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      AudioSys.playAchievement();
      newlyUnlocked.forEach(ach => {
        showToast(`🏆 ${ach.title[language] || ach.title.en}`, 'success');
      });
      setSaveData(SaveSys.load());
    }

    setPuzzleState(prev => {
      const nextMoves = prev.moves + 1;
      const won = checkWinCondition(prev.angles, prev.nodes, option);

      if (won) {
        handleSolveChamber(nextMoves, prev.elapsedSeconds);
        return { ...prev, moves: nextMoves, selectedOption: option, solved: true };
      } else {
        AudioSys.playWrong();
        showToast(t('action_incorrect'), 'error');
        setShakeTrigger(s => s + 1);
        return { ...prev, moves: nextMoves, selectedOption: option };
      }
    });
  };

  // 3D Object direct tap / click handler
  const handle3DObjectClick = (data: {
    isRing?: boolean;
    ringId?: string;
    isSwitch?: boolean;
    nodeIndex?: number;
    isOption?: boolean;
    optionValue?: string;
  }) => {
    if (puzzleState.solved) return;
    if (data.isRing && data.ringId) {
      handleRotateRing(data.ringId);
    } else if (data.isSwitch && typeof data.nodeIndex === 'number') {
      handleToggleNode(data.nodeIndex);
    } else if (data.isOption && data.optionValue) {
      handleSelectOption(data.optionValue);
    }
  };

  const handleDoorOpened = () => {
    AudioSys.playVictory();
    setActiveModal('victory');
  };

  const hasProgress =
    saveData.highestUnlocked > 1 || Object.keys(saveData.completedLevels).length > 0;

  return (
    <div id="app-container">
      {/* 3D Three.js WebGL Chamber */}
      <Chamber3D
        level={viewMode === 'playing' ? currentLevel : null}
        puzzleState={viewMode === 'playing' ? puzzleState : null}
        isDoorOpening={isDoorOpening}
        shakeTrigger={shakeTrigger}
        onObjectClick={handle3DObjectClick}
        onDoorOpened={handleDoorOpened}
      />

      {/* Toast Notification */}
      <Toast message={toast?.message || null} type={toast?.type} />

      {/* Main Menu Screen */}
      {viewMode === 'main_menu' && (
        <MainMenu
          hasProgress={hasProgress}
          timeAttackEnabled={saveData.timeAttackEnabled}
          language={language}
          onPlay={() => {
            AudioSys.playClick();
            loadLevel(1);
          }}
          onContinue={() => {
            AudioSys.playClick();
            const target = Math.min(saveData.highestUnlocked, 15);
            loadLevel(target);
          }}
          onToggleTimeAttack={() => {
            AudioSys.playClick();
            SaveSys.data.timeAttackEnabled = !SaveSys.data.timeAttackEnabled;
            SaveSys.save();
            setSaveData(SaveSys.load());
            showToast(
              SaveSys.data.timeAttackEnabled ? '⚡ Time Attack: ON' : 'Time Attack: OFF',
              SaveSys.data.timeAttackEnabled ? 'success' : 'info'
            );
          }}
          onLevelSelect={() => {
            AudioSys.playClick();
            setActiveModal('level_select');
          }}
          onOpenAnalytics={() => {
            AudioSys.playClick();
            setActiveModal('analytics');
          }}
          onOpenLeaderboard={() => {
            AudioSys.playClick();
            setActiveModal('leaderboard');
          }}
          onOpenManual={() => {
            AudioSys.playClick();
            setActiveModal('manual');
          }}
          onOpenSettings={() => {
            AudioSys.playClick();
            setActiveModal('settings');
          }}
        />
      )}

      {/* Active Gameplay HUD */}
      {viewMode === 'playing' && (
        <HUD
          level={currentLevel}
          puzzleState={puzzleState}
          isTimeAttack={isTimeAttack}
          timeAttackLimit={timeAttackLimit}
          totalStars={saveData.totalStars}
          language={language}
          onPause={() => {
            AudioSys.playClick();
            setActiveModal('pause');
          }}
          onResetCamera={() => {
            AudioSys.playClick();
            (window as unknown as { resetChamberCamera?: () => void }).resetChamberCamera?.();
            showToast(t('reset_cam_btn'));
          }}
          onOpenAnalytics={() => {
            AudioSys.playClick();
            setActiveModal('analytics');
          }}
          onOpenLeaderboard={() => {
            AudioSys.playClick();
            setActiveModal('leaderboard');
          }}
          onToggleLanguage={() => {
            AudioSys.playClick();
            setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
          }}
          onOpenHints={() => {
            AudioSys.playClick();
            setActiveModal('hints');
          }}
          onRotateRing={handleRotateRing}
          onToggleNode={handleToggleNode}
          onSelectOption={handleSelectOption}
        />
      )}

      {/* Level Select Modal */}
      {activeModal === 'level_select' && (
        <LevelSelectModal
          levels={LEVELS}
          saveData={saveData}
          currentLevelId={currentLevelId}
          language={language}
          onSelectLevel={lvlId => {
            AudioSys.playClick();
            loadLevel(lvlId);
          }}
          onToggleTimeAttack={() => {
            AudioSys.playClick();
            SaveSys.data.timeAttackEnabled = !SaveSys.data.timeAttackEnabled;
            SaveSys.save();
            setSaveData(SaveSys.load());
            showToast(
              SaveSys.data.timeAttackEnabled ? '⚡ Time Attack: ON' : 'Time Attack: OFF',
              SaveSys.data.timeAttackEnabled ? 'success' : 'info'
            );
          }}
          onBack={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}

      {/* Intelligence Analytics & Achievements Modal */}
      {activeModal === 'analytics' && (
        <AnalyticsModal
          data={SaveSys.getRecentIntelligenceData()}
          saveData={saveData}
          language={language}
          onClose={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}

      {/* Global Leaderboard Modal */}
      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          entries={saveData.leaderboard}
          language={language}
          onUpdatePlayerName={name => {
            const player = (SaveSys.data.leaderboard || []).find(e => e.isPlayer);
            if (player) {
              player.name = name;
              SaveSys.save();
              setSaveData(SaveSys.load());
              showToast(`Callsign set: ${name}`, 'success');
            }
          }}
          onClose={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}

      {/* Hints Modal */}
      {activeModal === 'hints' && (
        <HintsModal
          level={currentLevel}
          unlockedHints={puzzleState.unlockedHints}
          language={language}
          onUnlockHint={tier => {
            AudioSys.playClick();
            setPuzzleState(prev => ({ ...prev, unlockedHints: tier }));
          }}
          onClose={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}

      {/* Pause Modal */}
      {activeModal === 'pause' && (
        <PauseModal
          language={language}
          onResume={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
          onOpenAnalytics={() => {
            AudioSys.playClick();
            setActiveModal('analytics');
          }}
          onRestartLevel={() => {
            AudioSys.playClick();
            loadLevel(currentLevelId);
          }}
          onExitToMenu={() => {
            AudioSys.playClick();
            setActiveModal(null);
            setViewMode('main_menu');
          }}
        />
      )}

      {/* Victory Modal */}
      {activeModal === 'victory' && (
        <VictoryModal
          stars={victoryStats.stars}
          timeSeconds={victoryStats.timeSeconds}
          moves={victoryStats.moves}
          score={victoryStats.score}
          bonusPoints={victoryStats.bonus}
          baseScore={victoryStats.baseScore}
          leaderboardRank={victoryStats.rank}
          isTimeAttack={isTimeAttack}
          language={language}
          onNextLevel={() => {
            AudioSys.playClick();
            if (currentLevelId < LEVELS.length) {
              loadLevel(currentLevelId + 1);
            } else {
              setActiveModal('final_victory');
            }
          }}
          onReplay={() => {
            AudioSys.playClick();
            loadLevel(currentLevelId);
          }}
          onOpenAnalytics={() => {
            AudioSys.playClick();
            setActiveModal('analytics');
          }}
          onOpenLeaderboard={() => {
            AudioSys.playClick();
            setActiveModal('leaderboard');
          }}
        />
      )}

      {/* Final Victory Modal */}
      {activeModal === 'final_victory' && (
        <FinalVictoryModal
          totalScore={saveData.totalScore}
          language={language}
          onReturnToMenu={() => {
            AudioSys.playClick();
            setActiveModal(null);
            setViewMode('main_menu');
          }}
        />
      )}

      {/* System Settings Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          language={language}
          onToggleSFX={() => {
            const next = !sfxEnabled;
            AudioSys.setSFX(next);
            setSfxEnabled(next);
            AudioSys.playClick();
          }}
          onToggleMusic={() => {
            const next = !musicEnabled;
            AudioSys.setMusic(next);
            setMusicEnabled(next);
            AudioSys.playClick();
          }}
          onToggleLanguage={() => {
            AudioSys.playClick();
            setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
          }}
          onResetProgress={() => {
            if (window.confirm(t('reset_confirm'))) {
              SaveSys.resetAllProgress();
              setSaveData(SaveSys.load());
              AudioSys.playClick();
              showToast(t('reset_done'), 'success');
              setActiveModal(null);
              setViewMode('main_menu');
            }
          }}
          onClose={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}

      {/* Manual Modal */}
      {activeModal === 'manual' && (
        <ManualModal
          language={language}
          onClose={() => {
            AudioSys.playClick();
            setActiveModal(null);
          }}
        />
      )}
    </div>
  );
};
export default App;
