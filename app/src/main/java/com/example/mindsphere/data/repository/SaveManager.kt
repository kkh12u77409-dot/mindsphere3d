package com.example.mindsphere.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.example.mindsphere.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONArray
import org.json.JSONObject

class SaveManager(private val context: Context?) {
    private val prefs: SharedPreferences? = context?.getSharedPreferences("mindsphere_save_v1", Context.MODE_PRIVATE)

    var highestUnlocked: Int = 1
        private set
    var currentLevel: Int = 1
    var totalMoves: Int = 9
        private set
    var timeAttackEnabled: Boolean = false
    var isArabic: Boolean = false

    val completedLevels = mutableMapOf<Int, CompletedLevelStats>()
    val history = mutableListOf<HistoryRecord>()
    val leaderboard = mutableListOf<LeaderboardEntry>()
    val unlockedAchievements = mutableMapOf<String, Long>()
    val timeAttackRecords = mutableMapOf<Int, TimeAttackRecord>()

    private val _dataVersion = MutableStateFlow(0)
    val dataVersion: StateFlow<Int> = _dataVersion.asStateFlow()

    init {
        loadDefaults()
        load()
    }

    private fun loadDefaults() {
        highestUnlocked = 1
        currentLevel = 1
        totalMoves = 9
        timeAttackEnabled = false
        isArabic = false

        completedLevels.clear()
        history.clear()
        history.addAll(
            listOf(
                HistoryRecord(1, "Chamber 1", 620, 2, 35, 2, System.currentTimeMillis() - 3600000),
                HistoryRecord(2, "Chamber 2", 710, 3, 28, 4, System.currentTimeMillis() - 1800000),
                HistoryRecord(3, "Chamber 3", 850, 3, 22, 3, System.currentTimeMillis() - 600000)
            )
        )

        leaderboard.clear()
        leaderboard.addAll(
            listOf(
                LeaderboardEntry(1, "NovaSol_AI", 14500, "00:14", "🌐"),
                LeaderboardEntry(2, "QuantumMind_X", 13200, "00:18", "⚡"),
                LeaderboardEntry(3, "CyberSage", 12100, "00:21", "🔮"),
                LeaderboardEntry(4, "NexusPrime", 11450, "00:24", "🧠"),
                LeaderboardEntry(5, "NeonSynapse", 9800, "00:27", "💎"),
                LeaderboardEntry(6, "AstroLogic", 8750, "00:30", "🚀")
            )
        )
    }

    fun getTotalStars(): Int = completedLevels.values.sumOf { it.stars }
    fun getTotalScore(): Int = completedLevels.values.sumOf { it.score }

    fun isLevelUnlocked(levelId: Int): Boolean {
        if (levelId == 1) return true
        return highestUnlocked >= levelId
    }

    fun recordMove(): List<AchievementDefinition> {
        totalMoves++
        val newlyUnlocked = checkAchievements()
        save()
        _dataVersion.value++
        return newlyUnlocked
    }

    fun checkAchievements(
        moves: Int? = null,
        timeSec: Int? = null,
        hints: Int? = null,
        score: Int? = null,
        isTimeAttack: Boolean = false
    ): List<AchievementDefinition> {
        val newly = mutableListOf<AchievementDefinition>()
        AchievementsRepository.list.forEach { ach ->
            if (!unlockedAchievements.containsKey(ach.id)) {
                val progress = AchievementsRepository.calculateProgress(
                    ach = ach,
                    completedLevels = completedLevels,
                    history = history,
                    totalStars = getTotalStars(),
                    totalMoves = totalMoves,
                    highestUnlocked = highestUnlocked,
                    unlockedMap = unlockedAchievements,
                    timeAttackRecords = timeAttackRecords,
                    sessionMoves = moves,
                    sessionTime = timeSec,
                    sessionHints = hints,
                    sessionScore = score,
                    isTimeAttack = isTimeAttack
                )
                if (progress.isUnlocked) {
                    unlockedAchievements[ach.id] = System.currentTimeMillis()
                    newly.add(ach)
                }
            }
        }
        return newly
    }

