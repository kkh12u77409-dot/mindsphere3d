package com.example.mindsphere.data.repository

import com.example.mindsphere.data.model.*

object LevelsRepository {
    val levels: List<LevelDefinition> = listOf(
        // ==================== ENVIRONMENT 1: THE NEON LABORATORY ====================
        LevelDefinition(
            id = 1,
            environment = EnvironmentTheme.NEON,
            type = PuzzleType.SEQUENCE,
            title = LocalizedString("Level 1: Calibration Pulse", "الغرفة 1: نبضة المعايرة"),
            objective = LocalizedString(
                "Determine the next frequency in the power grid sequence.",
                "حدد التردد التالي في متتالية شبكة الطاقة الكهرومغناطيسية."
            ),
            question = "2  ➔  4  ➔  8  ➔  16  ➔  ?",
            options = listOf("24", "32", "30", "64"),
            correctAnswer = "32",
            explanation = LocalizedString(
                "Each frequency doubles the previous value (2 × 2 = 4, 4 × 2 = 8, 8 × 2 = 16, 16 × 2 = 32).",
                "كل تردد يضاعف القيمة السابقة بالضرب في 2 (16 × 2 = 32)."
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("Observe the growth rate between each consecutive frequency number.", "لاحظ معدل الزيادة بين كل رقم تردد متتالي."),
                tier2 = LocalizedString("The system utilizes powers of two: each node multiplies by 2.", "النظام يعتمد قوى العدد اثنين: كل عقدة تُضرب في 2."),
                tier3 = LocalizedString("Multiply 16 by 2 to compute the harmonic calibration key: 32.", "اضرب 16 في 2 للحصول على مفتاح المعايرة التوافقي: 32.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 40)
        ),
        LevelDefinition(
            id = 2,
            environment = EnvironmentTheme.NEON,
            type = PuzzleType.ROTATION,
            title = LocalizedString("Level 2: Dual Ring Alignment", "الغرفة 2: محاذاة الحلقات المزدوجة"),
            objective = LocalizedString(
                "Rotate the outer and inner cyber rings to channel the laser beam north (0°).",
                "قم بتدوير الحلقتين الداخلية والخارجية لتوجيه شعاع الليزر نحو الشمال (0 درجة)."
            ),
            rings = listOf(
                RingDefinition("inner", 90f, 0f, LocalizedString("Inner Ring", "الحلقة الداخلية")),
                RingDefinition("outer", 180f, 0f, LocalizedString("Outer Ring", "الحلقة الخارجية"))
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("The laser beam must pass through both ring apertures simultaneously.", "يجب أن يعبر شعاع الليزر عبر فتحتي الحلقتين في نفس الوقت."),
                tier2 = LocalizedString("The target alignment marker points toward 0° (the top cyan emitter).", "مؤشر المحاذاة المطلوب يشير نحو الزاوية 0° (الباعث السماوي العلوي)."),
                tier3 = LocalizedString("Rotate Inner Ring to 0° and Outer Ring to 0° to channel the beam.", "أدر الحلقة الداخلية لتصل إلى 0° وأدر الحلقة الخارجية لتتطابق معها عند 0°.")
            ),
            starCriteria = StarCriteria(maxMoves = 5, maxTime = 45)
        ),
        LevelDefinition(
            id = 3,
            environment = EnvironmentTheme.NEON,
            type = PuzzleType.SWITCH_NETWORK,
            title = LocalizedString("Level 3: Logic Junction", "الغرفة 3: مفرق البوابات المنطقية"),
            objective = LocalizedString(
                "Ignite all 3 power nodes. Toggling a switch flips its state and adjacent nodes.",
                "أشعل جميع العقد الثلاث. تبديل أي مفتاح يغير حالته وحالة العقد المجاورة له."
            ),
            nodeCount = 3,
            initialNodes = listOf(true, false, false),
            targetNodes = listOf(true, true, true),
            adjacency = listOf(
                listOf(0, 1),
                listOf(0, 1, 2),
                listOf(1, 2)
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("Each node transmits energy to its immediate direct neighbors.", "كل عقدة تنقل الطاقة إلى جيرانها المباشرين."),
                tier2 = LocalizedString("Toggling the middle node affects the entire grid array.", "تبديل العقدة الوسطى يؤثر على المصفوفة بأكملها."),
                tier3 = LocalizedString("Tap Node 3, then Node 2 to illuminate all conduits.", "انقر العقدة الثالثة، ثم العقدة الثانية لإضاءة كل القنوات.")
            ),
            starCriteria = StarCriteria(maxMoves = 3, maxTime = 50)
        ),
        LevelDefinition(
            id = 4,
            environment = EnvironmentTheme.NEON,
            type = PuzzleType.PATTERN,
            title = LocalizedString("Level 4: Cyber Matrix", "الغرفة 4: مصفوفة الرموز السايبرانية"),
            objective = LocalizedString(
                "Identify the missing geometric node in the 2x2 logic matrix.",
                "حدد الشكل الهندسي المفقود في مصفوفة المنطق 2×2."
            ),
            gridDescription = "[ ● ]  ➔  [ ● ● ]\n[ ● ● ● ]  ➔  [ ? ]",
            options = listOf("● ●", "● ● ● ●", "▲ ▲", "■ ■"),
            correctAnswer = "● ● ● ●",
            hints = HintsDefinition(
                tier1 = LocalizedString("Count the number of active photon particles in each chamber cell.", "احسب عدد جسيمات الفوتون النشطة في كل خلية من المصفوفة."),
                tier2 = LocalizedString("The count increments by +1 in each progressive step.", "يزداد العدد بمقدار +1 في كل خطوة متتالية."),
                tier3 = LocalizedString("Select the option with 4 photon dots: ● ● ● ●.", "اختر الخيار الذي يحتوي على 4 نقاط فوتونية: ● ● ● ●.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 40)
        ),
        LevelDefinition(
            id = 5,
            environment = EnvironmentTheme.NEON,
            type = PuzzleType.LOGIC_DEDUCTION,
            title = LocalizedString("Level 5: Laboratory Core Overdrive", "الغرفة 5: شفرة النواة الفائقة"),
            objective = LocalizedString(
                "Deduce the 3-digit security code using the terminal sensor telemetry.",
                "استنتج الرمز الأمني الثلاثي باستخدام قراءات مستشعرات المحطة."
            ),
            clues = listOf(
                LocalizedString("Code consists of digits 1 to 5 with NO repeats.", "الرمز يتكون من أرقام من 1 إلى 5 بدون تكرار."),
                LocalizedString("The sum of all three digits is 9.", "مجموع الأرقام الثلاثة يساوي 9."),
                LocalizedString("First digit is strictly less than the second (D1 < D2).", "الرقم الأول أصغر تماماً من الرقم الثاني."),
                LocalizedString("Third digit is the largest: it is 5.", "الرقم الثالث هو الأكبر: وقيمته 5."),
                LocalizedString("First digit is an odd number.", "الرقم الأول عدد فردي.")
            ),
            options = listOf("1-3-5", "2-2-5", "1-4-4", "2-3-4"),
            correctAnswer = "1-3-5",
            hints = HintsDefinition(
                tier1 = LocalizedString("The last digit is fixed as 5. Therefore D1 + D2 must equal 4.", "الرقم الأخير محدد بـ 5، إذن مجموع الرقمين الأول والثاني يجب أن يساوي 4."),
                tier2 = LocalizedString("Since digits cannot repeat, 2-2 is invalid. D1 < D2 means D1 must be 1 and D2 must be 3.", "نظراً لعدم وجود تكرار، 2-2 غير مسموح. وبما أن D1 < D2، فالرقم الأول 1 والثاني 3."),
                tier3 = LocalizedString("The unique valid passkey is 1-3-5.", "رمز فك القفل الصحيح هو 1-3-5.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 50)
        ),

        // ==================== ENVIRONMENT 2: THE CRYSTAL TEMPLE ====================
        LevelDefinition(
            id = 6,
            environment = EnvironmentTheme.CRYSTAL,
            type = PuzzleType.SEQUENCE,
            title = LocalizedString("Level 6: Harmonic Frequencies", "الغرفة 6: الترددات البلورية التوافقية"),
            objective = LocalizedString(
                "Harmonize the crystal obelisk with the sacred Fibonacci sequence.",
                "اضبط اهتزاز المسلة البلورية وفق متتالية فيبوناتشي التوافقية."
            ),
            question = "3  ➔  5  ➔  8  ➔  13  ➔  21  ➔  ?",
            options = listOf("29", "31", "34", "36"),
            correctAnswer = "34",
            hints = HintsDefinition(
                tier1 = LocalizedString("Each frequency is the sum of the two preceding crystal vibrations.", "كل تردد بلوري هو مجموع الاهتزازين السابقين له مباشرة."),
                tier2 = LocalizedString("Calculate 13 + 21 to find the resonant harmonic.", "احسب ناتج جمع 13 + 21 لمعرفة التردد الرنيني."),
                tier3 = LocalizedString("13 + 21 = 34. Select 34 to resonate the obelisk.", "13 + 21 = 34. اختر 34 لإطلاق رنين المسلة.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 45)
        ),
        LevelDefinition(
            id = 7,
            environment = EnvironmentTheme.CRYSTAL,
            type = PuzzleType.ROTATION,
            title = LocalizedString("Level 7: Prismatic Tri-Ring", "الغرفة 7: حلقات المنشور البلوري الثلاثية"),
            objective = LocalizedString(
                "Align 3 concentric crystal rings to focus refracted white light onto the altar.",
                "حاذِ الحلقات البلورية الثلاث لتركيز الضوء المنكسر على المذبح المقدس."
            ),
            rings = listOf(
                RingDefinition("inner", 90f, 0f, LocalizedString("Inner Ring", "الحلقة الداخلية")),
                RingDefinition("mid", 180f, 0f, LocalizedString("Middle Ring", "الحلقة الوسطى")),
                RingDefinition("outer", 270f, 0f, LocalizedString("Outer Ring", "الحلقة الخارجية"))
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("All three light conduits must align at the 0° zenith point.", "يجب أن تلتقي مسارات الضوء الثلاثة عند نقطة السمت 0°."),
                tier2 = LocalizedString("Each ring rotates in 90° quantum increments.", "تدور كل حلقة بخطوات قدرها 90 درجة."),
                tier3 = LocalizedString("Rotate each ring until its notch reaches 0° at the top.", "قم بتدوير كل حلقة حتى يصبح مؤشرها في الأعلى تماماً عند 0°.")
            ),
            starCriteria = StarCriteria(maxMoves = 8, maxTime = 55)
        ),
        LevelDefinition(
            id = 8,
            environment = EnvironmentTheme.CRYSTAL,
            type = PuzzleType.SWITCH_NETWORK,
            title = LocalizedString("Level 8: Refraction Grid", "الغرفة 8: شبكة الانكسار الرباعية"),
            objective = LocalizedString(
                "Illuminate all 4 crystal focus points in the temple sanctuary.",
                "أضئ جميع نقاط التركيز البلورية الأربع في محراب المعبد."
            ),
            nodeCount = 4,
            initialNodes = listOf(false, true, false, false),
            targetNodes = listOf(true, true, true, true),
            adjacency = listOf(
                listOf(0, 1, 3),
                listOf(0, 1, 2),
                listOf(1, 2, 3),
                listOf(0, 2, 3)
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("Prisms refract energy across opposite diagonal corners.", "تقوم المنشورات بعكس وتوزيع الطاقة قطرياً عبر الزوايا."),
                tier2 = LocalizedString("Nodes 1 and 3 toggle symmetrical light paths.", "العقدتان 1 و 3 تبدلان مسارات ضوئية متناظرة."),
                tier3 = LocalizedString("Try activating Node 1, then Node 4.", "جرّب تفعيل العقدة 1 ثم العقدة 4 لإشعال الشبكة بالكامل.")
            ),
            starCriteria = StarCriteria(maxMoves = 4, maxTime = 60)
        ),
        LevelDefinition(
            id = 9,
            environment = EnvironmentTheme.CRYSTAL,
            type = PuzzleType.PATTERN,
            title = LocalizedString("Level 9: Sacred Rune Matrix", "الغرفة 9: مصفوفة الرونية المقدسة"),
            objective = LocalizedString(
                "Determine the missing rune in the 3x3 geometric crystal wall.",
                "حدد الرمز الروني المفقود في جدار المعبد البلوري 3×3."
            ),
            gridDescription = "Row 1: [ ▲ ]  [ ▲▲ ]  [ ▲▲▲ ]\nRow 2: [ ◆ ]  [ ◆◆ ]  [ ◆◆◆ ]\nRow 3: [ ⬡ ]  [ ⬡⬡ ]  [  ?  ]",
            options = listOf("⬡", "⬡⬡", "⬡⬡⬡", "▲▲▲"),
            correctAnswer = "⬡⬡⬡",
            hints = HintsDefinition(
                tier1 = LocalizedString("Compare row shapes: Row 1 is triangles, Row 2 is diamonds, Row 3 is hexagons.", "قارن أشكال الصفوف: الصف 1 مثلثات، الصف 2 معينات، الصف 3 سداسيات."),
                tier2 = LocalizedString("Each column increments the glyph count: 1, 2, then 3.", "كل عمود يزيد عدد الرموز: 1، ثم 2، ثم 3."),
                tier3 = LocalizedString("Row 3 column 3 requires three hexagons: ⬡⬡⬡.", "الصف الثالث العمود الثالث يحتاج إلى ثلاثة أشكال سداسية: ⬡⬡⬡.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 40)
        ),
        LevelDefinition(
            id = 10,
            environment = EnvironmentTheme.CRYSTAL,
            type = PuzzleType.LOGIC_DEDUCTION,
            title = LocalizedString("Level 10: Guardian's Riddle", "الغرفة 10: لغز حارس المعبد"),
            objective = LocalizedString(
                "Identify the guardian crystal element based on the temple inscriptions.",
                "حدد العنصر البلوري الحارس وفق نقوش جدران المعبد."
            ),
            clues = listOf(
                LocalizedString("Four sacred elements exist: Ruby (Fire), Sapphire (Water), Emerald (Earth), Topaz (Air).", "توجد أربعة عناصر: الياقوت (النار)، الزفير (الماء)، الزمرد (الأرض)، التوباز (الهواء)."),
                LocalizedString("The guardian is NOT placed in an unstable fiery state (Not Fire).", "الحارس لا ينتمي إلى عنصر النار المضطرب."),
                LocalizedString("The guardian's frequency is strictly higher than Emerald (Earth).", "تردد الحارس أعلى قطعاً من تردد الزمرد (الأرض)."),
                LocalizedString("The element that flows like eternal waves is the true guardian.", "العنصر الذي يتدفق كالأمواج الأبدية هو الحارس الحقيقي.")
            ),
            options = listOf("Ruby (Fire)", "Sapphire (Water)", "Emerald (Earth)", "Topaz (Air)"),
            correctAnswer = "Sapphire (Water)",
            hints = HintsDefinition(
                tier1 = LocalizedString("Rule out Ruby immediately based on the first exclusion clue.", "استبعد الياقوت فوراً بناءً على شرط الاستبعاد الأول."),
                tier2 = LocalizedString("Inspect the clue referencing waves and flowing water.", "تفحص الدليل الذي يتحدث عن التدفق كالأمواج والماء."),
                tier3 = LocalizedString("Sapphire (Water) satisfies all elemental constraints.", "الزفير الأزرق (الماء) يحقق جميع الشروط والقيود.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 45)
        ),

        // ==================== ENVIRONMENT 3: THE QUANTUM VAULT ====================
        LevelDefinition(
            id = 11,
            environment = EnvironmentTheme.QUANTUM,
            type = PuzzleType.SEQUENCE,
            title = LocalizedString("Level 11: Quantum Superposition", "الغرفة 11: التراكب الكمومي"),
            objective = LocalizedString(
                "Calculate the quantum spin eigenstate in this geometric power sequence.",
                "احسب الحالة الكمومية التالية في متتالية قوى الطاقة الهندسية."
            ),
            question = "1  ➔  3  ➔  9  ➔  27  ➔  ?",
            options = listOf("54", "81", "72", "99"),
            correctAnswer = "81",
            hints = HintsDefinition(
                tier1 = LocalizedString("Each quantum tier multiplies the preceding tier by 3 (Powers of 3).", "كل مستوى كمومي يضرب المستوى السابق في 3 (قوى العدد 3)."),
                tier2 = LocalizedString("Calculate 27 × 3 to find the stable harmonic state.", "احسب ناتج ضرب 27 × 3 للوصول إلى الحالة المستقرة."),
                tier3 = LocalizedString("27 × 3 = 81. Select 81 to collapse the superposition.", "27 × 3 = 81. اختر 81 لاستقرار الحالة الكمومية.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 40)
        ),
        LevelDefinition(
            id = 12,
            environment = EnvironmentTheme.QUANTUM,
            type = PuzzleType.ROTATION,
            title = LocalizedString("Level 12: Dimensional Gyroscope", "الغرفة 12: الجيروسكوب البُعدي"),
            objective = LocalizedString(
                "Synchronize all 3 quantum gyroscope gimbal rings into singularity alignment.",
                "زامن حلقات الجيروسكوب الكمومي الثلاث للوصول إلى محاذاة نقطة التفرد."
            ),
            rings = listOf(
                RingDefinition("alpha", 180f, 0f, LocalizedString("Alpha Gimbal", "حلقة ألفا")),
                RingDefinition("beta", 90f, 0f, LocalizedString("Beta Gimbal", "حلقة بيتا")),
                RingDefinition("gamma", 270f, 0f, LocalizedString("Gamma Gimbal", "حلقة جاما"))
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("Each gimbal ring controls an orthogonal dimensional plane.", "كل حلقة جيروسكوبية تتحكم في مستوى بعدي متعامد."),
                tier2 = LocalizedString("Turn each ring until its luminous quantum notch aligns with the top zenith (0°).", "أدر كل حلقة حتى يتطابق ثلمها الكمومي المضيء مع قمة السمت (0°)."),
                tier3 = LocalizedString("Rotate Alpha twice, Beta 3 times, Gamma once to complete singularity.", "أدر ألفا مرتين، وبيتا 3 مرات، وجاما مرة واحدة لتكتمل المحاذاة.")
            ),
            starCriteria = StarCriteria(maxMoves = 8, maxTime = 60)
        ),
        LevelDefinition(
            id = 13,
            environment = EnvironmentTheme.QUANTUM,
            type = PuzzleType.SWITCH_NETWORK,
            title = LocalizedString("Level 13: Entangled Node Array", "الغرفة 13: مصفوفة التشابك الكمومي"),
            objective = LocalizedString(
                "Entangle and activate all 5 quantum nodes simultaneously.",
                "شابك وفعّل جميع العقد الكمومية الخمس في نفس اللحظة."
            ),
            nodeCount = 5,
            initialNodes = listOf(true, false, false, false, true),
            targetNodes = listOf(true, true, true, true, true),
            adjacency = listOf(
                listOf(0, 1, 4),
                listOf(0, 1, 2),
                listOf(1, 2, 3),
                listOf(2, 3, 4),
                listOf(3, 4, 0)
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("In a circular array of 5 nodes, toggling one affects its two direct neighbors.", "في حلقة من 5 عقد، يؤثر تبديل كل عقدة على جارتيها المباشرتين."),
                tier2 = LocalizedString("Focus on the unlit nodes in the center (Nodes 2, 3, 4).", "ركز على العقد غير المضاءة في المنتصف (العقد 2 و 3 و 4)."),
                tier3 = LocalizedString("Toggling Node 2 and then Node 3 achieves complete entanglement.", "تبديل العقدة 2 ثم العقدة 3 يحقق التشابك التام.")
            ),
            starCriteria = StarCriteria(maxMoves = 4, maxTime = 65)
        ),
        LevelDefinition(
            id = 14,
            environment = EnvironmentTheme.QUANTUM,
            type = PuzzleType.PATTERN,
            title = LocalizedString("Level 14: Multiverse Warp Matrix", "الغرفة 14: مصفوفة الاعوجاج الكوني"),
            objective = LocalizedString(
                "Decode the multi-dimensional rotation and color pattern of the warp core.",
                "فك شفرة الدوران اللوني متعدد الأبعاد لنواة الاعوجاج."
            ),
            gridDescription = "Row 1: [ ◓ Cyan ]  ➔  [ ◑ Violet ]  ➔  [ ◒ Gold ]\nRow 2: [ ◐ Cyan ]  ➔  [ ◓ Violet ]  ➔  [ ◑ Gold ]\nRow 3: [ ◒ Cyan ]  ➔  [ ◐ Violet ]  ➔  [    ?    ]",
            options = listOf("◓ Gold", "◒ Violet", "◑ Gold", "◐ Cyan"),
            correctAnswer = "◓ Gold",
            hints = HintsDefinition(
                tier1 = LocalizedString("Look at the column colors: Column 3 is always Gold.", "انظر إلى ألوان الأعمدة: العمود الثالث دائماً باللون الذهبي (Gold)."),
                tier2 = LocalizedString("Track rotation of the circle shader: it rotates 90° clockwise in each step.", "تتبع دوران تظليل الدائرة: يدور 90 درجة باتجاه عقارب الساعة في كل خطوة."),
                tier3 = LocalizedString("The missing glyph is ◓ in Gold: select '◓ Gold'.", "الرمز المفقود هو ◓ باللون الذهبي: اختر '◓ Gold'.")
            ),
            starCriteria = StarCriteria(maxMoves = 2, maxTime = 45)
        ),
        LevelDefinition(
            id = 15,
            environment = EnvironmentTheme.QUANTUM,
            type = PuzzleType.GRAND_PUZZLE,
            title = LocalizedString("Level 15: The MindSphere Paradox", "الغرفة 15: مفارقة كرة العقل الكبرى"),
            objective = LocalizedString(
                "Solve the master chamber: align the 3D quantum core and decipher the universal constant.",
                "حل الغرفة الكبرى: حاذِ النواة ثلاثية الأبعاد وفك شفرة الثابت الكوني النهائي."
            ),
            question = "Quantum Equation: (2³ × 3) + 7 = ?",
            options = listOf("29", "31", "33", "35"),
            correctAnswer = "31",
            rings = listOf(
                RingDefinition("coreRing", 180f, 0f, LocalizedString("Core Ring", "حلقة النواة"))
            ),
            hints = HintsDefinition(
                tier1 = LocalizedString("Solve the arithmetic order of operations: first powers (2³), then multiplication, then addition.", "ابدأ بالأولويات الحسابية: أولاً الأسس (2³)، ثم الضرب، ثم الجمع."),
                tier2 = LocalizedString("2³ = 8. Then 8 × 3 = 24. Now add 7.", "2³ = 8، ثم 8 × 3 = 24، وأخيراً أضف 7."),
                tier3 = LocalizedString("24 + 7 = 31. Rotate the core ring and select 31 to conquer MindSphere 3D!", "24 + 7 = 31. أدر حلقة النواة واختر 31 لتحقيق النصر النهائي!")
            ),
            starCriteria = StarCriteria(maxMoves = 3, maxTime = 60)
        )
    )

    fun getLevelById(id: Int): LevelDefinition =
        levels.find { it.id == id } ?: levels.first()
}
