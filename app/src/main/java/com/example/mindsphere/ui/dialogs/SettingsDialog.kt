package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DeleteForever
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
import com.example.mindsphere.audio.SoundEngine
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun SettingsDialog(
    soundEngine: SoundEngine,
    saveManager: SaveManager,
    isArabic: Boolean,
    onLanguageChange: (Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    var sfxState by remember { mutableStateOf(soundEngine.sfxEnabled) }
    var musicState by remember { mutableStateOf(soundEngine.musicEnabled) }
    var vibrationState by remember { mutableStateOf(soundEngine.vibrationEnabled) }
    var showResetConfirm by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(BgPanelSolid)
                .border(1.dp, BorderGlow, RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isArabic) "معايرة النظام" else "System Settings",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Sound FX
                SettingToggleRow(
                    label = if (isArabic) "المؤثرات الصوتية" else "Acoustic Effects",
                    checked = sfxState,
                    onCheckedChange = {
                        sfxState = it
                        soundEngine.sfxEnabled = it
                        if (it) soundEngine.playClick()
                    }
                )

                // Ambient Resonance
                SettingToggleRow(
                    label = if (isArabic) "الرنين المحيطي" else "Ambient Resonance",
                    checked = musicState,
                    onCheckedChange = {
                        musicState = it
                        soundEngine.musicEnabled = it
                    }
                )

                // Haptic Feedback
                SettingToggleRow(
                    label = if (isArabic) "الاهتزاز الحركي" else "Haptic Feedback",
                    checked = vibrationState,
                    onCheckedChange = {
                        vibrationState = it
                        soundEngine.vibrationEnabled = it
                    }
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Language Selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isArabic) "اللغة (Language)" else "Language (اللغة)",
                        color = TextMain,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        FilterChip(
                            selected = !isArabic,
                            onClick = { onLanguageChange(false) },
                            label = { Text("English", fontSize = 11.sp) }
                        )
                        FilterChip(
                            selected = isArabic,
                            onClick = { onLanguageChange(true) },
                            label = { Text("العربية", fontSize = 11.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Reset Progress
                if (!showResetConfirm) {
                    OutlinedButton(
                        onClick = { showResetConfirm = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                            .testTag("reset_progress_button"),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentRed),
                        border = ButtonDefaults.outlinedButtonBorder.copy(
                            brush = androidx.compose.ui.graphics.SolidColor(AccentRed.copy(alpha = 0.5f))
                        )
                    ) {
                        Icon(Icons.Default.DeleteForever, contentDescription = null, tint = AccentRed, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(if (isArabic) "إعادة تعيين الذاكرة" else "Reset Neural Memory", fontSize = 12.sp)
                    }
                } else {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(BgSecondary)
                            .border(1.dp, AccentRed.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                            .padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = if (isArabic) "تأكيد مسح كافة بيانات الغرف والنجوم؟" else "Confirm wiping all chamber data & stars?",
                            color = AccentRed,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedButton(
                                onClick = { showResetConfirm = false },
                                modifier = Modifier.weight(1f).height(36.dp)
                            ) {
                                Text(if (isArabic) "إلغاء" else "Cancel", fontSize = 11.sp)
                            }
                            Button(
                                onClick = {
                                    saveManager.resetProgress()
                                    showResetConfirm = false
                                },
                                modifier = Modifier.weight(1f).height(36.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = AccentRed)
                            ) {
                                Text(if (isArabic) "تأكيد المسح" else "Wipe", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SettingToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = TextMain, fontSize = 13.sp)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = AccentCyan,
                checkedTrackColor = BgSecondary
            )
        )
    }
}
