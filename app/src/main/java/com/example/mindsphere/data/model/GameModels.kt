package com.example.mindsphere.data.model

enum class EnvironmentTheme(val displayNameEn: String, val displayNameAr: String) {
    NEON("Neon Laboratory", "مختبر النيون"),
    CRYSTAL("Crystal Temple", "معبد البلورات"),
    QUANTUM("Quantum Vault", "قبو الكوانتم")
}

enum class PuzzleType {
    SEQUENCE,
    ROTATION,
    SWITCH_NETWORK,
    PATTERN,
    LOGIC_DEDUCTION,
    GRAND_PUZZLE
}

data class LocalizedString(
    val en: String,
    val ar: String
) {
    fun get(isArabic: Boolean): String = if (isArabic) ar else en
}

data class RingDefinition(
    val id: String,
    val initialAngle: Float,
    val targetAngle: Float,
    val label: LocalizedString
)

data class StarCriteria(
    val maxMoves: Int,
    val maxTime: Int
)

data class HintsDefinition(
    val tier1: LocalizedString,
    val tier2: LocalizedString,
    val tier3: LocalizedString
)

data class LevelDefinition(
    val id: Int,
    val environment: EnvironmentTheme,
    val type: PuzzleType,
    val title: LocalizedString,
    val objective: LocalizedString,
    val question: String? = null,
    val gridDescription: String? = null,
    val clues: List<LocalizedString>? = null,
    val options: List<String>? = null,
    val correctAnswer: String? = null,
    val rings: List<RingDefinition>? = null,
    val nodeCount: Int? = null,
    val initialNodes: List<Boolean>? = null,
    val targetNodes: List<Boolean>? = null,
    val adjacency: List<List<Int>>? = null,
    val explanation: LocalizedString? = null,
    val hints: HintsDefinition,
    val starCriteria: StarCriteria
)

data class CompletedLevelStats(
    val stars: Int = 0,
    val bestTime: Int = 999999,
    val bestMoves: Int = 999999,
    val score: Int = 0
)

data class HistoryRecord(
    val level: Int,
    val levelName: String,
    val score: Int,
    val stars: Int,
    val time: Int,
    val moves: Int,
    val timestamp: Long
)

data class LeaderboardEntry(
    val rank: Int,
    val name: String,
    val score: Int,
    val time: String,
    val flag: String,
    val isPlayer: Boolean = false
)

data class TimeAttackRecord(
    val bestScore: Int = 0,
    val bestTime: Int = 999
)

enum class AchievementCategory {
    SPEED,
    MOVES,
    STARS,
    MASTERY
}

data class AchievementDefinition(
    val id: String,
    val iconName: String,
    val category: AchievementCategory,
    val title: LocalizedString,
    val description: LocalizedString,
    val target: Int,
    val unit: LocalizedString
)

data class AchievementProgress(
    val current: Int,
    val target: Int,
    val percentage: Int,
    val isUnlocked: Boolean,
    val formattedProgress: String
)

data class PuzzlePlayState(
    val solved: Boolean = false,
    val moves: Int = 0,
    val elapsedSeconds: Int = 0,
    val selectedOption: String? = null,
    val angles: Map<String, Float> = emptyMap(),
    val nodes: List<Boolean> = emptyList(),
    val unlockedHints: Int = 0
)

data class VictoryStats(
    val stars: Int = 0,
    val timeSeconds: Int = 0,
    val moves: Int = 0,
    val score: Int = 0,
    val bonus: Int = 0,
    val baseScore: Int = 0,
    val rank: Int? = null
)
