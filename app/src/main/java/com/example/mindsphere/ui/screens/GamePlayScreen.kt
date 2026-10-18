package com.example.mindsphere.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mindsphere.audio.SoundEngine
import com.example.mindsphere.data.model.*
import com.example.mindsphere.ui.components.Chamber3DCanvas
import com.example.mindsphere.ui.theme.*

@Composable
fun GamePlayScreen(
    level: LevelDefinition,
    puzzleState: PuzzlePlayState,
    isDoorOpening: Boolean,
    shakeTrigger: Int,
    isArabic: Boolean,
    isTimeAttack: Boolean,
    timeLimitSeconds: Int,
    soundEngine: SoundEngine,
    onBackToMenu: () -> Unit,
    onPause: () -> Unit,
    onOpenHints: () -> Unit,
    onSelectOption: (String) -> Unit,
    onRotateRing: (ringId: String, delta: Float) -> Unit,
    onToggleNode: (nodeIndex: Int) -> Unit
) {
    var resetCameraTrigger by remember { mutableIntStateOf(0) }

    val remainingSeconds = if (isTimeAttack) {
        (timeLimitSeconds - puzzleState.elapsedSeconds).coerceAtLeast(0)
    } else {
        puzzleState.elapsedSeconds
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgPrimary)
    ) {
        // 1. Center 3D Chamber Canvas
        Chamber3DCanvas(
            level = level,
            puzzleState = puzzleState,
            isDoorOpening = isDoorOpening,
            shakeTrigger = shakeTrigger,
            onResetCameraRequest = resetCameraTrigger,
            modifier = Modifier.fillMaxSize(),
            onRingClick = { ringId -> onRotateRing(ringId, 90f) },
            onNodeClick = { idx -> onToggleNode(idx) }
        )

        // 2. Top HUD Bar
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(BgPrimary.copy(alpha = 0.95f), BgPrimary.copy(alpha = 0.5f), Color.Transparent)
                    )
                )
                .statusBarsPadding()
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Back & Pause Buttons
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = onBackToMenu,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgPanel)
                            .border(1.dp, BorderSubtle, CircleShape)
                            .testTag("back_button")
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = TextMain,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = onPause,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgPanel)
                            .border(1.dp, BorderSubtle, CircleShape)
                            .testTag("pause_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Pause,
                            contentDescription = "Pause",
                            tint = TextMain,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }

                // Level Badge & Title
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(AccentCyan.copy(alpha = 0.15f))
                            .border(1.dp, AccentCyan, RoundedCornerShape(10.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (isArabic) "الغرفة ${level.id}" else "CHAMBER ${level.id}",
                            color = AccentCyan,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.8.sp
                        )
                    }
                    Text(
                        text = level.title.get(isArabic),
                        color = Color.White,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                }

                // Camera Align & Hints Buttons
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = {
                            resetCameraTrigger++
                            soundEngine.playClick()
                        },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgPanel)
                            .border(1.dp, BorderSubtle, CircleShape)
                            .testTag("reset_cam_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Videocam,
                            contentDescription = "Reset Camera",
                            tint = AccentCyan,
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    IconButton(
                        onClick = onOpenHints,
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(BgPanel)
                            .border(1.dp, AccentGold.copy(alpha = 0.6f), CircleShape)
                            .testTag("hints_button")
                    ) {
                        BadgedBox(
                            badge = {
                                if (puzzleState.unlockedHints > 0) {
                                    Badge(containerColor = AccentGold) {
                                        Text("${puzzleState.unlockedHints}")
                                    }
                                }
                            }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lightbulb,
                                contentDescription = "Hints",
                                tint = AccentGold,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Stats Pill (Time, Moves, Mode)
            Row(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .clip(RoundedCornerShape(20.dp))
                    .background(BgPanel)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(20.dp))
                    .padding(horizontal = 14.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Timer
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = if (isTimeAttack) Icons.Default.Timer else Icons.Default.Schedule,
                        contentDescription = null,
                        tint = if (isTimeAttack && remainingSeconds <= 5) AccentRed else AccentCyan,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    val mins = remainingSeconds / 60
                    val secs = remainingSeconds % 60
                    Text(
                        text = String.format("%02d:%02d", mins, secs),
                        color = if (isTimeAttack && remainingSeconds <= 5) AccentRed else Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Moves
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.TouchApp,
                        contentDescription = null,
                        tint = AccentViolet,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "${puzzleState.moves} ${if (isArabic) "حركات" else "moves"}",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Time Attack indicator
                if (isTimeAttack) {
                    Text(
                        text = "⚡ TIME ATTACK",
                        color = AccentGold,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }
        }

        // 3. Bottom Interaction Deck
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.BottomCenter)
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Transparent, BgPrimary.copy(alpha = 0.85f), BgPrimary)
                    )
                )
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Objective Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(BgPanel)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp)
            ) {
                Column {
                    Text(
                        text = if (isArabic) "الهدف المنطقي:" else "OBJECTIVE:",
                        color = AccentCyan,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = level.objective.get(isArabic),
                        color = TextMain,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Dynamic Puzzle Deck by Type
            when (level.type) {
                PuzzleType.SEQUENCE, PuzzleType.PATTERN -> {
                    SequenceOrPatternDeck(
                        question = level.question ?: level.gridDescription ?: "",
                        options = level.options ?: emptyList(),
                        selected = puzzleState.selectedOption,
                        isArabic = isArabic,
                        onSelect = onSelectOption
                    )
                }
                PuzzleType.ROTATION -> {
                    RotationDeck(
                        rings = level.rings ?: emptyList(),
                        angles = puzzleState.angles,
                        isArabic = isArabic,
                        onRotate = onRotateRing
                    )
                }
                PuzzleType.SWITCH_NETWORK -> {
                    SwitchNetworkDeck(
                        nodeCount = level.nodeCount ?: 3,
                        nodes = puzzleState.nodes,
                        isArabic = isArabic,
                        onToggle = onToggleNode
                    )
                }
                PuzzleType.LOGIC_DEDUCTION -> {
                    LogicDeductionDeck(
                        clues = level.clues ?: emptyList(),
                        options = level.options ?: emptyList(),
                        selected = puzzleState.selectedOption,
                        isArabic = isArabic,
                        onSelect = onSelectOption
                    )
                }
                PuzzleType.GRAND_PUZZLE -> {
                    GrandPuzzleDeck(
                        question = level.question ?: "",
                        rings = level.rings ?: emptyList(),
                        angles = puzzleState.angles,
                        options = level.options ?: emptyList(),
                        selected = puzzleState.selectedOption,
                        isArabic = isArabic,
                        onRotate = onRotateRing,
                        onSelect = onSelectOption
                    )
                }
            }
        }
    }
}

