package com.example.mindsphere.ui.dialogs

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
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
import com.example.mindsphere.ui.theme.*

@Composable
fun ManualDialog(
    isArabic: Boolean,
    onDismiss: () -> Unit
) {
    val scrollState = rememberScrollState()

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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = if (isArabic) "دليل التدريب الذهني" else "Neural Manual",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextDim)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(scrollState),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ManualSection(
                        step = "1",
                        title = if (isArabic) "التحكم ثلاثي الأبعاد" else "3D Navigation",
                        desc = if (isArabic)
                            "المس واسحب على الشاشة في أي اتجاه لتدوير كاميرا الغرفة ثلاثية الأبعاد 360 درجة. قرّب بإصبعين للتكبير أو التصغير."
                        else
                            "Touch and drag across the screen to orbit the 3D chamber. Pinch with two fingers to zoom in or out on mechanisms."
                    )
                    ManualSection(
                        step = "2",
                        title = if (isArabic) "الآليات والألغاز" else "Puzzles & Mechanisms",
                        desc = if (isArabic)
                            "تحتوي كل غرفة مستقبلية على لوحة ومحطة تحكم تفاعلية. انقر على القطع ثلاثية الأبعاد أو استخدم الأزرار بالأسفل لتعديل الزوايا وتبديل العقد."
                        else
                            "Each futuristic chamber has an interactive puzzle console. Tap pieces directly or use the HUD console to manipulate them."
                    )
                    ManualSection(
                        step = "3",
                        title = if (isArabic) "المنطق الخالص" else "Pure Deterministic Logic",
                        desc = if (isArabic)
                            "كل لغز يعتمد 100% على المنطق الحسابي والرياضي والاستنتاج المكاني بدون تخمين عشوائي. راقب القواعد والأرقام والرموز ومسارات الضوء."
                        else
                            "Every puzzle is 100% deterministic and logically sound. Observe rules, examine numbers, symbols, and light beams."
                    )
                    ManualSection(
                        step = "4",
                        title = if (isArabic) "نظام التلميحات" else "Guidance System",
                        desc = if (isArabic)
                            "هل واجهت صعوبة؟ يمكنك استشارة نظام التلميحات الثلاثي في أي لحظة للحصول على توجيه بدون إنهاء محاولتك."
                        else
                            "Stuck? Consult the 3-tier neural guidance system anytime without ending your run."
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = onDismiss,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                        .testTag("acknowledge_manual_button"),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentCyan, contentColor = BgPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text(if (isArabic) "فهمت، جاهز" else "Acknowledge", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun ManualSection(step: String, title: String, desc: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(BgSecondary)
            .border(1.dp, BorderSubtle, RoundedCornerShape(12.dp))
            .padding(12.dp)
    ) {
        Column {
            Text(text = "$step. $title", color = AccentCyan, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = desc, color = TextMain, fontSize = 12.sp, lineHeight = 16.sp)
        }
    }
}
