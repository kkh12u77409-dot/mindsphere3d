export type EnvironmentTheme = 'neon' | 'crystal' | 'quantum';

export type PuzzleType =
  | 'sequence'
  | 'rotation'
  | 'switch_network'
  | 'pattern'
  | 'logic_deduction'
  | 'grand_puzzle';

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface RingDefinition {
  id: string;
  initialAngle: number;
  targetAngle: number;
  label: LocalizedString;
}

export interface LevelDefinition {
  id: number;
  environment: EnvironmentTheme;
  type: PuzzleType;
  title: LocalizedString;
  objective: LocalizedString;
  question?: string;
  gridDescription?: string;
  clues?: LocalizedString[];
  options?: string[];
  correctAnswer?: string;
  rings?: RingDefinition[];
  nodeCount?: number;
  initialNodes?: boolean[];
  targetNodes?: boolean[];
  adjacency?: number[][];
  explanation?: LocalizedString;
  hints: {
    tier1: LocalizedString;
    tier2: LocalizedString;
    tier3: LocalizedString;
  };
  starCriteria: {
    maxMoves: number;
    maxTime: number;
  };
}

export interface GhostCameraKeyframe {
  t: number;
  theta: number;
  phi: number;
  radius: number;
}

export interface GhostMoveKeyframe {
  t: number;
  type: 'ring' | 'node' | 'option';
  ringId?: string;
  nodeIndex?: number;
  optionValue?: string;
}

export interface GhostRecording {
  levelId: number;
  totalTime: number;
  movesCount: number;
  cameraFrames: GhostCameraKeyframe[];
  moveFrames: GhostMoveKeyframe[];
}

export interface CompletedLevelStats {
  stars: number;
  bestTime: number;
  bestMoves: number;
  score: number;
  ghostRecording?: GhostRecording;
}

export interface HistoryRecord {
  level: number;
  levelName: string;
  score: number;
  stars: number;
  time: number;
  moves: number;
  timestamp: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
  flag: string;
  isPlayer?: boolean;
}

export interface SaveData {
  version: number;
  highestUnlocked: number;
  currentLevel: number;
  completedLevels: Record<number, CompletedLevelStats>;
  history: HistoryRecord[];
  timeAttackEnabled: boolean;
  timeAttackRecords: Record<number, { bestScore: number; bestTime: number }>;
  leaderboard: LeaderboardEntry[];
  totalStars: number;
  totalScore: number;
  timestamp: number;
}

export interface PuzzlePlayState {
  solved: boolean;
  moves: number;
  elapsedSeconds: number;
  selectedOption: string | null;
  angles: Record<string, number>;
  nodes: boolean[];
  unlockedHints: number;
}
