package com.example.mindsphere.data.repository

import com.example.mindsphere.data.model.*

object AchievementsRepository {
    val list: List<AchievementDefinition> = listOf(
        AchievementDefinition(
            id = "speed_10s",
            iconName = "Clock",
            category = AchievementCategory.SPEED,
            title = LocalizedString("Quantum Velocity", "السرعة الكمومية"),
            description = LocalizedString("Finish any chamber in under 10 seconds.", "أنهِ أي غرفة في أقل من 10 ثوانٍ."),
            target = 10,
            unit = LocalizedString("seconds", "ثوانٍ")
        ),
        AchievementDefinition(
            id = "moves_100",
            iconName = "Activity",
            category = AchievementCategory.MOVES,
            title = LocalizedString("Centurion Mind", "مئوية الحركات"),
            description = LocalizedString("Execute 100 total moves across your puzzle journey.", "قم بتنفيذ 100 حركة إجمالية خلال رحلتك."),
            target = 100,
            unit = LocalizedString("moves", "حركة")
        ),
        AchievementDefinition(
            id = "moves_250",
            iconName = "Zap",
            category = AchievementCategory.MOVES,
            title = LocalizedString("Grand Strategist", "خبير التكتيك"),
            description = LocalizedString("Execute 250 total moves across your puzzle journey.", "قم بتنفيذ 250 حركة إجمالية خلال رحلتك."),
            target = 250,
            unit = LocalizedString("moves", "حركة")
        ),
        AchievementDefinition(
            id = "first_chamber",
            iconName = "CheckCircle",
            category = AchievementCategory.MASTERY,
            title = LocalizedString("First Awakening", "الصحوة الأولى"),
            description = LocalizedString("Successfully calibrate and solve your very first chamber.", "قم بمعايرة وحل غرفتك الأولى بنجاح."),
            target = 1,
            unit = LocalizedString("chamber", "غرفة")
        ),
        AchievementDefinition(
            id = "minimal_moves",
            iconName = "Target",
            category = AchievementCategory.MOVES,
            title = LocalizedString("Minimalist Calibration", "المعايرة الدقيقة"),
            description = LocalizedString("Solve any chamber using 3 moves or fewer.", "حل أي غرفة خلال 3 حركات أو أقل."),
            target = 3,
            unit = LocalizedString("moves", "حركات")
        ),
        AchievementDefinition(
            id = "three_stars_3",
            iconName = "Star",
            category = AchievementCategory.STARS,
            title = LocalizedString("Tri-Resonance Master", "سيد الرنين الثلاثي"),
            description = LocalizedString("Earn 3 stars in 3 or more chambers.", "احصل على 3 نجوم في 3 غرف على الأقل."),
            target = 3,
            unit = LocalizedString("chambers", "غرف")
        ),
        AchievementDefinition(
            id = "stars_15",
            iconName = "Sparkles",
            category = AchievementCategory.STARS,
            title = LocalizedString("Stellar Constellation", "الكوكبة المتألقة"),
            description = LocalizedString("Collect a total of 15 resonance stars across all chambers.", "اجمع 15 نجمة رنين إجمالية في جميع الغرف."),
            target = 15,
            unit = LocalizedString("stars", "نجمة")
        ),
        AchievementDefinition(
            id = "score_1000",
            iconName = "Flame",
            category = AchievementCategory.MASTERY,
            title = LocalizedString("Apex Intelligence", "الذكاء الأقصى"),
            description = LocalizedString("Score 1,000+ points in a single chamber calibration.", "حقق 1000+ نقطة في معايرة غرفة واحدة."),
            target = 1000,
            unit = LocalizedString("points", "نقطة")
        ),
        AchievementDefinition(
            id = "time_attack_win",
            iconName = "Zap",
            category = AchievementCategory.SPEED,
            title = LocalizedString("Chrono Synchronizer", "ملاح الزمن"),
            description = LocalizedString("Conquer a chamber in Time Attack mode before the clock runs out.", "تغلب على غرفة بنجاح في وضع تحدي الوقت قبل انتهاء العداد."),
            target = 1,
            unit = LocalizedString("victory", "انتصار")
        ),
        AchievementDefinition(
            id = "chambers_5",
            iconName = "Compass",
            category = AchievementCategory.MASTERY,
            title = LocalizedString("Vault Explorer", "مستكشف السراديب"),
            description = LocalizedString("Unlock 5 or more futuristic puzzle chambers.", "افتح 5 غرف مستقبلية أو أكثر."),
            target = 5,
            unit = LocalizedString("chambers", "غرف")
        ),
        AchievementDefinition(
            id = "pure_intuition",
            iconName = "Psychology",
            category = AchievementCategory.MASTERY,
            title = LocalizedString("Pure Intuition", "الحدس الخالص"),
            description = LocalizedString("Solve any chamber without unlocking any guidance clues.", "أكمل أي غرفة بدون فتح أي تلميحات توجيهية."),
            target = 1,
            unit = LocalizedString("chamber", "غرفة")
        ),
        AchievementDefinition(
            id = "chambers_10",
            iconName = "EmojiEvents",
            category = AchievementCategory.MASTERY,
            title = LocalizedString("MindSphere Master", "سيد كرة العقل"),
            description = LocalizedString("Conquer and calibrate 10 different puzzle chambers.", "تغلب على 10 غرف مختلفة وأتمم معايرتها."),
            target = 10,
            unit = LocalizedString("chambers", "غرف")
        )
    )

