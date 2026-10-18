package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EmojiEvents
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
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun LeaderboardDialog(
    saveManager: SaveManager,
    isArabic: Boolean,
    onDismiss: () -> Unit
) {
    val entries = saveManager.leaderboard

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.82f)
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
                        Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = AccentGold)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isArabic) "لوحة المتصدرين العالمية" else "Global Leaderboard",
                            color = Color.White,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                Text(
                    text = if (isArabic)
                        "أسرع وأذكى المحللين مصنفين حسب السرعة والدقة ونقاط الذكاء."
                    else
                        "Top solvers ranked by Speed, Accuracy, and Intelligence Points.",
                    color = TextDim,
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // List
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(entries) { entry ->
                        val isUser = entry.isPlayer
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isUser) AccentGold.copy(alpha = 0.15f) else BgSecondary)
                                .border(
                                    1.dp,
                                    if (isUser) AccentGold else BorderSubtle,
                                    RoundedCornerShape(10.dp)
                                )
                                .padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = when (entry.rank) {
                                        1 -> "🥇"
                                        2 -> "🥈"
                                        3 -> "🥉"
                                        else -> "#${entry.rank}"
                                    },
                                    color = if (entry.rank <= 3) AccentGold else TextDim,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.width(32.dp)
                                )
                                Text(text = entry.flag, fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = entry.name,
                                    color = if (isUser) AccentGold else TextMain,
                                    fontSize = 13.sp,
                                    fontWeight = if (isUser) FontWeight.Bold else FontWeight.Medium
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = entry.time,
                                    color = TextDim,
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = "${entry.score} pts",
                                    color = AccentCyan,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .testTag("close_leaderboard_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGold, contentColor = BgPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(if (isArabic) "إغلاق" else "Close", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
