// Main MindSphere 3D Game Coordinator & UI Manager
class MindSphereGame {
  constructor() {
    this.engine = null;
    this.timerInterval = null;
    this.currentLevelIndex = 0; // 0-indexed for LEVELS array
    this.isPaused = false;
  }

  start() {
    try {
      this.bindUI();
      this.updateHUDStats();
      this.updateTimeAttackToggleUI();
      setLanguage(getCurrentLanguage());

      if (SaveSys.data.highestUnlocked > 1 || Object.keys(SaveSys.data.completedLevels).length > 0) {
        const btnCont = document.getElementById("btn-continue");
        if (btnCont) btnCont.style.display = "flex";
      }

      window.addEventListener("languageChanged", () => {
        this.refreshCurrentLevelUI();
      });

      this.showScreen("screen-main-menu");
    } catch (uiErr) {
      console.warn("UI initialization note:", uiErr);
    }

    try {
      const container = document.getElementById("canvas-container");
      if (container) {
        this.engine = new Chamber3DEngine(container);
        this.engine.onObjectClick = (data) => this.handle3DObjectClick(data);
      }
    } catch (engineErr) {
      console.warn("Chamber3DEngine note:", engineErr);
    }

    if (window.AndroidBridge && typeof window.AndroidBridge.logEvent === "function") {
      window.AndroidBridge.logEvent("game_initialized");
    }
  }

