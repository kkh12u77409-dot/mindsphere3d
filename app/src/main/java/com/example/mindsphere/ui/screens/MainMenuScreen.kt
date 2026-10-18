package com.example.mindsphere.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun MainMenuScreen(
    saveManager: SaveManager,
    isArabic: Boolean,
    onPlayLevel: (Int) -> Unit,
    onOpenLevelSelect: () -> Unit,
    onOpenAnalytics: () -> Unit,
    onOpenLeaderboard: () -> Unit,
    onOpenAchievements: () -> Unit,
    onOpenManual: () -> Unit,
    onOpenSettings: () -> Unit,
    onToggleTimeAttack: () -> Unit
) {
    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(BgPrimary, BgSecondary)
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .widthIn(max = 600.dp)
                .align(Alignment.Center)
                .padding(horizontal = 24.dp, vertical = 20.dp)
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // App Emblem / Glow Orb Icon
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.radialGradient(
                            colors = listOf(AccentCyan.copy(alpha = 0.35f), BgPanelSolid)
                        )
                    )
                    .border(1.5.dp, BorderGlow, RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Hexagon,
                    contentDescription = "MindSphere Core",
                    tint = AccentCyan,
                    modifier = Modifier.size(42.dp)
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Title & Subtitle
            Text(
                text = if (isArabic) "كرة العقل 3D" else "MINDSPHERE 3D",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.2.sp
            )
            Text(
                text = if (isArabic) "تحديات المنطق والإدراك المكاني" else "Logic & Spatial Cognition",
                color = AccentCyan,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Stats Bar Card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(BgPanel)
                    .border(1.dp, BorderSubtle, RoundedCornerShape(16.dp))
                    .padding(vertical = 12.dp, horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                StatColumn(
                    value = "${saveManager.getTotalStars()} ★",
                    label = if (isArabic) "الرنين" else "Stars",
                    color = AccentGold
                )
                Divider(
                    modifier = Modifier
                        .height(30.dp)
                        .width(1.dp),
                    color = BorderSubtle
                )
                StatColumn(
                    value = "${saveManager.getTotalScore()}",
                    label = if (isArabic) "النقاط" else "Score",
                    color = AccentCyan
                )
                Divider(
                    modifier = Modifier
                        .height(30.dp)
                        .width(1.dp),
                    color = BorderSubtle
                )
                StatColumn(
                    value = "${saveManager.highestUnlocked}/15",
                    label = if (isArabic) "الغرفة" else "Chamber",
                    color = AccentViolet
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Primary Play / Continue Button
            val nextChamber = saveManager.highestUnlocked.coerceIn(1, 15)
            Button(
                onClick = { onPlayLevel(nextChamber) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .testTag("play_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AccentCyan,
                    contentColor = BgPrimary
                ),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(26.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (saveManager.highestUnlocked > 1) {
                        if (isArabic) "متابعة الرحلة (غرفة $nextChamber)" else "Continue Journey (Chamber $nextChamber)"
                    } else {
                        if (isArabic) "بدء الغرفة الأولى" else "Start Chamber"
                    },
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Chamber Matrix (Level Select)
            OutlinedButton(
                onClick = onOpenLevelSelect,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
                    .testTag("level_select_button"),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = TextMain
                ),
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = Brush.horizontalGradient(listOf(AccentCyan, AccentViolet))
                ),
                shape = RoundedCornerShape(14.dp)
            ) {
                Icon(Icons.Default.GridOn, contentDescription = null, tint = AccentCyan)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isArabic) "مصفوفة الغرف" else "Chamber Matrix",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Time Attack Toggle Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(
                        if (saveManager.timeAttackEnabled)
                            Brush.horizontalGradient(listOf(AccentGold.copy(alpha = 0.2f), BgPanelSolid))
                        else
                            Brush.horizontalGradient(listOf(BgPanelSolid, BgPanel))
                    )
                    .border(
                        1.dp,
                        if (saveManager.timeAttackEnabled) AccentGold else BorderSubtle,
                        RoundedCornerShape(14.dp)
                    )
                    .clickable { onToggleTimeAttack() }
                    .padding(horizontal = 16.dp, vertical = 12.dp)
                    .testTag("time_attack_toggle")
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = null,
                            tint = if (saveManager.timeAttackEnabled) AccentGold else TextDim,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text(
                                text = if (isArabic) "⚡ وضع تحدي الوقت" else "⚡ Time Attack Mode",
                                color = if (saveManager.timeAttackEnabled) AccentGold else TextMain,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = if (isArabic) "ضاعف النقاط ونافس عالمياً" else "1.5x score bonus & global ranking",
                                color = TextDim,
                                fontSize = 11.sp
                            )
                        }
                    }
                    Switch(
                        checked = saveManager.timeAttackEnabled,
                        onCheckedChange = { onToggleTimeAttack() },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = AccentGold,
                            checkedTrackColor = BgSecondary
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Secondary Action Grid (Analytics, Leaderboard, Milestones, Manual)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MenuCard(
                    icon = Icons.Default.ShowChart,
                    title = if (isArabic) "مؤشر الذكاء" else "Analytics",
                    color = AccentCyan,
                    modifier = Modifier.weight(1f),
                    onClick = onOpenAnalytics
                )
                MenuCard(
                    icon = Icons.Default.EmojiEvents,
                    title = if (isArabic) "المتصدرين" else "Leaderboard",
                    color = AccentGold,
                    modifier = Modifier.weight(1f),
                    onClick = onOpenLeaderboard
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MenuCard(
                    icon = Icons.Default.Stars,
                    title = if (isArabic) "الإنجازات" else "Milestones",
                    color = AccentViolet,
                    modifier = Modifier.weight(1f),
                    onClick = onOpenAchievements
                )
                MenuCard(
                    icon = Icons.Default.MenuBook,
                    title = if (isArabic) "دليل التدريب" else "Manual",
                    color = AccentBlue,
                    modifier = Modifier.weight(1f),
                    onClick = onOpenManual
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Settings Button
            OutlinedButton(
                onClick = onOpenSettings,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .testTag("settings_button"),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TextDim),
                border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.horizontalGradient(listOf(BorderSubtle, BorderSubtle)))
            ) {
                Icon(Icons.Default.Settings, contentDescription = null, tint = TextDim, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isArabic) "إعدادات النظام" else "System Settings",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}

@Composable
private fun StatColumn(value: String, label: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = value, color = color, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        Text(text = label, color = TextDim, fontSize = 11.sp)
    }
}

@Composable
private fun MenuCard(
    icon: ImageVector,
    title: String,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(58.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(BgPanel)
            .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
            Text(
                text = title,
                color = TextMain,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1
            )
        }
    }
}
