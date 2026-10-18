package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mindsphere.data.model.AchievementCategory
import com.example.mindsphere.data.repository.AchievementsRepository
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun AchievementsDialog(
    saveManager: SaveManager,
    isArabic: Boolean,
    onDismiss: () -> Unit
) {
    var filterType by remember { mutableStateOf("ALL") }

    val achievements = AchievementsRepository.list

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(1.dp, BorderGlow, RoundedCornerShape(20.dp))
                .padding(18.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Stars, contentDescription = null, tint = AccentViolet)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isArabic) "الإنجازات العصبية" else "Neural Milestones",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                // Filter Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FilterChip(
                        selected = filterType == "ALL",
                        onClick = { filterType = "ALL" },
                        label = { Text(if (isArabic) "كافة الإنجازات" else "All", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = filterType == "UNLOCKED",
                        onClick = { filterType = "UNLOCKED" },
                        label = { Text(if (isArabic) "المكتملة" else "Unlocked", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = filterType == "LOCKED",
                        onClick = { filterType = "LOCKED" },
                        label = { Text(if (isArabic) "قيد الإنجاز" else "In Progress", fontSize = 11.sp) }
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                // List
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(achievements) { ach ->
                        val progress = AchievementsRepository.calculateProgress(
                            ach = ach,
                            completedLevels = saveManager.completedLevels,
                            history = saveManager.history,
                            totalStars = saveManager.getTotalStars(),
                            totalMoves = saveManager.totalMoves,
                            highestUnlocked = saveManager.highestUnlocked,
                            unlockedMap = saveManager.unlockedAchievements,
                            timeAttackRecords = saveManager.timeAttackRecords
                        )

                        if (filterType == "UNLOCKED" && !progress.isUnlocked) return@items
                        if (filterType == "LOCKED" && progress.isUnlocked) return@items

                        val catColor = when (ach.category) {
                            AchievementCategory.SPEED -> AccentCyan
                            AchievementCategory.MOVES -> AccentViolet
                            AchievementCategory.STARS -> AccentGold
                            AchievementCategory.MASTERY -> AccentGreen
                        }

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (progress.isUnlocked) BgSecondary else BgPanel)
                                .border(
                                    1.dp,
                                    if (progress.isUnlocked) catColor.copy(alpha = 0.5f) else BorderSubtle,
                                    RoundedCornerShape(12.dp)
                                )
                                .padding(12.dp)
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (progress.isUnlocked) Icons.Default.CheckCircle else Icons.Default.Lock,
                                            contentDescription = null,
                                            tint = if (progress.isUnlocked) AccentGreen else TextDim,
                                            modifier = Modifier.size(18.dp)
                                        )
                                        Text(
                                            text = ach.title.get(isArabic),
                                            color = TextMain,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }

                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(catColor.copy(alpha = 0.15f))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = ach.category.name,
                                            color = catColor,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }

                                Text(
                                    text = ach.description.get(isArabic),
                                    color = TextDim,
                                    fontSize = 11.sp,
                                    lineHeight = 15.sp
                                )

                                // Progress Bar
                                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                    LinearProgressIndicator(
                                        progress = { (progress.percentage / 100f).coerceIn(0f, 1f) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(5.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = catColor,
                                        trackColor = BgPanelSolid
                                    )
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = progress.formattedProgress,
                                            color = TextDim,
                                            fontSize = 10.sp
                                        )
                                        Text(
                                            text = "${progress.percentage}%",
                                            color = catColor,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .testTag("close_achievements_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentViolet, contentColor = BgPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(if (isArabic) "إغلاق" else "Close", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
