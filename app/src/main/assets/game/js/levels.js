// 15 Playable Levels across 3 Themed Environments for MindSphere 3D
const LEVELS = [
  // ==================== ENVIRONMENT 1: THE NEON LABORATORY ====================
  {
    id: 1,
    environment: "neon",
    type: "sequence",
    title: { en: "Level 1: Calibration Pulse", ar: "الغرفة 1: نبضة المعايرة" },
    objective: { 
      en: "Determine the next frequency in the power grid sequence.", 
      ar: "حدد التردد التالي في متتالية شبكة الطاقة الكهرومغناطيسية." 
    },
    question: "2  ➔  4  ➔  8  ➔  16  ➔  ?",
    options: ["24", "32", "30", "64"],
    correctAnswer: "32",
    explanation: {
      en: "Each frequency doubles the previous value (2 × 2 = 4, 4 × 2 = 8, 8 × 2 = 16, 16 × 2 = 32).",
      ar: "كل تردد يضاعف القيمة السابقة بالضرب في 2 (16 × 2 = 32)."
    },
    hints: {
      tier1: {
        en: "Observe the growth rate between each consecutive frequency number.",
        ar: "لاحظ معدل الزيادة بين كل رقم تردد متتالي."
      },
      tier2: {
        en: "The system utilizes powers of two: each node multiplies by 2.",
        ar: "النظام يعتمد قوى العدد اثنين: كل عقدة تُضرب في 2."
      },
      tier3: {
        en: "Multiply 16 by 2 to compute the harmonic calibration key: 32.",
        ar: "اضرب 16 في 2 للحصول على مفتاح المعايرة التوافقي: 32."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 40 }
  },
  {
    id: 2,
    environment: "neon",
    type: "rotation",
    title: { en: "Level 2: Dual Ring Alignment", ar: "الغرفة 2: محاذاة الحلقات المزدوجة" },
    objective: { 
      en: "Rotate the outer and inner cyber rings to channel the laser beam north (0°).", 
      ar: "قم بتدوير الحلقتين الداخلية والخارجية لتوجيه شعاع الليزر نحو الشمال (0 درجة)." 
    },
    rings: [
      { id: "inner", initialAngle: 90, targetAngle: 0, label: { en: "Inner Ring", ar: "الحلقة الداخلية" } },
      { id: "outer", initialAngle: 180, targetAngle: 0, label: { en: "Outer Ring", ar: "الحلقة الخارجية" } }
    ],
    hints: {
      tier1: {
        en: "The laser beam must pass through both ring apertures simultaneously.",
        ar: "يجب أن يعبر شعاع الليزر عبر فتحتي الحلقتين في نفس الوقت."
      },
      tier2: {
        en: "The target alignment marker points toward 0° (the top cyan emitter).",
        ar: "مؤشر المحاذاة المطلوب يشير نحو الزاوية 0° (الباعث السماوي العلوي)."
      },
      tier3: {
        en: "Rotate Inner Ring 3 times (or -90°) and Outer Ring 2 times (180°) to reach 0°.",
        ar: "أدر الحلقة الداخلية لتصل إلى 0° وأدر الحلقة الخارجية لتتطابق معها عند 0°."
      }
    },
    starCriteria: { maxMoves: 5, maxTime: 45 }
  },
  {
    id: 3,
    environment: "neon",
    type: "switch_network",
    title: { en: "Level 3: Logic Junction", ar: "الغرفة 3: مفرق البوابات المنطقية" },
    objective: { 
      en: "Ignite all 3 power nodes. Toggling a switch flips its state and adjacent nodes.", 
      ar: "أشعل جميع العقد الثلاث. تبديل أي مفتاح يغير حالته وحالة العقد المجاورة له." 
    },
    nodeCount: 3,
    initialNodes: [true, false, false], // [Node A, Node B, Node C]
    targetNodes: [true, true, true],
    adjacency: [
      [0, 1],       // Toggling 0 flips 0, 1
      [0, 1, 2],    // Toggling 1 flips 0, 1, 2
      [1, 2]        // Toggling 2 flips 1, 2
    ],
    hints: {
      tier1: {
        en: "Each node transmits energy to its immediate direct neighbors.",
        ar: "كل عقدة تنقل الطاقة إلى جيرانها المباشرين."
      },
      tier2: {
        en: "Toggling the middle node affects the entire grid array.",
        ar: "تبديل العقدة الوسطى يؤثر على المصفوفة بأكملها."
      },
      tier3: {
        en: "Tap Node 3, then Node 2 to illuminate all conduits.",
        ar: "انقر العقدة الثالثة، ثم العقدة الثانية لإضاءة كل القنوات."
      }
    },
    starCriteria: { maxMoves: 3, maxTime: 50 }
  },
  {
    id: 4,
    environment: "neon",
    type: "pattern",
    title: { en: "Level 4: Cyber Matrix", ar: "الغرفة 4: مصفوفة الرموز السايبرانية" },
    objective: { 
      en: "Identify the missing geometric node in the 2x2 logic matrix.", 
      ar: "حدد الشكل الهندسي المفقود في مصفوفة المنطق 2×2." 
    },
    // Pattern: Row 1: 1-dot Cyan, 2-dot Cyan; Row 2: 3-dot Cyan, ? (4-dot Cyan)
    gridDescription: "[ ● ]  ➔  [ ● ● ]\n[ ● ● ● ]  ➔  [ ? ]",
    options: ["● ●", "● ● ● ●", "▲ ▲", "■ ■"],
    correctAnswer: "● ● ● ●",
    hints: {
      tier1: {
        en: "Count the number of active photon particles in each chamber cell.",
        ar: "احسب عدد جسيمات الفوتون النشطة في كل خلية من المصفوفة."
      },
      tier2: {
        en: "The count increments by +1 in each progressive step.",
        ar: "يزداد العدد بمقدار +1 في كل خطوة متتالية."
      },
      tier3: {
        en: "Select the option with 4 photon dots: ● ● ● ●.",
        ar: "اختر الخيار الذي يحتوي على 4 نقاط فوتونية: ● ● ● ●."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 40 }
  },
  {
    id: 5,
    environment: "neon",
    type: "logic_deduction",
    title: { en: "Level 5: Laboratory Core Overdrive", ar: "الغرفة 5: شفرة النواة الفائقة" },
    objective: { 
      en: "Deduce the 3-digit security code using the terminal sensor telemetry.", 
      ar: "استنتج الرمز الأمني الثلاثي باستخدام قراءات مستشعرات المحطة." 
    },
    clues: [
      { en: "Code consists of digits 1 to 5 with NO repeats.", ar: "الرمز يتكون من أرقام من 1 إلى 5 بدون تكرار." },
      { en: "The sum of all three digits is 9.", ar: "مجموع الأرقام الثلاثة يساوي 9." },
      { en: "First digit is strictly less than the second (D1 < D2).", ar: "الرقم الأول أصغر تماماً من الرقم الثاني." },
      { en: "Third digit is the largest: it is 5.", ar: "الرقم الثالث هو الأكبر: وقيمته 5." },
      { en: "First digit is an odd number.", ar: "الرقم الأول عدد فردي." }
    ],
    options: ["1-3-5", "2-2-5", "1-4-4", "2-3-4"],
    correctAnswer: "1-3-5",
    hints: {
      tier1: {
        en: "The last digit is fixed as 5. Therefore D1 + D2 must equal 4.",
        ar: "الرقم الأخير محدد بـ 5، إذن مجموع الرقمين الأول والثاني يجب أن يساوي 4."
      },
      tier2: {
        en: "Since digits cannot repeat, 2-2 is invalid. D1 < D2 means D1 must be 1 and D2 must be 3.",
        ar: "نظراً لعدم وجود تكرار، 2-2 غير مسموح. وبما أن D1 < D2، فالرقم الأول 1 والثاني 3."
      },
      tier3: {
        en: "The unique valid passkey is 1-3-5.",
        ar: "رمز فك القفل الصحيح هو 1-3-5."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 50 }
  },

  // ==================== ENVIRONMENT 2: THE CRYSTAL TEMPLE ====================
  {
    id: 6,
    environment: "crystal",
    type: "sequence",
    title: { en: "Level 6: Harmonic Frequencies", ar: "الغرفة 6: الترددات البلورية التوافقية" },
    objective: { 
      en: "Harmonize the crystal obelisk with the sacred Fibonacci sequence.", 
      ar: "اضبط اهتزاز المسلة البلورية وفق متتالية فيبوناتشي التوافقية." 
    },
    question: "3  ➔  5  ➔  8  ➔  13  ➔  21  ➔  ?",
    options: ["29", "31", "34", "36"],
    correctAnswer: "34",
    hints: {
      tier1: {
        en: "Each frequency is the sum of the two preceding crystal vibrations.",
        ar: "كل تردد بلوري هو مجموع الاهتزازين السابقين له مباشرة."
      },
      tier2: {
        en: "Calculate 13 + 21 to find the resonant harmonic.",
        ar: "احسب ناتج جمع 13 + 21 لمعرفة التردد الرنيني."
      },
      tier3: {
        en: "13 + 21 = 34. Select 34 to resonate the obelisk.",
        ar: "13 + 21 = 34. اختر 34 لإطلاق رنين المسلة."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 45 }
  },
  {
    id: 7,
    environment: "crystal",
    type: "rotation",
    title: { en: "Level 7: Prismatic Tri-Ring", ar: "الغرفة 7: حلقات المنشور البلوري الثلاثية" },
    objective: { 
      en: "Align 3 concentric crystal rings to focus refracted white light onto the altar.", 
      ar: "حاذِ الحلقات البلورية الثلاث لتركيز الضوء المنكسر على المذبح المقدس." 
    },
    rings: [
      { id: "inner", initialAngle: 90, targetAngle: 0, label: { en: "Inner Ring", ar: "الحلقة الداخلية" } },
      { id: "mid", initialAngle: 180, targetAngle: 0, label: { en: "Middle Ring", ar: "الحلقة الوسطى" } },
      { id: "outer", initialAngle: 270, targetAngle: 0, label: { en: "Outer Ring", ar: "الحلقة الخارجية" } }
    ],
    hints: {
      tier1: {
        en: "All three light conduits must align at the 0° zenith point.",
        ar: "يجب أن تلتقي مسارات الضوء الثلاثة عند نقطة السمت 0°."
      },
      tier2: {
        en: "Each ring rotates in 90° quantum increments.",
        ar: "تدور كل حلقة بخطوات قدرها 90 درجة."
      },
      tier3: {
        en: "Rotate Inner once (-90°), Middle twice (180°), Outer 3 times (-270°) to face 0°.",
        ar: "قم بتدوير كل حلقة حتى يصبح مؤشرها في الأعلى تماماً عند 0°."
      }
    },
    starCriteria: { maxMoves: 8, maxTime: 55 }
  },
  {
    id: 8,
    environment: "crystal",
    type: "switch_network",
    title: { en: "Level 8: Refraction Grid", ar: "الغرفة 8: شبكة الانكسار الرباعية" },
    objective: { 
      en: "Illuminate all 4 crystal focus points in the temple sanctuary.", 
      ar: "أضئ جميع نقاط التركيز البلورية الأربع في محراب المعبد." 
    },
    nodeCount: 4,
    initialNodes: [false, true, false, false],
    targetNodes: [true, true, true, true],
    adjacency: [
      [0, 1, 3],    // Node 0 flips 0, 1, 3
      [0, 1, 2],    // Node 1 flips 0, 1, 2
      [1, 2, 3],    // Node 2 flips 1, 2, 3
      [0, 2, 3]     // Node 3 flips 0, 2, 3
    ],
    hints: {
      tier1: {
        en: "Prisms refract energy across opposite diagonal corners.",
        ar: "تقوم المنشورات بعكس وتوزيع الطاقة قطرياً عبر الزوايا."
      },
      tier2: {
        en: "Nodes 1 and 3 toggle symmetrical light paths.",
        ar: "العقدتان 1 و 3 تبدلان مسارات ضوئية متناظرة."
      },
      tier3: {
        en: "Try activating Node 1, then Node 4.",
        ar: "جرّب تفعيل العقدة 1 ثم العقدة 4 لإشعال الشبكة بالكامل."
      }
    },
    starCriteria: { maxMoves: 4, maxTime: 60 }
  },
  {
    id: 9,
    environment: "crystal",
    type: "pattern",
    title: { en: "Level 9: Sacred Rune Matrix", ar: "الغرفة 9: مصفوفة الرونية المقدسة" },
    objective: { 
      en: "Determine the missing rune in the 3x3 geometric crystal wall.", 
      ar: "حدد الرمز الروني المفقود في جدار المعبد البلوري 3×3." 
    },
    gridDescription: "Row 1: [ ▲ ]  [ ▲▲ ]  [ ▲▲▲ ]\nRow 2: [ ◆ ]  [ ◆◆ ]  [ ◆◆◆ ]\nRow 3: [ ⬡ ]  [ ⬡⬡ ]  [  ?  ]",
    options: ["⬡", "⬡⬡", "⬡⬡⬡", "▲▲▲"],
    correctAnswer: "⬡⬡⬡",
    hints: {
      tier1: {
        en: "Compare row shapes: Row 1 is triangles, Row 2 is diamonds, Row 3 is hexagons.",
        ar: "قارن أشكال الصفوف: الصف 1 مثلثات، الصف 2 معينات، الصف 3 سداسيات."
      },
      tier2: {
        en: "Each column increments the glyph count: 1, 2, then 3.",
        ar: "كل عمود يزيد عدد الرموز: 1، ثم 2، ثم 3."
      },
      tier3: {
        en: "Row 3 column 3 requires three hexagons: ⬡⬡⬡.",
        ar: "الصف الثالث العمود الثالث يحتاج إلى ثلاثة أشكال سداسية: ⬡⬡⬡."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 40 }
  },
  {
    id: 10,
    environment: "crystal",
    type: "logic_deduction",
    title: { en: "Level 10: Guardian's Riddle", ar: "الغرفة 10: لغز حارس المعبد" },
    objective: { 
      en: "Identify the guardian crystal element based on the temple inscriptions.", 
      ar: "حدد العنصر البلوري الحارس وفق نقوش جدران المعبد." 
    },
    clues: [
      { en: "Four sacred elements exist: Ruby (Fire), Sapphire (Water), Emerald (Earth), Topaz (Air).", ar: "توجد أربعة عناصر: الياقوت (النار)، الزفير (الماء)، الزمرد (الأرض)، التوباز (الهواء)." },
      { en: "The guardian is NOT placed in an unstable fiery state (Not Fire).", ar: "الحارس لا ينتمي إلى عنصر النار المضطرب." },
      { en: "The guardian's frequency is strictly higher than Emerald (Earth).", ar: "تردد الحارس أعلى قطعاً من تردد الزمرد (الأرض)." },
      { en: "The element that flows like eternal waves is the true guardian.", ar: "العنصر الذي يتدفق كالأمواج الأبدية هو الحارس الحقيقي." }
    ],
    options: ["Ruby (Fire)", "Sapphire (Water)", "Emerald (Earth)", "Topaz (Air)"],
    correctAnswer: "Sapphire (Water)",
    hints: {
      tier1: {
        en: "Rule out Ruby immediately based on the first exclusion clue.",
        ar: "استبعد الياقوت فوراً بناءً على شرط الاستبعاد الأول."
      },
      tier2: {
        en: "Inspect the clue referencing waves and flowing water.",
        ar: "تفحص الدليل الذي يتحدث عن التدفق كالأمواج والماء."
      },
      tier3: {
        en: "Sapphire (Water) satisfies all elemental constraints.",
        ar: "الزفير الأزرق (الماء) يحقق جميع الشروط والقيود."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 45 }
  },

  // ==================== ENVIRONMENT 3: THE QUANTUM VAULT ====================
  {
    id: 11,
    environment: "quantum",
    type: "sequence",
    title: { en: "Level 11: Quantum Superposition", ar: "الغرفة 11: التراكب الكمومي" },
    objective: { 
      en: "Calculate the quantum spin eigenstate in this geometric power sequence.", 
      ar: "احسب الحالة الكمومية التالية في متتالية قوى الطاقة الهندسية." 
    },
    question: "1  ➔  3  ➔  9  ➔  27  ➔  ?",
    options: ["54", "81", "72", "99"],
    correctAnswer: "81",
    hints: {
      tier1: {
        en: "Each quantum tier multiplies the preceding tier by 3 (Powers of 3).",
        ar: "كل مستوى كمومي يضرب المستوى السابق في 3 (قوى العدد 3)."
      },
      tier2: {
        en: "Calculate 27 × 3 to find the stable harmonic state.",
        ar: "احسب ناتج ضرب 27 × 3 للوصول إلى الحالة المستقرة."
      },
      tier3: {
        en: "27 × 3 = 81. Select 81 to collapse the superposition.",
        ar: "27 × 3 = 81. اختر 81 لاستقرار الحالة الكمومية."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 40 }
  },
  {
    id: 12,
    environment: "quantum",
    type: "rotation",
    title: { en: "Level 12: Dimensional Gyroscope", ar: "الغرفة 12: الجيروسكوب البُعدي" },
    objective: { 
      en: "Synchronize all 3 quantum gyroscope gimbal rings into singularity alignment.", 
      ar: "زامن حلقات الجيروسكوب الكمومي الثلاث للوصول إلى محاذاة نقطة التفرد." 
    },
    rings: [
      { id: "alpha", initialAngle: 180, targetAngle: 0, label: { en: "Alpha Gimbal", ar: "حلقة ألفا" } },
      { id: "beta", initialAngle: 90, targetAngle: 0, label: { en: "Beta Gimbal", ar: "حلقة بيتا" } },
      { id: "gamma", initialAngle: 270, targetAngle: 0, label: { en: "Gamma Gimbal", ar: "حلقة جاما" } }
    ],
    hints: {
      tier1: {
        en: "Each gimbal ring controls an orthogonal dimensional plane.",
        ar: "كل حلقة جيروسكوبية تتحكم في مستوى بعدي متعامد."
      },
      tier2: {
        en: "Turn each ring until its luminous quantum notch aligns with the top zenith (0°).",
        ar: "أدر كل حلقة حتى يتطابق ثلمها الكمومي المضيء مع قمة السمت (0°)."
      },
      tier3: {
        en: "Rotate Alpha twice, Beta 3 times, Gamma once to complete singularity.",
        ar: "أدر ألفا مرتين، وبيتا 3 مرات، وجاما مرة واحدة لتكتمل المحاذاة."
      }
    },
    starCriteria: { maxMoves: 8, maxTime: 60 }
  },
  {
    id: 13,
    environment: "quantum",
    type: "switch_network",
    title: { en: "Level 13: Entangled Node Array", ar: "الغرفة 13: مصفوفة التشابك الكمومي" },
    objective: { 
      en: "Entangle and activate all 5 quantum nodes simultaneously.", 
      ar: "شابك وفعّل جميع العقد الكمومية الخمس في نفس اللحظة." 
    },
    nodeCount: 5,
    initialNodes: [true, false, false, false, true],
    targetNodes: [true, true, true, true, true],
    adjacency: [
      [0, 1, 4],       // Node 0
      [0, 1, 2],       // Node 1
      [1, 2, 3],       // Node 2
      [2, 3, 4],       // Node 3
      [3, 4, 0]        // Node 4
    ],
    hints: {
      tier1: {
        en: "In a circular array of 5 nodes, toggling one affects its two direct neighbors.",
        ar: "في حلقة من 5 عقد، يؤثر تبديل كل عقدة على جارتيها المباشرتين."
      },
      tier2: {
        en: "Focus on the unlit nodes in the center (Nodes 2, 3, 4).",
        ar: "ركز على العقد غير المضاءة في المنتصف (العقد 2 و 3 و 4)."
      },
      tier3: {
        en: "Toggling Node 2 and then Node 3 achieves complete entanglement.",
        ar: "تبديل العقدة 2 ثم العقدة 3 يحقق التشابك التام."
      }
    },
    starCriteria: { maxMoves: 4, maxTime: 65 }
  },
  {
    id: 14,
    environment: "quantum",
    type: "pattern",
    title: { en: "Level 14: Multiverse Warp Matrix", ar: "الغرفة 14: مصفوفة الاعوجاج الكوني" },
    objective: { 
      en: "Decode the multi-dimensional rotation and color pattern of the warp core.", 
      ar: "فك شفرة الدوران اللوني متعدد الأبعاد لنواة الاعوجاج." 
    },
    gridDescription: "Row 1: [ ◓ Cyan ]  ➔  [ ◑ Violet ]  ➔  [ ◒ Gold ]\nRow 2: [ ◐ Cyan ]  ➔  [ ◓ Violet ]  ➔  [ ◑ Gold ]\nRow 3: [ ◒ Cyan ]  ➔  [ ◐ Violet ]  ➔  [    ?    ]",
    options: ["◓ Gold", "◒ Violet", "◑ Gold", "◐ Cyan"],
    correctAnswer: "◓ Gold",
    hints: {
      tier1: {
        en: "Look at the column colors: Column 3 is always Gold.",
        ar: "انظر إلى ألوان الأعمدة: العمود الثالث دائماً باللون الذهبي (Gold)."
      },
      tier2: {
        en: "Track rotation of the circle shader: it rotates 90° clockwise in each step.",
        ar: "تتبع دوران تظليل الدائرة: يدور 90 درجة باتجاه عقارب الساعة في كل خطوة."
      },
      tier3: {
        en: "The missing glyph is ◓ in Gold: select '◓ Gold'.",
        ar: "الرمز المفقود هو ◓ باللون الذهبي: اختر '◓ Gold'."
      }
    },
    starCriteria: { maxMoves: 2, maxTime: 45 }
  },
  {
    id: 15,
    environment: "quantum",
    type: "grand_puzzle",
    title: { en: "Level 15: The MindSphere Paradox", ar: "الغرفة 15: مفارقة كرة العقل الكبرى" },
    objective: { 
      en: "Solve the master chamber: align the 3D quantum core and decipher the universal constant.", 
      ar: "حل الغرفة الكبرى: حاذِ النواة ثلاثية الأبعاد وفك شفرة الثابت الكوني النهائي." 
    },
    question: "Quantum Equation: (2³ × 3) + 7 = ?",
    options: ["29", "31", "33", "35"],
    correctAnswer: "31",
    rings: [
      { id: "coreRing", initialAngle: 180, targetAngle: 0, label: { en: "Core Ring", ar: "حلقة النواة" } }
    ],
    hints: {
      tier1: {
        en: "Solve the arithmetic order of operations: first powers (2³), then multiplication, then addition.",
        ar: "ابدأ بالأولويات الحسابية: أولاً الأسس (2³)، ثم الضرب، ثم الجمع."
      },
      tier2: {
        en: "2³ = 8. Then 8 × 3 = 24. Now add 7.",
        ar: "2³ = 8، ثم 8 × 3 = 24، وأخيراً أضف 7."
      },
      tier3: {
        en: "24 + 7 = 31. Rotate the core ring and select 31 to conquer MindSphere 3D!",
        ar: "24 + 7 = 31. أدر حلقة النواة واختر 31 لتحقيق النصر النهائي!"
      }
    },
    starCriteria: { maxMoves: 3, maxTime: 60 }
  }
];