// ------------------- Puzzle Controls Composable Blocks -------------------

@Composable
private fun SequenceOrPatternDeck(
    question: String,
    options: List<String>,
    selected: String?,
    isArabic: Boolean,
    onSelect: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        if (question.isNotEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(BgPanelSolid)
                    .border(1.dp, BorderGlow, RoundedCornerShape(10.dp))
                    .padding(vertical = 8.dp, horizontal = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = question,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
        }

        // 2x2 or 1x4 Options Grid
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            options.take(4).forEach { option ->
                val isSelected = selected == option
                Button(
                    onClick = { onSelect(option) },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("option_$option"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) AccentCyan else BgPanelSolid,
                        contentColor = if (isSelected) BgPrimary else TextMain
                    ),
                    shape = RoundedCornerShape(10.dp),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(listOf(BorderGlow, BorderGlow))
                    )
                ) {
                    Text(
                        text = option,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

@Composable
private fun RotationDeck(
    rings: List<RingDefinition>,
    angles: Map<String, Float>,
    isArabic: Boolean,
    onRotate: (String, Float) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        rings.forEach { ring ->
            val angle = (angles[ring.id] ?: ring.initialAngle).toInt() % 360
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(BgPanelSolid)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = ring.label.get(isArabic),
                        color = TextMain,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                    Text(
                        text = "$angle° (Target: 0°)",
                        color = if (angle == 0) AccentGreen else AccentCyan,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilledTonalButton(
                        onClick = { onRotate(ring.id, -90f) },
                        modifier = Modifier
                            .height(38.dp)
                            .testTag("rotate_ccw_${ring.id}"),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("-90°", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = { onRotate(ring.id, 90f) },
                        modifier = Modifier
                            .height(38.dp)
                            .testTag("rotate_cw_${ring.id}"),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = BgPrimary),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("+90°", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun SwitchNetworkDeck(
    nodeCount: Int,
    nodes: List<Boolean>,
    isArabic: Boolean,
    onToggle: (Int) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = if (isArabic) "انقر على المفاتيح لإشعال جميع العقد" else "Toggle conduits to ignite all power nodes",
            color = TextDim,
            fontSize = 11.sp
        )
        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            for (i in 0 until nodeCount) {
                val isActive = nodes.getOrElse(i) { false }
                Box(
                    modifier = Modifier
                        .size(54.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isActive) AccentGreen.copy(alpha = 0.25f) else BgPanelSolid)
                        .border(
                            1.5.dp,
                            if (isActive) AccentGreen else BorderGlow,
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { onToggle(i) }
                        .testTag("node_switch_$i"),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            imageVector = if (isActive) Icons.Default.Bolt else Icons.Default.PowerSettingsNew,
                            contentDescription = null,
                            tint = if (isActive) AccentGreen else TextDim,
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "${i + 1}",
                            color = if (isActive) AccentGreen else TextMain,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun LogicDeductionDeck(
    clues: List<LocalizedString>,
    options: List<String>,
    selected: String?,
    isArabic: Boolean,
    onSelect: (String) -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        // Clues box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(10.dp))
                .background(BgPanelSolid)
                .border(1.dp, BorderSubtle, RoundedCornerShape(10.dp))
                .padding(10.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = if (isArabic) "قراءات المستشعرات:" else "TELEMETRY CLUES:",
                    color = AccentGold,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
                clues.take(3).forEachIndexed { idx, clue ->
                    Text(
                        text = "• ${clue.get(isArabic)}",
                        color = TextMain,
                        fontSize = 11.sp
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Options
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            options.take(4).forEach { option ->
                val isSelected = selected == option
                Button(
                    onClick = { onSelect(option) },
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp)
                        .testTag("logic_opt_$option"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) AccentGold else BgPanelSolid,
                        contentColor = if (isSelected) BgPrimary else TextMain
                    ),
                    shape = RoundedCornerShape(8.dp),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(listOf(BorderGlow, BorderGlow))
                    )
                ) {
                    Text(
                        text = option,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                }
            }
        }
    }
}

@Composable
private fun GrandPuzzleDeck(
    question: String,
    rings: List<RingDefinition>,
    angles: Map<String, Float>,
    options: List<String>,
    selected: String?,
    isArabic: Boolean,
    onRotate: (String, Float) -> Unit,
    onSelect: (String) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Ring control
        rings.firstOrNull()?.let { ring ->
            val angle = (angles[ring.id] ?: ring.initialAngle).toInt() % 360
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .background(BgPanelSolid)
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${ring.label.get(isArabic)}: $angle° (0° required)",
                    color = if (angle == 0) AccentGreen else AccentCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Button(
                    onClick = { onRotate(ring.id, 90f) },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = BgPrimary),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.height(34.dp)
                ) {
                    Text("Rotate +90°", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Equation Question
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(BgPanelSolid)
                .padding(vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = question,
                color = AccentGold,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold
            )
        }

        // Options
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            options.take(4).forEach { option ->
                val isSelected = selected == option
                Button(
                    onClick = { onSelect(option) },
                    modifier = Modifier
                        .weight(1f)
                        .height(42.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) AccentGold else BgPanelSolid,
                        contentColor = if (isSelected) BgPrimary else TextMain
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(option, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
