package com.example.mindsphere.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlin.math.sin

class SoundEngine(private val context: Context?) {
    var sfxEnabled: Boolean = true
    var musicEnabled: Boolean = true
    var vibrationEnabled: Boolean = true

    private val sampleRate = 22050
    private val scope = CoroutineScope(Dispatchers.Default)
    private val vibrator: Vibrator? = context?.let {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vm = it.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vm?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            it.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }

    private fun triggerHaptic(durationMs: Long) {
        if (!vibrationEnabled) return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator?.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(durationMs)
            }
        } catch (_: Exception) {}
    }

    private fun playToneSequence(tones: List<Pair<Float, Float>>, waveform: String = "sine") {
        if (!sfxEnabled) return
        scope.launch {
            try {
                var totalDuration = 0f
                tones.forEach { totalDuration += it.second }
                val totalSamples = (sampleRate * totalDuration).toInt()
                val buffer = ShortArray(totalSamples)

                var sampleOffset = 0
                for ((freq, dur) in tones) {
                    val count = (sampleRate * dur).toInt()
                    for (i in 0 until count) {
                        val t = i.toFloat() / sampleRate
                        val envelope = (1f - (i.toFloat() / count)).coerceIn(0f, 1f)
                        val sampleVal = when (waveform) {
                            "square" -> if (sin(2.0 * Math.PI * freq * t) >= 0) 1.0 else -1.0
                            "triangle" -> {
                                val period = 1f / freq
                                val phase = (t % period) / period
                                if (phase < 0.5f) 4f * phase - 1f else 3f - 4f * phase
                            }
                            else -> sin(2.0 * Math.PI * freq * t)
                        }
                        val sampleShort = (sampleVal * 16000 * envelope).toInt().toShort()
                        if (sampleOffset + i < totalSamples) {
                            buffer[sampleOffset + i] = sampleShort
                        }
                    }
                    sampleOffset += count
                }

                val audioTrack = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(buffer.size * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                audioTrack.write(buffer, 0, buffer.size)
                audioTrack.play()
                Thread.sleep((totalDuration * 1000).toLong() + 50)
                audioTrack.release()
            } catch (_: Exception) {}
        }
    }

    fun playClick() {
        triggerHaptic(15)
        playToneSequence(listOf(Pair(600f, 0.05f)), "sine")
    }

    fun playRotate() {
        triggerHaptic(25)
        playToneSequence(listOf(Pair(220f, 0.04f), Pair(440f, 0.05f)), "triangle")
    }

    fun playSelect() {
        triggerHaptic(20)
        playToneSequence(listOf(Pair(523.25f, 0.06f), Pair(659.25f, 0.08f)), "sine")
    }

    fun playToggle() {
        triggerHaptic(30)
        playToneSequence(listOf(Pair(320f, 0.05f), Pair(160f, 0.04f)), "square")
    }

    fun playCorrect() {
        triggerHaptic(40)
        playToneSequence(
            listOf(
                Pair(440f, 0.06f),
                Pair(554.37f, 0.06f),
                Pair(659.25f, 0.08f),
                Pair(880f, 0.14f)
            ),
            "sine"
        )
    }

    fun playWrong() {
        triggerHaptic(70)
        playToneSequence(listOf(Pair(130f, 0.1f), Pair(95f, 0.12f)), "square")
    }

    fun playDoorOpen() {
        triggerHaptic(100)
        playToneSequence(
            listOf(
                Pair(80f, 0.2f),
                Pair(120f, 0.25f),
                Pair(200f, 0.2f),
                Pair(400f, 0.25f)
            ),
            "triangle"
        )
    }

    fun playVictory() {
        triggerHaptic(150)
        playToneSequence(
            listOf(
                Pair(523.25f, 0.08f),
                Pair(659.25f, 0.08f),
                Pair(783.99f, 0.08f),
                Pair(1046.50f, 0.15f),
                Pair(1318.51f, 0.3f)
            ),
            "sine"
        )
    }

    fun playAchievement() {
        triggerHaptic(120)
        playToneSequence(
            listOf(
                Pair(659.25f, 0.07f),
                Pair(830.61f, 0.07f),
                Pair(987.77f, 0.09f),
                Pair(1318.51f, 0.18f)
            ),
            "triangle"
        )
    }

    fun playTick() {
        triggerHaptic(10)
        playToneSequence(listOf(Pair(880f, 0.03f)), "sine")
    }

    fun playTimeout() {
        triggerHaptic(80)
        playToneSequence(listOf(Pair(220f, 0.15f), Pair(110f, 0.2f), Pair(55f, 0.25f)), "square")
    }
}
