package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Lock
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
import com.example.mindsphere.data.model.LevelDefinition
import com.example.mindsphere.data.model.PuzzlePlayState
import com.example.mindsphere.ui.theme.*

@Composable
fun HintsDialog(
    level: LevelDefinition,
    puzzleState: PuzzlePlayState,
    isArabic: Boolean,
    onUnlockNextHint: () -> Unit,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(1.dp, BorderGlow, RoundedCornerShape(20.dp))
                .padding(18.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Lightbulb, contentDescription = null, tint = AccentGold)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isArabic) "مصفوفة الإرشاد الذهني" else "Neural Guidance Matrix",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Tier 1
                HintTierCard(
                    tierNumber = 1,
                    title = if (isArabic) "المستوى 1: تلميح تمهيدي" else "Tier 1: Gentle Insight",
                    content = level.hints.tier1.get(isArabic),
                    isUnlocked = puzzleState.unlockedHints >= 1
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Tier 2
                HintTierCard(
                    tierNumber = 2,
                    title = if (isArabic) "المستوى 2: توجيه منطقي" else "Tier 2: Directional Logic",
                    content = level.hints.tier2.get(isArabic),
                    isUnlocked = puzzleState.unlockedHints >= 2
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Tier 3
                HintTierCard(
                    tierNumber = 3,
                    title = if (isArabic) "المستوى 3: خطوة الحل المباشرة" else "Tier 3: Core Solution Step",
                    content = level.hints.tier3.get(isArabic),
                    isUnlocked = puzzleState.unlockedHints >= 3
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Unlock Button
                if (puzzleState.unlockedHints < 3) {
                    Button(
                        onClick = onUnlockNextHint,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp)
                            .testTag("unlock_hint_button"),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentGold, contentColor = BgPrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text(
                            text = if (isArabic)
                                "فك التلميح التالي (${puzzleState.unlockedHints + 1}/3)"
                            else
                                "Decode Next Insight (${puzzleState.unlockedHints + 1}/3)",
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    Text(
                        text = if (isArabic) "تم فك جميع التلميحات المتاحة" else "All guidance tiers unlocked.",
                        color = TextDim,
                        fontSize = 12.sp,
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    )
                }
            }
        }
    }
}

@Composable
private fun HintTierCard(
    tierNumber: Int,
    title: String,
    content: String,
    isUnlocked: Boolean
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(if (isUnlocked) BgSecondary else BgPanel)
            .border(1.dp, if (isUnlocked) AccentGold.copy(alpha = 0.5f) else BorderSubtle, RoundedCornerShape(10.dp))
            .padding(12.dp)
    ) {
        if (!isUnlocked) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Lock, contentDescription = "Locked", tint = TextDim, modifier = Modifier.size(16.dp))
                Text(text = title, color = TextDim, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }
        } else {
            Column {
                Text(text = title, color = AccentGold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = content, color = TextMain, fontSize = 12.sp, lineHeight = 16.sp)
            }
        }
    }
}
