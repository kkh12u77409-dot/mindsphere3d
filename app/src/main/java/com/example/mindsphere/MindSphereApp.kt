package com.example.mindsphere

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mindsphere.audio.SoundEngine
import com.example.mindsphere.data.model.*
import com.example.mindsphere.data.repository.LevelsRepository
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.dialogs.*
import com.example.mindsphere.ui.screens.GamePlayScreen
import com.example.mindsphere.ui.screens.MainMenuScreen
import com.example.mindsphere.ui.theme.*
import kotlinx.coroutines.delay

enum class ViewMode {
    MAIN_MENU,
    PLAYING
}

enum class ActiveModal {
    NONE,
    LEVEL_SELECT,
    ANALYTICS,
    LEADERBOARD,
    ACHIEVEMENTS,
    HINTS,
    PAUSE,
    VICTORY,
    FINAL_VICTORY,
    SETTINGS,
    MANUAL
}

@Composable
fun MindSphereApp() {
    val context = LocalContext.current
    val saveManager = remember { SaveManager(context) }
    val soundEngine = remember { SoundEngine(context) }

    var isArabic by remember { mutableStateOf(saveManager.isArabic) }
    val layoutDirection = if (isArabic) LayoutDirection.Rtl else LayoutDirection.Ltr

    var viewMode by remember { mutableStateOf(ViewMode.MAIN_MENU) }
    var activeModal by remember { mutableStateOf(ActiveModal.NONE) }
    var currentLevelId by remember { mutableIntStateOf(saveManager.currentLevel) }

    val currentLevel = remember(currentLevelId) { LevelsRepository.getLevelById(currentLevelId) }

    var puzzleState by remember {
        mutableStateOf(
            PuzzlePlayState(
                angles = currentLevel.rings?.associate { it.id to it.initialAngle } ?: emptyMap(),
                nodes = currentLevel.initialNodes ?: emptyList()
            )
        )
    }

    var isDoorOpening by remember { mutableStateOf(false) }
    var shakeTrigger by remember { mutableIntStateOf(0) }
    var victoryStats by remember { mutableStateOf(VictoryStats()) }

    var toastMessage by remember { mutableStateOf<String?>(null) }

    fun showToast(msg: String) {
        toastMessage = msg
    }

    LaunchedEffect(toastMessage) {
        if (toastMessage != null) {
            delay(2500)
            toastMessage = null
        }
    }

    // Time Attack Limit
    val isTimeAttack = saveManager.timeAttackEnabled
    val timeAttackLimit = maxOf(25, currentLevel.starCriteria.maxTime)

    // Load Level Function
    fun loadLevel(lvlId: Int) {
        val def = LevelsRepository.getLevelById(lvlId)
        currentLevelId = def.id
        saveManager.currentLevel = def.id
        isDoorOpening = false
        activeModal = ActiveModal.NONE
        viewMode = ViewMode.PLAYING

        val initialAngles = def.rings?.associate { it.id to it.initialAngle } ?: emptyMap()
        val initialNodes = def.initialNodes ?: emptyList()

        puzzleState = PuzzlePlayState(
            solved = false,
            moves = 0,
            elapsedSeconds = 0,
            selectedOption = null,
            angles = initialAngles,
            nodes = initialNodes,
            unlockedHints = 0
        )

        soundEngine.playSelect()
    }

    // Timer Loop
    LaunchedEffect(viewMode, activeModal, puzzleState.solved, isTimeAttack) {
        if (viewMode == ViewMode.PLAYING && activeModal == ActiveModal.NONE && !puzzleState.solved) {
            while (true) {
                delay(1000)
                if (puzzleState.solved || activeModal != ActiveModal.NONE) break

                val nextTime = puzzleState.elapsedSeconds + 1

                if (isTimeAttack && nextTime >= timeAttackLimit) {
                    soundEngine.playTimeout()
                    shakeTrigger++
                    showToast(if (isArabic) "انتهى الوقت! انهارت الترددات" else "Time Expired!")
                    delay(800)
                    loadLevel(currentLevelId)
                    break
                }

                if (isTimeAttack && timeAttackLimit - nextTime in 1..5) {
                    soundEngine.playTick()
                }

                puzzleState = puzzleState.copy(elapsedSeconds = nextTime)
            }
        }
    }

    // Check Puzzle Solved Handler
    fun checkSolved(state: PuzzlePlayState): Boolean {
        return when (currentLevel.type) {
            PuzzleType.ROTATION -> {
                val rings = currentLevel.rings ?: return false
                rings.all { ring ->
                    val angle = (state.angles[ring.id] ?: ring.initialAngle).toInt() % 360
                    angle == 0
                }
            }
            PuzzleType.SWITCH_NETWORK -> {
                val targets = currentLevel.targetNodes ?: return false
                state.nodes.size == targets.size && state.nodes.indices.all { state.nodes[it] == targets[it] }
            }
            PuzzleType.SEQUENCE, PuzzleType.PATTERN, PuzzleType.LOGIC_DEDUCTION -> {
                state.selectedOption == currentLevel.correctAnswer
            }
            PuzzleType.GRAND_PUZZLE -> {
                val rings = currentLevel.rings ?: return false
                val ringsAligned = rings.all { ring ->
                    val angle = (state.angles[ring.id] ?: ring.initialAngle).toInt() % 360
                    angle == 0
                }
                ringsAligned && state.selectedOption == currentLevel.correctAnswer
            }
        }
    }

    // Victory Handler
    fun handleVictory(finalState: PuzzlePlayState) {
        soundEngine.playCorrect()
        isDoorOpening = true

        val moves = finalState.moves
        val timeSec = finalState.elapsedSeconds

        // Calculate Stars
        val criteria = currentLevel.starCriteria
        val stars = if (moves <= criteria.maxMoves && timeSec <= criteria.maxTime) 3
        else if (moves <= criteria.maxMoves + 4 && timeSec <= criteria.maxTime + 30) 2
        else 1

        val timeBonus = maxOf(0, 300 - timeSec * 3)
        val movesBonus = maxOf(0, 200 - moves * 10)
        val baseScore = maxOf(100, stars * 350 + timeBonus + movesBonus)

        val countdownBonus = if (isTimeAttack) {
            (maxOf(0, timeAttackLimit - timeSec) * 30)
        } else 0

        val totalScore = (baseScore * if (isTimeAttack) 1.5f else 1.0f).toInt() + countdownBonus

        val (newAchievements, rank) = saveManager.recordLevelComplete(
            levelId = currentLevel.id,
            stars = stars,
            timeSeconds = timeSec,
            moves = moves,
            score = totalScore,
            hintsUsed = finalState.unlockedHints,
            isTimeAttack = isTimeAttack
        )

        victoryStats = VictoryStats(
            stars = stars,
            timeSeconds = timeSec,
            moves = moves,
            score = totalScore,
            bonus = countdownBonus,
            baseScore = baseScore,
            rank = rank
        )

        if (newAchievements.isNotEmpty()) {
            soundEngine.playAchievement()
            showToast(if (isArabic) "تم فتح إنجاز جديد!" else "Achievement Unlocked: ${newAchievements.first().title.get(isArabic)}")
        }

        // Trigger Door and Victory Modal
        soundEngine.playDoorOpen()
    }

    LaunchedEffect(isDoorOpening) {
        if (isDoorOpening) {
            delay(1200)
            soundEngine.playVictory()
            if (currentLevelId == 15) {
                activeModal = ActiveModal.FINAL_VICTORY
            } else {
                activeModal = ActiveModal.VICTORY
            }
        }
    }

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(modifier = Modifier.fillMaxSize().background(BgPrimary)) {
            when (viewMode) {
                ViewMode.MAIN_MENU -> {
                    MainMenuScreen(
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onPlayLevel = { lvlId -> loadLevel(lvlId) },
                        onOpenLevelSelect = { activeModal = ActiveModal.LEVEL_SELECT },
                        onOpenAnalytics = { activeModal = ActiveModal.ANALYTICS },
                        onOpenLeaderboard = { activeModal = ActiveModal.LEADERBOARD },
                        onOpenAchievements = { activeModal = ActiveModal.ACHIEVEMENTS },
                        onOpenManual = { activeModal = ActiveModal.MANUAL },
                        onOpenSettings = { activeModal = ActiveModal.SETTINGS },
                        onToggleTimeAttack = {
                            saveManager.timeAttackEnabled = !saveManager.timeAttackEnabled
                            soundEngine.playSelect()
                        }
                    )
                }

                ViewMode.PLAYING -> {
                    BackHandler {
                        if (activeModal != ActiveModal.NONE) {
                            activeModal = ActiveModal.NONE
                        } else {
                            activeModal = ActiveModal.PAUSE
                        }
                    }

                    GamePlayScreen(
                        level = currentLevel,
                        puzzleState = puzzleState,
                        isDoorOpening = isDoorOpening,
                        shakeTrigger = shakeTrigger,
                        isArabic = isArabic,
                        isTimeAttack = isTimeAttack,
                        timeLimitSeconds = timeAttackLimit,
                        soundEngine = soundEngine,
                        onBackToMenu = {
                            activeModal = ActiveModal.PAUSE
                        },
                        onPause = {
                            activeModal = ActiveModal.PAUSE
                        },
                        onOpenHints = {
                            activeModal = ActiveModal.HINTS
                        },
                        onSelectOption = { opt ->
                            if (puzzleState.solved) return@GamePlayScreen
                            soundEngine.playClick()
                            val nextMoves = puzzleState.moves + 1
                            val nextState = puzzleState.copy(selectedOption = opt, moves = nextMoves)
                            puzzleState = nextState
                            saveManager.recordMove()

                            if (checkSolved(nextState)) {
                                puzzleState = nextState.copy(solved = true)
                                handleVictory(nextState)
                            } else {
                                soundEngine.playWrong()
                                shakeTrigger++
                                showToast(if (isArabic) "عدم تطابق في التردد! جرب خياراً آخر" else "Frequency mismatch!")
                            }
                        },
                        onRotateRing = { ringId, delta ->
                            if (puzzleState.solved) return@GamePlayScreen
                            soundEngine.playRotate()
                            val currentAngle = puzzleState.angles[ringId] ?: 0f
                            val newAngle = ((currentAngle + delta) % 360 + 360) % 360
                            val newAngles = puzzleState.angles.toMutableMap().apply { put(ringId, newAngle) }
                            val nextMoves = puzzleState.moves + 1
                            val nextState = puzzleState.copy(angles = newAngles, moves = nextMoves)
                            puzzleState = nextState
                            saveManager.recordMove()

                            if (checkSolved(nextState)) {
                                puzzleState = nextState.copy(solved = true)
                                handleVictory(nextState)
                            }
                        },
                        onToggleNode = { nodeIdx ->
                            if (puzzleState.solved) return@GamePlayScreen
                            soundEngine.playToggle()
                            val adjacency = currentLevel.adjacency ?: emptyList()
                            val neighbors = adjacency.getOrNull(nodeIdx) ?: listOf(nodeIdx)
                            val newNodes = puzzleState.nodes.toMutableList()
                            neighbors.forEach { n ->
                                if (n in newNodes.indices) {
                                    newNodes[n] = !newNodes[n]
                                }
                            }
                            val nextMoves = puzzleState.moves + 1
                            val nextState = puzzleState.copy(nodes = newNodes, moves = nextMoves)
                            puzzleState = nextState
                            saveManager.recordMove()

                            if (checkSolved(nextState)) {
                                puzzleState = nextState.copy(solved = true)
                                handleVictory(nextState)
                            }
                        }
                    )
                }
            }

            // Toast overlay
            AnimatedVisibility(
                visible = toastMessage != null,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .statusBarsPadding()
                    .padding(top = 70.dp)
            ) {
                toastMessage?.let { msg ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(BgPanelSolid)
                            .border(1.dp, BorderGlow, RoundedCornerShape(20.dp))
                            .padding(horizontal = 16.dp, vertical = 10.dp)
                    ) {
                        Text(
                            text = msg,
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Active Modals & Dialogs
            when (activeModal) {
                ActiveModal.LEVEL_SELECT -> {
                    LevelSelectDialog(
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onDismiss = { activeModal = ActiveModal.NONE },
                        onSelectLevel = { lvlId -> loadLevel(lvlId) }
                    )
                }
                ActiveModal.ANALYTICS -> {
                    AnalyticsDialog(
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.LEADERBOARD -> {
                    LeaderboardDialog(
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.ACHIEVEMENTS -> {
                    AchievementsDialog(
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.HINTS -> {
                    HintsDialog(
                        level = currentLevel,
                        puzzleState = puzzleState,
                        isArabic = isArabic,
                        onUnlockNextHint = {
                            puzzleState = puzzleState.copy(unlockedHints = puzzleState.unlockedHints + 1)
                            soundEngine.playSelect()
                        },
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.PAUSE -> {
                    PauseDialog(
                        isArabic = isArabic,
                        onResume = { activeModal = ActiveModal.NONE },
                        onRestart = { loadLevel(currentLevelId) },
                        onExitToMenu = {
                            activeModal = ActiveModal.NONE
                            viewMode = ViewMode.MAIN_MENU
                        }
                    )
                }
                ActiveModal.VICTORY -> {
                    VictoryDialog(
                        stats = victoryStats,
                        isArabic = isArabic,
                        hasNextLevel = currentLevelId < 15,
                        onNextLevel = { loadLevel(currentLevelId + 1) },
                        onReplay = { loadLevel(currentLevelId) }
                    )
                }
                ActiveModal.FINAL_VICTORY -> {
                    FinalVictoryDialog(
                        totalScore = saveManager.getTotalScore(),
                        isArabic = isArabic,
                        onFinish = {
                            activeModal = ActiveModal.NONE
                            viewMode = ViewMode.MAIN_MENU
                        }
                    )
                }
                ActiveModal.SETTINGS -> {
                    SettingsDialog(
                        soundEngine = soundEngine,
                        saveManager = saveManager,
                        isArabic = isArabic,
                        onLanguageChange = { newArabic ->
                            isArabic = newArabic
                            saveManager.isArabic = newArabic
                        },
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.MANUAL -> {
                    ManualDialog(
                        isArabic = isArabic,
                        onDismiss = { activeModal = ActiveModal.NONE }
                    )
                }
                ActiveModal.NONE -> {}
            }
        }
    }
}
