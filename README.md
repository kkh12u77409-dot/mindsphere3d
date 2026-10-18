# MindSphere 3D — كرة العقل (Android)

A futuristic 3D puzzle and spatial cognition training Android game built with Kotlin and Jetpack Compose.

## Features

- **3D Chambers & Puzzles**: 15 playable chambers across 3 themed futuristic environments (The Neon Laboratory, The Crystal Temple, and The Quantum Vault).
- **Diverse Logic Mechanics**: Concentric ring rotations, interconnected switch logic networks, numeric and geometric sequences, pattern matrices, terminal deduction puzzles, and the grand 3D gyroscope core paradox.
- **Custom Jetpack Compose 3D Projection Canvas**: 3D chamber environment with hydraulic blast doors, glowing particle field, dynamic pedestal lighting, and orbital camera controls (drag to orbit, pinch to zoom, and touch interactions).
- **Intelligence Analytics**: Interactive Canvas curve visualization tracking cognitive performance and Intelligence Points over the player's last 10 chambers, featuring peak, average, and completion KPI metrics.
- **Time Attack & Global Leaderboard**: High-stakes countdown mode with time bonus multipliers and simulated global competitive rankings.
- **3-Tier Neural Guidance System**: Tiered clues (Gentle Insight ➔ Directional Logic ➔ Core Solution Step) for each chamber.
- **Bilingual Support**: Full Arabic and English localization with native RTL / LTR layout switching.
- **Procedural Audio Synthesizer**: Android `AudioTrack` PCM tone synthesis with haptic feedback (`Vibrator`), custom sfx, and ambient soundscapes.
- **Adaptive Launcher Icon**: Custom Material You adaptive launcher icon featuring the holographic MindSphere core.

## Tech Stack

- **Platform**: Android (minSdk 26, targetSdk 35, compileSdk 35)
- **Language**: Kotlin 2.1.0
- **UI Framework**: Jetpack Compose & Material Design 3 (M3)
- **Architecture**: MVVM / Clean Architecture with StateFlow & Coroutines
- **Build System**: Gradle (Kotlin DSL - `.gradle.kts`) with Version Catalog (`libs.versions.toml`)

## Building and Running

To compile and build the Android APK:
```bash
./gradlew assembleDebug
```
The debug APK is generated at `app/build/outputs/apk/debug/app-debug.apk`.
