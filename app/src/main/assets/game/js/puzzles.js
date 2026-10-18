// Deterministic Puzzle Evaluation & State Engine for MindSphere 3D
class PuzzleController {
  constructor() {
    this.currentLevel = null;
    this.state = {
      solved: false,
      moves: 0,
      startTime: 0,
      elapsedSeconds: 0,
      selectedOption: null,
      angles: {},         // For rotation puzzles: { [ringId]: degrees }
      nodes: [],          // For switch network: boolean array
      unlockedHints: 0    // 0, 1, 2, or 3
    };
  }

  loadLevel(levelDef) {
    this.currentLevel = levelDef;
    this.state.solved = false;
    this.state.moves = 0;
    this.state.startTime = Date.now();
    this.state.elapsedSeconds = 0;
    this.state.selectedOption = null;
    this.state.unlockedHints = 0;
    this.state.angles = {};
    this.state.nodes = [];

    if (levelDef.rings) {
      levelDef.rings.forEach(r => {
        this.state.angles[r.id] = r.initialAngle;
      });
    }

    if (levelDef.initialNodes) {
      this.state.nodes = [...levelDef.initialNodes];
    }
  }

  // Action: Rotate Ring by step (default 90°)
  rotateRing(ringId, stepDeg = 90) {
    if (this.state.solved) return false;
    this.state.moves++;
    const current = this.state.angles[ringId] || 0;
    const next = (current + stepDeg) % 360;
    this.state.angles[ringId] = next < 0 ? next + 360 : next;
    return this.checkSolution();
  }

  // Action: Toggle switch node in network
  toggleNode(index) {
    if (this.state.solved) return false;
    this.state.moves++;
    const def = this.currentLevel;
    if (!def.adjacency || !def.adjacency[index]) return false;

    // Flip index and its neighbors
    const targets = def.adjacency[index];
    targets.forEach(tgt => {
      this.state.nodes[tgt] = !this.state.nodes[tgt];
    });

    return this.checkSolution();
  }

  // Action: Select multiple-choice option
  selectOption(optionValue) {
    if (this.state.solved) return false;
    this.state.moves++;
    this.state.selectedOption = optionValue;
    return this.checkSolution();
  }

  // Evaluate whether current state satisfies level win condition
  checkSolution() {
    const def = this.currentLevel;
    if (!def) return false;

    if (def.type === "rotation") {
      let allAligned = true;
      for (const r of def.rings) {
        const cur = this.state.angles[r.id];
        if (cur !== r.targetAngle) {
          allAligned = false;
          break;
        }
      }
      if (allAligned) {
        this.state.solved = true;
        return true;
      }
      return false;
    }

    if (def.type === "switch_network") {
      const allActive = this.state.nodes.every((val, i) => val === def.targetNodes[i]);
      if (allActive) {
        this.state.solved = true;
        return true;
      }
      return false;
    }

    if (def.type === "sequence" || def.type === "pattern" || def.type === "logic_deduction") {
      if (this.state.selectedOption === def.correctAnswer) {
        this.state.solved = true;
        return true;
      }
      return false;
    }

    if (def.type === "grand_puzzle") {
      const ringAligned = (this.state.angles["coreRing"] === 0);
      const answerCorrect = (this.state.selectedOption === def.correctAnswer);
      if (ringAligned && answerCorrect) {
        this.state.solved = true;
        return true;
      }
      return false;
    }

    return false;
  }

  // Compute stars (1 to 3) based on performance
  calculateStars() {
    const criteria = this.currentLevel.starCriteria || { maxMoves: 5, maxTime: 60 };
    const moves = this.state.moves;
    const time = this.state.elapsedSeconds;

    if (moves <= criteria.maxMoves && time <= criteria.maxTime) {
      return 3;
    } else if (moves <= criteria.maxMoves + 4 && time <= criteria.maxTime + 30) {
      return 2;
    }
    return 1;
  }

  calculateScore(isTimeAttack = false, remainingSeconds = 0) {
    const stars = this.calculateStars();
    const timeBonus = Math.max(0, 300 - this.state.elapsedSeconds * 3);
    const movesBonus = Math.max(0, 200 - this.state.moves * 10);
    const baseScore = Math.max(100, stars * 350 + timeBonus + movesBonus);

    if (isTimeAttack) {
      const countdownBonus = Math.max(0, Math.round(remainingSeconds * 30));
      const totalTimeAttackScore = Math.round((baseScore + countdownBonus) * 1.5);
      return {
        totalScore: totalTimeAttackScore,
        bonus: countdownBonus,
        baseScore: baseScore,
        valueOf: function() { return this.totalScore; },
        toString: function() { return this.totalScore.toString(); }
      };
    }

    return {
      totalScore: baseScore,
      bonus: 0,
      baseScore: baseScore,
      valueOf: function() { return this.totalScore; },
      toString: function() { return this.totalScore.toString(); }
    };
  }
}

const PuzzleSys = new PuzzleController();
