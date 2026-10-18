package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme =
  darkColorScheme(
    primary = CyberCyan,
    secondary = CyberViolet,
    tertiary = CyberGold,
    background = DarkNavyBg,
    surface = DarkPanelSurface,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = TextLight,
    onSurface = TextLight
  )

@Composable
fun MindSphereTheme(
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = DarkColorScheme,
    typography = Typography,
    content = content
  )
}
