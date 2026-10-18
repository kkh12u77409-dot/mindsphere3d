package com.example.mindsphere.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = AccentCyan,
    onPrimary = BgPrimary,
    primaryContainer = BgSecondary,
    onPrimaryContainer = AccentCyan,
    secondary = AccentViolet,
    onSecondary = BgPrimary,
    secondaryContainer = BgPanelSolid,
    onSecondaryContainer = AccentViolet,
    tertiary = AccentGold,
    background = BgPrimary,
    onBackground = TextMain,
    surface = BgSecondary,
    onSurface = TextMain,
    surfaceVariant = BgPanelSolid,
    onSurfaceVariant = TextDim,
    error = AccentRed,
    onError = TextMain
)

@Composable
fun MindSphereTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
