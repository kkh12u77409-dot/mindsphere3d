package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mindsphere.data.model.VictoryStats
import com.example.mindsphere.ui.theme.*

@Composable
fun VictoryDialog(
    stats: VictoryStats,
    isArabic: Boolean,
    hasNextLevel: Boolean,
    onNextLevel: () -> Unit,
    onReplay: () -> Unit
) {
    Dialog(onDismissRequest = {}) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(1.5.dp, BorderGlow, RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = if (isArabic) "تم فتح الغرفة بنجاح!" else "Chamber Conquered!",
                    color = AccentCyan,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = if (isArabic) "تم فك قفل البوابة الهيدروليكية" else "Hydraulic Blast Door Unlocked",
                    color = TextDim,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Stars display
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    for (i in 1..3) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = if (i <= stats.stars) AccentGold else TextDim.copy(alpha = 0.3f),
                            modifier = Modifier.size(34.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Score Card Breakdown
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgSecondary)
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatRow(
                        label = if (isArabic) "زمن الإنجاز:" else "Completion Time:",
                        value = "${stats.timeSeconds}s"
                    )
                    StatRow(
                        label = if (isArabic) "مجموع الحركات:" else "Total Actions:",
                        value = "${stats.moves}"
                    )
                    StatRow(
                        label = if (isArabic) "نقاط الذكاء:" else "Resonance Score:",
                        value = "+${stats.score}",
                        valueColor = AccentCyan
                    )
                    if (stats.bonus > 0) {
                        StatRow(
                            label = if (isArabic) "مكافأة السرعة:" else "Time Attack Bonus:",
                            value = "+${stats.bonus}",
                            valueColor = AccentGold
                        )
                    }
                    if (stats.rank != null) {
                        StatRow(
                            label = if (isArabic) "الترتيب العالمي:" else "Global Rank:",
                            value = "#${stats.rank}",
                            valueColor = AccentGreen
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onReplay,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .testTag("replay_button"),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TextMain)
                    ) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isArabic) "إعادة" else "Replay")
                    }

                    if (hasNextLevel) {
                        Button(
                            onClick = onNextLevel,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp)
                                .testTag("next_chamber_button"),
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = BgPrimary)
                        ) {
                            Text(if (isArabic) "الغرفة التالية" else "Next Chamber", fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(6.dp))
                            Icon(Icons.Default.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun FinalVictoryDialog(
    totalScore: Int,
    isArabic: Boolean,
    onFinish: () -> Unit
) {
    Dialog(onDismissRequest = onFinish) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(2.dp, AccentGold, RoundedCornerShape(20.dp))
                .padding(24.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "🏆",
                    fontSize = 48.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = if (isArabic) "تم تتويج عبقري كرة العقل!" else "MindSphere Ascended!",
                    color = AccentGold,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Black
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = if (isArabic)
                        "أكملت بنجاح جميع الغرف الـ15. تم استقرار النواة الكمومية بالكامل."
                    else
                        "All 15 Futuristic Chambers Solved. The Quantum Core is Stabilized.",
                    color = TextMain,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(18.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgSecondary)
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = if (isArabic) "مجموع نقاط الذكاء النهائي" else "Total Neural Score",
                            color = TextDim,
                            fontSize = 12.sp
                        )
                        Text(
                            text = "$totalScore",
                            color = AccentCyan,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = onFinish,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("ascend_finish_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGold, contentColor = BgPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(
                        text = if (isArabic) "العودة للرئيسية" else "Return to Nexus",
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun StatRow(label: String, value: String, valueColor: Color = TextMain) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = TextDim, fontSize = 12.sp)
        Text(text = value, color = valueColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}
