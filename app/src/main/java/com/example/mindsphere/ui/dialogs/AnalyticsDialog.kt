package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ShowChart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.mindsphere.data.repository.SaveManager
import com.example.mindsphere.ui.theme.*

@Composable
fun AnalyticsDialog(
    saveManager: SaveManager,
    isArabic: Boolean,
    onDismiss: () -> Unit
) {
    val history = saveManager.history
    val peakScore = if (history.isNotEmpty()) history.maxOf { it.score } else 0
    val avgScore = if (history.isNotEmpty()) (history.map { it.score }.average()).toInt() else 0

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
                        Icon(Icons.Default.ShowChart, contentDescription = null, tint = AccentCyan)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isArabic) "مؤشر تطور الذكاء" else "Intelligence Analytics",
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
                        "الرسم البياني لتطور أداء ونقاط الرنين الذهني عبر آخر الغرف المكتملة."
                    else
                        "Real-time cognition and points performance curve over your played chambers.",
                    color = TextDim,
                    fontSize = 11.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Stats row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgSecondary)
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "$peakScore", color = AccentCyan, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(text = if (isArabic) "أعلى نقاط" else "Peak Score", color = TextDim, fontSize = 10.sp)
                    }
                    Divider(modifier = Modifier.height(28.dp).width(1.dp), color = BorderSubtle)
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "$avgScore", color = AccentViolet, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(text = if (isArabic) "متوسط النقاط" else "Avg Score", color = TextDim, fontSize = 10.sp)
                    }
                    Divider(modifier = Modifier.height(28.dp).width(1.dp), color = BorderSubtle)
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "${history.size}", color = AccentGold, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(text = if (isArabic) "الغرف المسجلة" else "Chambers", color = TextDim, fontSize = 10.sp)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Curve Chart Canvas
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(160.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgSecondary)
                        .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        if (history.isEmpty()) return@Canvas

                        val maxVal = (peakScore.coerceAtLeast(1000) * 1.15f)
                        val w = size.width
                        val h = size.height

                        // Grid lines
                        for (i in 1..3) {
                            val y = h * (i / 4f)
                            drawLine(
                                color = BorderSubtle,
                                start = Offset(0f, y),
                                end = Offset(w, y),
                                strokeWidth = 1f
                            )
                        }

                        val points = history.mapIndexed { idx, record ->
                            val x = if (history.size > 1) (idx.toFloat() / (history.size - 1)) * w else w / 2f
                            val y = h - ((record.score.toFloat() / maxVal) * h).coerceIn(10f, h - 10f)
                            Offset(x, y)
                        }

                        // Path & Gradient Fill
                        val path = Path().apply {
                            if (points.isNotEmpty()) {
                                moveTo(points[0].x, points[0].y)
                                for (i in 1 until points.size) {
                                    val prev = points[i - 1]
                                    val curr = points[i]
                                    val c1 = Offset((prev.x + curr.x) / 2f, prev.y)
                                    val c2 = Offset((prev.x + curr.x) / 2f, curr.y)
                                    cubicTo(c1.x, c1.y, c2.x, c2.y, curr.x, curr.y)
                                }
                            }
                        }

                        val fillPath = Path().apply {
                            addPath(path)
                            if (points.isNotEmpty()) {
                                lineTo(points.last().x, h)
                                lineTo(points.first().x, h)
                                close()
                            }
                        }

                        drawPath(
                            path = fillPath,
                            brush = Brush.verticalGradient(
                                colors = listOf(AccentCyan.copy(alpha = 0.35f), Color.Transparent)
                            )
                        )

                        drawPath(
                            path = path,
                            color = AccentCyan,
                            style = Stroke(width = 3f)
                        )

                        // Data points
                        points.forEach { pt ->
                            drawCircle(color = AccentCyan, radius = 5f, center = pt)
                            drawCircle(color = Color.White, radius = 2.5f, center = pt)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .testTag("close_analytics_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = BgPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(if (isArabic) "إغلاق" else "Close", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