  bindUI() {
    // Menu buttons
    document.getElementById("btn-play").addEventListener("click", () => {
      AudioSys.playClick();
      this.loadLevelById(1);
    });

    document.getElementById("btn-continue").addEventListener("click", () => {
      AudioSys.playClick();
      const target = Math.min(SaveSys.data.highestUnlocked, 15);
      this.loadLevelById(target);
    });

    document.getElementById("btn-level-select").addEventListener("click", () => {
      AudioSys.playClick();
      this.showLevelSelectScreen();
    });

    document.getElementById("btn-level-select-back")?.addEventListener("click", () => {
      AudioSys.playClick();
      this.exitToMenu();
    });

    document.getElementById("btn-settings").addEventListener("click", () => {
      AudioSys.playClick();
      this.showSettingsScreen();
    });

    document.getElementById("btn-intelligence-chart")?.addEventListener("click", () => {
      AudioSys.playClick();
      window.IntelligenceChart?.renderChart();
      this.showModal("modal-intelligence-chart");
    });

    document.getElementById("hud-btn-analytics")?.addEventListener("click", () => {
      AudioSys.playClick();
      window.IntelligenceChart?.renderChart();
      this.showModal("modal-intelligence-chart");
    });

    document.getElementById("btn-pause-analytics")?.addEventListener("click", () => {
      AudioSys.playClick();
      window.IntelligenceChart?.renderChart();
      this.showModal("modal-intelligence-chart");
    });

    document.getElementById("btn-victory-analytics")?.addEventListener("click", () => {
      AudioSys.playClick();
      window.IntelligenceChart?.renderChart();
      this.showModal("modal-intelligence-chart");
    });

    document.getElementById("btn-leaderboard")?.addEventListener("click", () => {
      AudioSys.playClick();
      this.showLeaderboardModal();
    });

    document.getElementById("hud-btn-leaderboard")?.addEventListener("click", () => {
      AudioSys.playClick();
      this.showLeaderboardModal();
    });

    document.getElementById("btn-victory-leaderboard")?.addEventListener("click", () => {
      AudioSys.playClick();
      this.showLeaderboardModal();
    });

    const toggleTimeAttackBtn = document.getElementById("toggle-time-attack");
    if (toggleTimeAttackBtn) {
      toggleTimeAttackBtn.addEventListener("click", () => {
        AudioSys.playClick();
        SaveSys.data.timeAttackEnabled = !SaveSys.data.timeAttackEnabled;
        SaveSys.save();
        this.updateTimeAttackToggleUI();
        this.showToast(
          SaveSys.data.timeAttackEnabled ? "⚡ Time Attack: ON" : "Time Attack: OFF",
          SaveSys.data.timeAttackEnabled ? "success" : "info"
        );
      });
    }

    document.getElementById("btn-manual").addEventListener("click", () => {
      AudioSys.playClick();
      this.showModal("modal-manual");
    });

    // HUD buttons
    document.getElementById("hud-btn-pause").addEventListener("click", () => {
      AudioSys.playClick();
      this.pauseGame();
    });

    document.getElementById("hud-btn-hints").addEventListener("click", () => {
      AudioSys.playClick();
      this.showHintsModal();
    });

    document.getElementById("hud-btn-reset-cam").addEventListener("click", () => {
      AudioSys.playClick();
      this.engine.resetCamera();
      this.showToast(t("reset_cam_btn"));
    });

    document.getElementById("hud-btn-lang").addEventListener("click", () => {
      AudioSys.playClick();
      const nextLang = getCurrentLanguage() === "ar" ? "en" : "ar";
      setLanguage(nextLang);
    });

    // Pause Modal Buttons
    document.getElementById("btn-resume").addEventListener("click", () => {
      AudioSys.playClick();
      this.resumeGame();
    });

    document.getElementById("btn-restart-level").addEventListener("click", () => {
      AudioSys.playClick();
      this.closeAllModals();
      this.loadLevelById(LEVELS[this.currentLevelIndex].id);
    });

    document.getElementById("btn-exit-menu").addEventListener("click", () => {
      AudioSys.playClick();
      this.exitToMenu();
    });

    // Victory Modal Buttons
    document.getElementById("btn-next-chamber").addEventListener("click", () => {
      AudioSys.playClick();
      this.closeAllModals();
      if (this.currentLevelIndex + 1 < LEVELS.length) {
        this.loadLevelById(LEVELS[this.currentLevelIndex + 1].id);
      } else {
        this.showModal("modal-final-victory");
      }
    });

    document.getElementById("btn-replay-chamber").addEventListener("click", () => {
      AudioSys.playClick();
      this.closeAllModals();
      this.loadLevelById(LEVELS[this.currentLevelIndex].id);
    });

    // Final Victory
    document.getElementById("btn-final-return").addEventListener("click", () => {
      AudioSys.playClick();
      this.exitToMenu();
    });

    // Settings
    document.getElementById("toggle-sfx").addEventListener("click", (e) => {
      AudioSys.setSFX(!AudioSys.sfxEnabled);
      e.target.textContent = AudioSys.sfxEnabled ? "ON" : "OFF";
      e.target.classList.toggle("on", AudioSys.sfxEnabled);
      AudioSys.playClick();
    });

    document.getElementById("toggle-music").addEventListener("click", (e) => {
      AudioSys.setMusic(!AudioSys.musicEnabled);
      e.target.textContent = AudioSys.musicEnabled ? "ON" : "OFF";
      e.target.classList.toggle("on", AudioSys.musicEnabled);
      AudioSys.playClick();
    });

    document.getElementById("btn-toggle-lang").addEventListener("click", () => {
      AudioSys.playClick();
      const nextLang = getCurrentLanguage() === "ar" ? "en" : "ar";
      setLanguage(nextLang);
    });

    document.getElementById("btn-reset-progress").addEventListener("click", () => {
      if (confirm(t("reset_confirm"))) {
        SaveSys.resetAllProgress();
        AudioSys.playClick();
        this.showToast(t("reset_done"), "success");
        this.closeAllModals();
        this.showScreen("screen-main-menu");
        document.getElementById("btn-continue").style.display = "none";
      }
    });

    // Close buttons on generic modals
    document.querySelectorAll(".modal-close-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        AudioSys.playClick();
        this.closeAllModals();
      });
    });

    // Environment tabs in Level Select
    document.querySelectorAll(".env-tab").forEach(tab => {
      tab.addEventListener("click", (e) => {
        document.querySelectorAll(".env-tab").forEach(t => t.classList.remove("active"));
        e.target.classList.add("active");
        this.filterLevelSelect(e.target.dataset.env);
      });
    });
  }

  loadLevelById(levelId) {
    const idx = LEVELS.findIndex(l => l.id === levelId);
    if (idx === -1) return;
    this.currentLevelIndex = idx;
    const def = LEVELS[idx];

    this.closeAllModals();
    this.hideAllScreens();
    document.getElementById("ui-hud").style.display = "flex";

    // Initialize puzzle state
    PuzzleSys.loadLevel(def);
    this.isTimeAttack = !!SaveSys.data.timeAttackEnabled;
    this.timeAttackLimit = (def.starCriteria && def.starCriteria.maxTime) ? Math.max(25, def.starCriteria.maxTime) : 45;
    this.timeAttackExpiredNotified = false;

    // Set 3D environment theme and rebuild 3D scene objects
    this.engine.setEnvironmentTheme(def.environment);
    this.engine.buildPuzzle3D(def, PuzzleSys.state);
    this.engine.resetCamera();

    // Start timer
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !PuzzleSys.state.solved) {
        PuzzleSys.state.elapsedSeconds++;
        this.updateHUDTimer();
      }
    }, 1000);

    this.refreshCurrentLevelUI();
    AudioSys.playSelect();
  }

  refreshCurrentLevelUI() {
    const def = LEVELS[this.currentLevelIndex];
    if (!def) return;
    const lang = getCurrentLanguage();

    // Chamber Badge & Title
    const envName = t("env_" + def.environment);
    document.getElementById("hud-env-badge").textContent = envName;
    document.getElementById("hud-level-title").textContent = def.title[lang] || def.title.en;
    document.getElementById("hud-objective-text").textContent = def.objective[lang] || def.objective.en;

    const timeAttackBadge = document.getElementById("hud-time-attack-badge");
    if (timeAttackBadge) {
      timeAttackBadge.style.display = this.isTimeAttack ? "inline-flex" : "none";
    }
    const timeLbl = document.getElementById("hud-time-lbl");
    if (timeLbl) {
      timeLbl.textContent = this.isTimeAttack ? t("time_remaining") : t("time_label");
    }

    this.updateHUDTimer();
    this.updateHUDMoves();
    this.buildPuzzleControlHUD(def);
  }

  buildPuzzleControlHUD(def) {
    const panel = document.getElementById("hud-puzzle-controls");
    panel.innerHTML = "";

    const lang = getCurrentLanguage();

    if (def.type === "rotation" || def.type === "grand_puzzle") {
      // Dials for each ring
      const dialGroup = document.createElement("div");
      dialGroup.className = "puzzle-dial-group";

      def.rings.forEach(ring => {
        const ringBtn = document.createElement("button");
        ringBtn.className = "hud-btn";
        const ringName = ring.label[lang] || ring.label.en;
        const curAngle = PuzzleSys.state.angles[ring.id] || 0;
        ringBtn.innerHTML = `<span>⟳</span> <strong>${ringName}: ${curAngle}°</strong>`;
        ringBtn.addEventListener("click", () => {
          this.handleRingRotation(ring.id);
        });
        dialGroup.appendChild(ringBtn);
      });
      panel.appendChild(dialGroup);
    }

    if (def.type === "switch_network") {
      const swGroup = document.createElement("div");
      swGroup.className = "puzzle-options-row";

      for (let i = 0; i < def.nodeCount; i++) {
        const swBtn = document.createElement("button");
        const isActive = PuzzleSys.state.nodes[i];
        swBtn.className = `puzzle-option-btn ${isActive ? "selected" : ""}`;
        swBtn.textContent = `Node ${i + 1} ${isActive ? "⚡" : "○"}`;
        swBtn.addEventListener("click", () => {
          this.handleNodeToggle(i);
        });
        swGroup.appendChild(swBtn);
      }
      panel.appendChild(swGroup);
    }

    if (def.type === "sequence" || def.type === "pattern" || def.type === "logic_deduction" || def.type === "grand_puzzle") {
      // Question or pattern representation
      if (def.question) {
        const qDiv = document.createElement("div");
        qDiv.style.fontWeight = "700";
        qDiv.style.color = "var(--accent-cyan)";
        qDiv.style.marginBottom = "4px";
        qDiv.textContent = def.question;
        panel.appendChild(qDiv);
      } else if (def.gridDescription) {
        const gDiv = document.createElement("pre");
        gDiv.style.fontSize = "12px";
        gDiv.style.color = "var(--accent-cyan)";
        gDiv.style.whiteSpace = "pre-line";
        gDiv.style.fontFamily = "inherit";
        gDiv.style.marginBottom = "4px";
        gDiv.textContent = def.gridDescription;
        panel.appendChild(gDiv);
      } else if (def.clues) {
        const clueDiv = document.createElement("div");
        clueDiv.style.fontSize = "12px";
        clueDiv.style.textAlign = "start";
        clueDiv.style.color = "var(--text-dim)";
        clueDiv.style.marginBottom = "6px";
        clueDiv.innerHTML = def.clues.map(c => `• ${c[lang] || c.en}`).join("<br>");
        panel.appendChild(clueDiv);
      }

      // Options
      const optRow = document.createElement("div");
      optRow.className = "puzzle-options-row";

      def.options.forEach(opt => {
        const btn = document.createElement("button");
        const isSel = PuzzleSys.state.selectedOption === opt;
        btn.className = `puzzle-option-btn ${isSel ? "selected" : ""}`;
        btn.textContent = opt;
        btn.addEventListener("click", () => {
          this.handleOptionSelect(opt);
        });
        optRow.appendChild(btn);
      });
      panel.appendChild(optRow);
    }
  }

  // 3D Object Interaction Click Handler
  handle3DObjectClick(data) {
    if (PuzzleSys.state.solved) return;

    if (data.isRing) {
      this.handleRingRotation(data.ringId);
    } else if (data.isSwitch) {
      this.handleNodeToggle(data.nodeIndex);
    } else if (data.isOption) {
      this.handleOptionSelect(data.optionValue);
    }
  }

  handleRingRotation(ringId) {
    AudioSys.playRotate();
    const solved = PuzzleSys.rotateRing(ringId, 90);
    this.updateHUDMoves();

    // Rebuild or update 3D ring rotation
    this.engine.buildPuzzle3D(LEVELS[this.currentLevelIndex], PuzzleSys.state);
    this.buildPuzzleControlHUD(LEVELS[this.currentLevelIndex]);

    if (solved) {
      this.triggerChamberSolve();
    }
  }

  handleNodeToggle(nodeIndex) {
    AudioSys.playToggle();
    const solved = PuzzleSys.toggleNode(nodeIndex);
    this.updateHUDMoves();

    this.engine.buildPuzzle3D(LEVELS[this.currentLevelIndex], PuzzleSys.state);
    this.buildPuzzleControlHUD(LEVELS[this.currentLevelIndex]);

    if (solved) {
      this.triggerChamberSolve();
    }
  }

  handleOptionSelect(optionValue) {
    const solved = PuzzleSys.selectOption(optionValue);
    this.updateHUDMoves();

    this.engine.buildPuzzle3D(LEVELS[this.currentLevelIndex], PuzzleSys.state);
    this.buildPuzzleControlHUD(LEVELS[this.currentLevelIndex]);

    if (solved) {
      AudioSys.playCorrect();
      this.triggerChamberSolve();
    } else {
      AudioSys.playWrong();
      this.showToast(t("action_incorrect"), "error");
    }
  }

  triggerChamberSolve() {
    AudioSys.playCorrect();
    this.showToast(t("action_correct"), "success");

    // Open 3D hydraulic blast door
    AudioSys.playDoorOpen();
    this.engine.openChamberDoor(() => {
      // After door opening animation, show victory modal
      this.showVictoryScreen();
    });
  }

  showVictoryScreen() {
    AudioSys.playVictory();
    const def = LEVELS[this.currentLevelIndex];
    const stars = PuzzleSys.calculateStars();
    const score = PuzzleSys.calculateScore();
    const timeSec = PuzzleSys.state.elapsedSeconds;
    const moves = PuzzleSys.state.moves;

    // Record in save data
    SaveSys.recordLevelComplete(def.id, stars, timeSec, moves, score);
    this.updateHUDStats();

    // Render stars animation
    const starsContainer = document.getElementById("victory-stars-row");
    starsContainer.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const star = document.createElement("span");
      star.className = `star-icon ${i <= stars ? "filled" : ""}`;
      star.textContent = "★";
      starsContainer.appendChild(star);
    }

    document.getElementById("victory-time-val").textContent = `${timeSec}s`;
    document.getElementById("victory-moves-val").textContent = `${moves}`;
    document.getElementById("victory-score-val").textContent = `${score}`;

    this.showModal("modal-victory");
  }

  showHintsModal() {
    const def = LEVELS[this.currentLevelIndex];
    if (!def) return;
    const lang = getCurrentLanguage();

    const list = document.getElementById("hints-container-list");
    list.innerHTML = "";

    const tiers = [
      { id: 1, name: t("hint_tier_1"), text: def.hints.tier1[lang] || def.hints.tier1.en },
      { id: 2, name: t("hint_tier_2"), text: def.hints.tier2[lang] || def.hints.tier2.en },
      { id: 3, name: t("hint_tier_3"), text: def.hints.tier3[lang] || def.hints.tier3.en }
    ];

    tiers.forEach((tier) => {
      const div = document.createElement("div");
      const isUnlocked = PuzzleSys.state.unlockedHints >= tier.id;
      div.className = `hint-tier ${isUnlocked ? "unlocked" : ""}`;

      div.innerHTML = `
        <div class="hint-tier-header">
          <span>${tier.name}</span>
          ${isUnlocked ? `<span>✓</span>` : `<button class="hud-btn gold" data-unlock="${tier.id}" style="padding:4px 8px;font-size:11px;">${t("unlock_hint_btn")}</button>`}
        </div>
        <div class="hint-tier-content">
          ${isUnlocked ? tier.text : `<span style="opacity:0.4;">•••••••••••••••••••••••••••••</span>`}
        </div>
      `;

      div.querySelector("[data-unlock]")?.addEventListener("click", () => {
        AudioSys.playClick();
        PuzzleSys.state.unlockedHints = tier.id;
        this.showHintsModal(); // refresh
      });

      list.appendChild(div);
    });

    this.showModal("modal-hints");
  }

  showLevelSelectScreen() {
    this.closeAllModals();
    this.hideAllScreens();
    this.showScreen("screen-level-select");
    this.filterLevelSelect("all");
  }

  filterLevelSelect(envFilter) {
    const grid = document.getElementById("levels-grid");
    grid.innerHTML = "";

    LEVELS.forEach(lvl => {
      if (envFilter !== "all" && lvl.environment !== envFilter) return;

      const isUnlocked = SaveSys.isUnlocked(lvl.id);
      const isCurrent = (this.currentLevelIndex + 1) === lvl.id;
      const completed = SaveSys.data.completedLevels[lvl.id];
      const stars = completed ? completed.stars : 0;

      const card = document.createElement("div");
      card.className = `level-card ${isUnlocked ? "unlocked" : "locked"} ${isCurrent ? "current" : ""}`;

      card.innerHTML = `
        <span class="level-card-num">${lvl.id}</span>
        <div class="level-card-stars">
          ${stars > 0 ? "★".repeat(stars) : (isUnlocked ? "○" : "🔒")}
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener("click", () => {
          AudioSys.playClick();
          this.loadLevelById(lvl.id);
        });
      }

      grid.appendChild(card);
    });
  }

  showSettingsScreen() {
    document.getElementById("toggle-sfx").textContent = AudioSys.sfxEnabled ? "ON" : "OFF";
    document.getElementById("toggle-sfx").classList.toggle("on", AudioSys.sfxEnabled);

    document.getElementById("toggle-music").textContent = AudioSys.musicEnabled ? "ON" : "OFF";
    document.getElementById("toggle-music").classList.toggle("on", AudioSys.musicEnabled);

    this.showModal("modal-settings");
  }

  pauseGame() {
    this.isPaused = true;
    this.showModal("modal-pause");
  }

  resumeGame() {
    this.isPaused = false;
    this.closeAllModals();
  }

  exitToMenu() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.isPaused = false;
    this.closeAllModals();
    this.hideAllScreens();
    document.getElementById("ui-hud").style.display = "none";
    this.showScreen("screen-main-menu");

    if (SaveSys.data.highestUnlocked > 1 || Object.keys(SaveSys.data.completedLevels).length > 0) {
      document.getElementById("btn-continue").style.display = "flex";
    }
  }

  updateHUDTimer() {
    const s = PuzzleSys.state.elapsedSeconds;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    const str = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    document.getElementById("hud-time-val").textContent = str;
  }

  updateHUDMoves() {
    document.getElementById("hud-moves-val").textContent = PuzzleSys.state.moves;
  }

  updateHUDStats() {
    document.getElementById("hud-stars-val").textContent = `${SaveSys.data.totalStars}/45`;
  }

  showToast(msg, type = "info") {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.className = `show ${type}`;
    setTimeout(() => {
      toast.className = "";
    }, 2400);
  }

  showScreen(id) {
    document.querySelectorAll(".screen-overlay").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
  }

  hideAllScreens() {
    document.querySelectorAll(".screen-overlay").forEach(s => s.classList.remove("active"));
  }

  showModal(id) {
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
  }

  closeAllModals() {
    document.querySelectorAll(".screen-overlay.modal").forEach(s => s.classList.remove("active"));
  }
}

// Global Game Instance
window.Game = new MindSphereGame();

function bootGame() {
  if (window.Game && !window.Game.isStarted) {
    window.Game.isStarted = true;
    window.Game.start();
  }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(bootGame, 1);
} else {
  window.addEventListener("DOMContentLoaded", bootGame);
  window.addEventListener("load", bootGame);
}