    fun recordLevelComplete(
        levelId: Int,
        stars: Int,
        timeSeconds: Int,
        moves: Int,
        score: Int,
        hintsUsed: Int = 0,
        isTimeAttack: Boolean = false
    ): Pair<List<AchievementDefinition>, Int?> {
        val prev = completedLevels[levelId] ?: CompletedLevelStats()
        completedLevels[levelId] = CompletedLevelStats(
            stars = maxOf(prev.stars, stars),
            bestTime = minOf(prev.bestTime, timeSeconds),
            bestMoves = minOf(prev.bestMoves, moves),
            score = maxOf(prev.score, score)
        )

        history.add(
            HistoryRecord(
                level = levelId,
                levelName = "Chamber $levelId",
                score = score,
                stars = stars,
                time = timeSeconds,
                moves = moves,
                timestamp = System.currentTimeMillis()
            )
        )
        if (history.size > 10) {
            history.removeAt(0)
        }

        if (levelId + 1 > highestUnlocked && levelId < 15) {
            highestUnlocked = levelId + 1
        }

        var playerRank: Int? = null
        if (isTimeAttack) {
            playerRank = recordTimeAttackScore(levelId, score, timeSeconds)
        }

        val newly = checkAchievements(
            moves = moves,
            timeSec = timeSeconds,
            hints = hintsUsed,
            score = score,
            isTimeAttack = isTimeAttack
        )

        save()
        _dataVersion.value++
        return Pair(newly, playerRank)
    }

    private fun recordTimeAttackScore(levelId: Int, score: Int, timeSec: Int): Int {
        val prev = timeAttackRecords[levelId] ?: TimeAttackRecord()
        timeAttackRecords[levelId] = TimeAttackRecord(
            bestScore = maxOf(prev.bestScore, score),
            bestTime = minOf(prev.bestTime, timeSec)
        )

        val timeStr = String.format("00:%02d", timeSec)
        val playerEntry = LeaderboardEntry(
            rank = 99,
            name = if (isArabic) "أنت" else "You",
            score = score,
            time = timeStr,
            flag = "👑",
            isPlayer = true
        )

        val board = leaderboard.filter { !it.isPlayer }.toMutableList()
        board.add(playerEntry)
        board.sortByDescending { it.score }

        leaderboard.clear()
        board.take(8).forEachIndexed { index, entry ->
            leaderboard.add(entry.copy(rank = index + 1))
        }

        val rank = leaderboard.indexOfFirst { it.isPlayer } + 1
        return if (rank > 0) rank else 9
    }

    fun resetProgress() {
        loadDefaults()
        unlockedAchievements.clear()
        timeAttackRecords.clear()
        save()
        _dataVersion.value++
    }

    private fun save() {
        val p = prefs ?: return
        try {
            val json = JSONObject()
            json.put("highestUnlocked", highestUnlocked)
            json.put("currentLevel", currentLevel)
            json.put("totalMoves", totalMoves)
            json.put("timeAttackEnabled", timeAttackEnabled)
            json.put("isArabic", isArabic)

            val compObj = JSONObject()
            completedLevels.forEach { (k, v) ->
                val o = JSONObject()
                o.put("stars", v.stars)
                o.put("bestTime", v.bestTime)
                o.put("bestMoves", v.bestMoves)
                o.put("score", v.score)
                compObj.put(k.toString(), o)
            }
            json.put("completedLevels", compObj)

            val achObj = JSONObject()
            unlockedAchievements.forEach { (k, v) -> achObj.put(k, v) }
            json.put("unlockedAchievements", achObj)

            p.edit().putString("save_json", json.toString()).apply()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun load() {
        val p = prefs ?: return
        try {
            val raw = p.getString("save_json", null) ?: return
            val json = JSONObject(raw)
            highestUnlocked = json.optInt("highestUnlocked", 1)
            currentLevel = json.optInt("currentLevel", 1)
            totalMoves = json.optInt("totalMoves", 9)
            timeAttackEnabled = json.optBoolean("timeAttackEnabled", false)
            isArabic = json.optBoolean("isArabic", false)

            val compObj = json.optJSONObject("completedLevels")
            if (compObj != null) {
                completedLevels.clear()
                compObj.keys().forEach { k ->
                    val o = compObj.getJSONObject(k)
                    completedLevels[k.toInt()] = CompletedLevelStats(
                        stars = o.optInt("stars", 0),
                        bestTime = o.optInt("bestTime", 999999),
                        bestMoves = o.optInt("bestMoves", 999999),
                        score = o.optInt("score", 0)
                    )
                }
            }

            val achObj = json.optJSONObject("unlockedAchievements")
            if (achObj != null) {
                unlockedAchievements.clear()
                achObj.keys().forEach { k ->
                    unlockedAchievements[k] = achObj.optLong(k, System.currentTimeMillis())
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