    fun calculateProgress(
        ach: AchievementDefinition,
        completedLevels: Map<Int, CompletedLevelStats>,
        history: List<HistoryRecord>,
        totalStars: Int,
        totalMoves: Int,
        highestUnlocked: Int,
        unlockedMap: Map<String, Long>,
        timeAttackRecords: Map<Int, TimeAttackRecord>,
        sessionMoves: Int? = null,
        sessionTime: Int? = null,
        sessionHints: Int? = null,
        sessionScore: Int? = null,
        isTimeAttack: Boolean = false
    ): AchievementProgress {
        val alreadyUnlocked = unlockedMap.containsKey(ach.id)

        when (ach.id) {
            "speed_10s" -> {
                var bestTime = 999999
                completedLevels.values.forEach { if (it.bestTime in 1..<bestTime) bestTime = it.bestTime }
                history.forEach { if (it.time in 1..<bestTime) bestTime = it.time }
                if (sessionTime != null && sessionTime in 1..<bestTime) bestTime = sessionTime
                val unlocked = alreadyUnlocked || (bestTime < 10)
                val display = if (bestTime < 999999) bestTime else 0
                val pct = if (unlocked) 100 else if (display > 0) ((10f / display) * 100).toInt().coerceIn(10, 95) else 0
                return AchievementProgress(display, 10, pct, unlocked, if (unlocked) "Best: ${display}s (< 10s)" else "Goal: < 10s")
            }
            "moves_100" -> {
                val current = totalMoves
                val unlocked = alreadyUnlocked || current >= 100
                val pct = ((current.toFloat() / 100f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(current, 100, pct, unlocked, "${current.coerceAtMost(100)} / 100 moves")
            }
            "moves_250" -> {
                val current = totalMoves
                val unlocked = alreadyUnlocked || current >= 250
                val pct = ((current.toFloat() / 250f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(current, 250, pct, unlocked, "${current.coerceAtMost(250)} / 250 moves")
            }
            "first_chamber" -> {
                val count = completedLevels.size
                val unlocked = alreadyUnlocked || count >= 1
                return AchievementProgress(if (unlocked) 1 else 0, 1, if (unlocked) 100 else 0, unlocked, if (unlocked) "1 / 1 chamber" else "0 / 1 chamber")
            }
            "minimal_moves" -> {
                var minMoves = 999999
                completedLevels.values.forEach { if (it.bestMoves in 1..<minMoves) minMoves = it.bestMoves }
                history.forEach { if (it.moves in 1..<minMoves) minMoves = it.moves }
                if (sessionMoves != null && sessionMoves in 1..<minMoves) minMoves = sessionMoves
                val unlocked = alreadyUnlocked || (minMoves <= 3)
                val display = if (minMoves < 999999) minMoves else 0
                val pct = if (unlocked) 100 else if (display > 0) ((3f / display) * 100).toInt().coerceIn(10, 80) else 0
                return AchievementProgress(display, 3, pct, unlocked, if (unlocked) "Best: $display moves (≤ 3)" else "Goal: ≤ 3 moves")
            }
            "three_stars_3" -> {
                val count = completedLevels.values.count { it.stars == 3 }
                val unlocked = alreadyUnlocked || count >= 3
                val pct = ((count.toFloat() / 3f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(count.coerceAtMost(3), 3, pct, unlocked, "${count.coerceAtMost(3)} / 3 chambers (3★)")
            }
            "stars_15" -> {
                val current = totalStars
                val unlocked = alreadyUnlocked || current >= 15
                val pct = ((current.toFloat() / 15f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(current.coerceAtMost(15), 15, pct, unlocked, "${current.coerceAtMost(15)} / 15 stars")
            }
            "score_1000" -> {
                var maxScore = 0
                completedLevels.values.forEach { if (it.score > maxScore) maxScore = it.score }
                history.forEach { if (it.score > maxScore) maxScore = it.score }
                if (sessionScore != null && sessionScore > maxScore) maxScore = sessionScore
                val unlocked = alreadyUnlocked || maxScore >= 1000
                val pct = ((maxScore.toFloat() / 1000f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(maxScore, 1000, pct, unlocked, "${maxScore.coerceAtMost(1000)} / 1000 pts")
            }
            "time_attack_win" -> {
                val wins = timeAttackRecords.size
                val unlocked = alreadyUnlocked || wins > 0 || isTimeAttack
                return AchievementProgress(if (unlocked) 1 else 0, 1, if (unlocked) 100 else 0, unlocked, if (unlocked) "1 / 1 Time Attack" else "0 / 1 Time Attack")
            }
            "chambers_5" -> {
                val count = highestUnlocked.coerceAtLeast(1)
                val unlocked = alreadyUnlocked || count >= 5
                val pct = ((count.toFloat() / 5f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(count.coerceAtMost(5), 5, pct, unlocked, "${count.coerceAtMost(5)} / 5 chambers")
            }
            "pure_intuition" -> {
                val unlocked = alreadyUnlocked || (sessionHints == 0 && (sessionMoves ?: 0) > 0)
                return AchievementProgress(if (unlocked) 1 else 0, 1, if (unlocked) 100 else 0, unlocked, if (unlocked) "1 / 1 solved" else "0 / 1 solved")
            }
            "chambers_10" -> {
                val count = completedLevels.size
                val unlocked = alreadyUnlocked || count >= 10
                val pct = ((count.toFloat() / 10f) * 100).toInt().coerceIn(0, 100)
                return AchievementProgress(count.coerceAtMost(10), 10, pct, unlocked, "${count.coerceAtMost(10)} / 10 chambers")
            }
            else -> return AchievementProgress(0, 1, 0, false, "In Progress")
        }
    }
}
