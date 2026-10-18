package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mindsphere.data.model.EnvironmentTheme
import com.example.mindsphere.data.model.LevelDefinition
import com.example.mindsphere.data.repository.LevelsRepository
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun LevelSelectDialog(
    saveManager: SaveManager,
    isArabic: Boolean,
    onDismiss: () -> Unit,
    onSelectLevel: (Int) -> Unit
) {
    var selectedEnv by remember { mutableStateOf<EnvironmentTheme?>(null) }

    val filteredLevels = remember(selectedEnv) {
        if (selectedEnv == null) LevelsRepository.levels
        else LevelsRepository.levels.filter { it.environment == selectedEnv }
    }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(1.dp, BorderGlow, RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isArabic) "مصفوفة الغرف" else "Chamber Matrix",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(
                        onClick = onDismiss,
                        modifier = Modifier.testTag("close_level_select")
                    ) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                // Filter Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    FilterChip(
                        selected = selectedEnv == null,
                        onClick = { selectedEnv = null },
                        label = { Text(if (isArabic) "الكل" else "All", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedEnv == EnvironmentTheme.NEON,
                        onClick = { selectedEnv = EnvironmentTheme.NEON },
                        label = { Text(if (isArabic) "نيون" else "Neon", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedEnv == EnvironmentTheme.CRYSTAL,
                        onClick = { selectedEnv = EnvironmentTheme.CRYSTAL },
                        label = { Text(if (isArabic) "بلوري" else "Crystal", fontSize = 11.sp) }
                    )
                    FilterChip(
                        selected = selectedEnv == EnvironmentTheme.QUANTUM,
                        onClick = { selectedEnv = EnvironmentTheme.QUANTUM },
                        label = { Text(if (isArabic) "كمومي" else "Quantum", fontSize = 11.sp) }
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Grid of 15 Chambers
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredLevels) { lvl ->
                        val isUnlocked = saveManager.isLevelUnlocked(lvl.id)
                        val stats = saveManager.completedLevels[lvl.id]
                        val stars = stats?.stars ?: 0

                        val envColor = when (lvl.environment) {
                            EnvironmentTheme.NEON -> AccentCyan
                            EnvironmentTheme.CRYSTAL -> AccentViolet
                            EnvironmentTheme.QUANTUM -> AccentGold
                        }

                        Box(
                            modifier = Modifier
                                .aspectRatio(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isUnlocked) BgPanel else BgSecondary)
                                .border(
                                    1.dp,
                                    if (isUnlocked) envColor.copy(alpha = 0.5f) else BorderSubtle,
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable(enabled = isUnlocked) { onSelectLevel(lvl.id) }
                                .padding(8.dp)
                                .testTag("level_card_${lvl.id}"),
                            contentAlignment = Alignment.Center
                        ) {
                            if (!isUnlocked) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = "Locked",
                                    tint = TextDim.copy(alpha = 0.4f),
                                    modifier = Modifier.size(24.dp)
                                )
                            } else {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxSize()
                                ) {
                                    Text(
                                        text = "${lvl.id}",
                                        color = envColor,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Black
                                    )
                                    Text(
                                        text = lvl.title.get(isArabic).split(":").lastOrNull()?.trim() ?: "",
                                        color = TextMain,
                                        fontSize = 9.sp,
                                        textAlign = TextAlign.Center,
                                        maxLines = 1
                                    )
                                    // Stars
                                    Row(horizontalArrangement = Arrangement.Center) {
                                        for (s in 1..3) {
                                            Icon(
                                                imageVector = Icons.Default.Star,
                                                contentDescription = null,
                                                tint = if (s <= stars) AccentGold else TextDim.copy(alpha = 0.3f),
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
