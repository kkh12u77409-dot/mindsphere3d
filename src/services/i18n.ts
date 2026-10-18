export type SupportedLanguage = 'en' | 'ar';

export const I18N: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // App & Menus
    app_title: "MindSphere 3D",
    app_subtitle: "Logic & Spatial Cognition",
    play_btn: "Start Chamber",
    continue_btn: "Continue Journey",
    level_select_btn: "Chamber Matrix",
    settings_btn: "System Settings",
    how_to_play_btn: "Neural Manual",
    reset_btn: "Reset Neural Memory",
    intelligence_chart_btn: "Intelligence Analytics",
    intelligence_chart_title: "Neural Intelligence Trend",
    intelligence_chart_sub: "Real-time cognition and points performance over your last 10 chambers played.",
    peak_score_label: "Peak Score",
    avg_score_label: "Average Score",
    chambers_analyzed_label: "Chambers Tracked",
    time_attack_toggle: "Time Attack Mode",
    time_attack_badge: "⚡ TIME ATTACK",
    time_attack_desc: "Beat the countdown to score bonus Intelligence Points and rank on the global leaderboard!",
    leaderboard_btn: "Global Leaderboard",
    leaderboard_title: "Global Neural Leaderboard",
    leaderboard_sub: "Top solvers ranked by Speed, Accuracy, and Intelligence Points.",
    time_remaining: "Time Left",
    bonus_points_earned: "Time Attack Bonus",
    time_expired_title: "Time Expired!",
    time_expired_desc: "The chamber frequency collapsed before calibration was achieved.",
    rank_label: "Global Rank",
    player_you: "You",
    switch_to_normal: "Switch to Normal Mode",
    time_attack_bonus_notice: "⚡ 1.5x Multiplier and Time Bonus awarded!",
    time_attack_launch: "⚡ Play Time Attack",
    time_attack_active_alert: "⚡ Time Attack Active: Beat the timer for bonus Intelligence Points!",
    leaderboard_filter_time_attack: "⚡ Time Attack Masters",
    leaderboard_filter_all: "🏆 Global Solvers",
    new_rank_congrats: "New Leaderboard Record!",
    speed_bonus: "Speed Bonus",
    base_score: "Base Score",
    multiplier: "Multiplier",

    // Achievements & Analytics
    achievements_tab: "Accomplishments",
    trends_tab: "Cognitive Curve",
    achievements_section_title: "Neural Milestones",
    achievements_section_desc: "Calibrate milestones across speed feats, movement discipline, and quantum chamber mastery.",
    filter_all: "All Milestones",
    filter_unlocked: "Unlocked",
    filter_locked: "In Progress",
    milestones_progress_label: "Milestones Conquered",
    unlocked_status: "Unlocked",
    in_progress_status: "In Progress",
    unlocked_at_label: "Unlocked on",
    achievement_unlocked_toast: "Achievement Unlocked!",
    total_moves_label: "Total Moves",
    speed_record_label: "Fastest Chamber",
    milestone_badge_speed: "Speed Feat",
    milestone_badge_moves: "Move Discipline",
    milestone_badge_stars: "Resonance Feat",
    milestone_badge_mastery: "Mastery Feat",

    // Ghost Mode
    ghost_mode: "Ghost Mode",
    ghost_playback: "Ghost Playback",
    ghost_badge: "👻 GHOST PLAYBACK",
    ghost_replay_btn: "Ghost Playback",
    ghost_play: "Play",
    ghost_pause: "Pause",
    ghost_speed: "Speed",
    ghost_exit: "Exit Ghost Mode",
    ghost_completed_toast: "Ghost playback completed!",
    ghost_moves_label: "Moves",
    ghost_desc: "Playback of your best performance with camera movements and action sequences.",

    // HUD & Navigation
    chamber_label: "Chamber",
    objective_label: "Objective",
    moves_label: "Actions",
    time_label: "Time",
    stars_label: "Resonance",
    hint_btn: "Neural Clue",
    reset_cam_btn: "Align View",
    pause_btn: "Pause",
    resume_btn: "Resume",
    exit_menu_btn: "Exit to Nexus",
    restart_level_btn: "Reboot Puzzle",

    // Environments
    env_all: "All Chambers",
    env_neon: "Neon Laboratory",
    env_crystal: "Crystal Temple",
    env_quantum: "Quantum Vault",

    // Dialogs & Modals
    hints_title: "Neural Guidance Matrix",
    hint_tier_1: "Gentle Insight",
    hint_tier_2: "Directional Logic",
    hint_tier_3: "Core Solution Step",
    unlock_hint_btn: "Decode Insight",
    hint_penalty_notice: "Decoded clues maintain rating if objective is solved accurately.",

    victory_title: "Chamber Conquered!",
    victory_sub: "Hydraulic Blast Door Unlocked",
    next_level_btn: "Next Chamber",
    replay_btn: "Recalibrate",
    victory_time: "Completion Time",
    victory_moves: "Total Actions",
    victory_score: "Resonance Score",
    stars_earned: "Stars Earned",

    final_victory_title: "MindSphere Ascended!",
    final_victory_sub: "All 15 Futuristic Chambers Solved. The Quantum Core is Stabilized.",
    final_score: "Total Neural Score",

    settings_title: "System Calibration",
    sound_fx: "Acoustic Effects",
    music_vol: "Ambient Resonance",
    vibration: "Haptic Feedback",
    language_select: "Language (اللغة)",
    quality_mode: "Visual Fidelity",
    quality_high: "Quantum (High)",
    quality_low: "Eco (Performance)",
    reset_confirm: "Are you sure you want to clear all chamber progress and stars?",
    reset_done: "Neural memory successfully wiped.",

    // Puzzle Interaction Prompts
    rotate_ring_prompt: "Rotate the rings to align energy channels.",
    select_missing_prompt: "Identify the missing value in the sequence.",
    toggle_switches_prompt: "Configure the node grid so all energy conduits ignite.",
    matrix_pattern_prompt: "Detect the geometric progression and complete the pattern.",
    logic_deduction_prompt: "Analyze the terminal telemetry constraints to unlock the core.",
    grand_puzzle_prompt: "Harmonize the 3-axis quantum gyroscope and align the core.",

    // General Feedback
    action_correct: "Energy conduit synchronized!",
    action_incorrect: "Frequency mismatch! Try an alternative path.",
    chamber_unlocked: "Blast doors opening...",
    touch_tip: "Drag to orbit camera • Pinch to zoom • Tap objects to interact",

    // How to Play
    manual_title: "Neural Manual",
    manual_p1: "1. Navigation: Touch and drag across the screen to orbit the 3D chamber. Pinch to zoom in on mechanisms.",
    manual_p2: "2. Puzzles: Each futuristic chamber has an interactive puzzle console. Tap pieces or use the HUD console to manipulate them.",
    manual_p3: "3. Solvability: Every puzzle is 100% deterministic and logically sound. Observe rules, examine numbers, symbols, and light beams.",
    manual_p4: "4. Hints: Stuck? Consult the 3-tier neural guidance system anytime without ending your run.",
    close_btn: "Acknowledge"
  },
  ar: {
    // App & Menus
    app_title: "كرة العقل 3D",
    app_subtitle: "تحديات المنطق والإدراك المكاني",
    play_btn: "بدء الغرفة الأولى",
    continue_btn: "متابعة الرحلة",
    level_select_btn: "مصفوفة الغرف",
    settings_btn: "إعدادات النظام",
    how_to_play_btn: "دليل التدريب الذهني",
    reset_btn: "إعادة تعيين الذاكرة",
    intelligence_chart_btn: "مؤشر تطور الذكاء",
    intelligence_chart_title: "منحنى تطور نقاط الذكاء",
    intelligence_chart_sub: "الرسم البياني لتطور أداء ونقاط الرنين الذهني عبر آخر 10 غرف لعبتها.",
    peak_score_label: "أعلى نقاط",
    avg_score_label: "متوسط النقاط",
    chambers_analyzed_label: "الغرف المسجلة",
    time_attack_toggle: "وضع تحدي الوقت",
    time_attack_badge: "⚡ تحدي الوقت",
    time_attack_desc: "تحدَّ العد التنازلي لكسب نقاط ذكاء إضافية ومنافسة المتصدرين حول العالم!",
    leaderboard_btn: "لوحة المتصدرين العالمية",
    leaderboard_title: "لوحة المتصدرين العالمية",
    leaderboard_sub: "أسرع وأذكى المحللين مصنفين حسب السرعة والدقة ونقاط الذكاء.",
    time_remaining: "الوقت المتبقي",
    bonus_points_earned: "مكافأة تحدي الوقت",
    time_expired_title: "انتهى الوقت!",
    time_expired_desc: "انهار تردد الغرفة قبل إتمام المعايرة في الوقت المحدد.",
    rank_label: "الترتيب العالمي",
    player_you: "أنت",
    switch_to_normal: "التحويل للوضع العادي",
    time_attack_bonus_notice: "⚡ تمت مضاعفة النقاط 1.5x مع مكافأة السرعة!",
    time_attack_launch: "⚡ بدء وضع تحدي الوقت",
    time_attack_active_alert: "⚡ تحدي الوقت نشط: اسبق العداد لكسب نقاط ذكاء إضافية!",
    leaderboard_filter_time_attack: "⚡ أبطال تحدي الوقت",
    leaderboard_filter_all: "🏆 لوحة الشرف العامة",
    new_rank_congrats: "رقم قياسي جديد في لوحة المتصدرين!",
    speed_bonus: "مكافأة السرعة",
    base_score: "النقاط الأساسية",
    multiplier: "مضاعف النقاط",

    // Achievements & Analytics
    achievements_tab: "الإنجازات العصبية",
    trends_tab: "منحنى التطور",
    achievements_section_title: "الإنجازات والمعالم العصبية",
    achievements_section_desc: "تتبع إنجازاتك في سرعة الاستجابة، ودقة الحركات، وإتقان حل غرف كرة العقل.",
    filter_all: "كافة الإنجازات",
    filter_unlocked: "المكتملة",
    filter_locked: "قيد الإنجاز",
    milestones_progress_label: "الإنجازات المكتملة",
    unlocked_status: "مكتمل",
    in_progress_status: "قيد الإنجاز",
    unlocked_at_label: "تاريخ الفتح",
    achievement_unlocked_toast: "تم فتح إنجاز جديد!",
    total_moves_label: "إجمالي الحركات",
    speed_record_label: "أسرع حل",
    milestone_badge_speed: "رقم قياسي في السرعة",
    milestone_badge_moves: "انضباط الحركات",
    milestone_badge_stars: "رنين النجوم",
    milestone_badge_mastery: "إتقان الغرف",

    // Ghost Mode
    ghost_mode: "وضع الشبح",
    ghost_playback: "إعادة عرض الشبح",
    ghost_badge: "👻 إعادة عرض الشبح",
    ghost_replay_btn: "إعادة عرض الشبح",
    ghost_play: "تشغيل",
    ghost_pause: "إيقاف مؤقت",
    ghost_speed: "السرعة",
    ghost_exit: "إنهاء العرض",
    ghost_completed_toast: "اكتمل عرض الشبح بنجاح!",
    ghost_moves_label: "الحركات",
    ghost_desc: "إعادة سينمائية لأفضل أداء حققته مع حركات الكاميرا وتسلسل الخطوات.",

    // HUD & Navigation
    chamber_label: "الغرفة",
    objective_label: "الهدف المنطقي",
    moves_label: "الحركات",
    time_label: "الوقت",
    stars_label: "الرنين",
    hint_btn: "تلميح ذكي",
    reset_cam_btn: "إعادة توجيه",
    pause_btn: "إيقاف",
    resume_btn: "استئناف",
    exit_menu_btn: "الرئيسية",
    restart_level_btn: "إعادة تشغيل",

    // Environments
    env_all: "الكل (All)",
    env_neon: "مختبر النيون",
    env_crystal: "معبد البلورات",
    env_quantum: "قبو الكوانتم",

    // Dialogs & Modals
    hints_title: "مصفوفة الإرشاد الذهني",
    hint_tier_1: "تلميح تمهيدي",
    hint_tier_2: "توجيه منطقي",
    hint_tier_3: "خطوة الحل المباشرة",
    unlock_hint_btn: "فك التلميح",
    hint_penalty_notice: "التلميحات تحافظ على التقييم عند الحل بدقة.",

    victory_title: "تم فتح الغرفة بنجاح!",
    victory_sub: "تم فك قفل البوابة الهيدروليكية العملاقة",
    next_level_btn: "الغرفة التالية",
    replay_btn: "إعادة اللغز",
    victory_time: "زمن الإنجاز",
    victory_moves: "مجموع الحركات",
    victory_score: "نقاط الذكاء",
    stars_earned: "النجوم المكتسبة",

    final_victory_title: "تم تتويج عبقري كرة العقل!",
    final_victory_sub: "أكملت بنجاح جميع الغرف الـ15. تم استقرار النواة الكمومية بالكامل.",
    final_score: "مجموع النقاط النهائي",

    settings_title: "معايرة النظام",
    sound_fx: "المؤثرات الصوتية",
    music_vol: "الرنين المحيطي",
    vibration: "الاهتزاز الحركي",
    language_select: "اللغة (Language)",
    quality_mode: "دقة الرسومات",
    quality_high: "فائقة (كوانتم)",
    quality_low: "اقتصادية (أداء)",
    reset_confirm: "هل تريد بالتأكيد تصفير كل تقدمك والنجوم في الغرف؟",
    reset_done: "تم مسح الذاكرة بنجاح.",

    // Puzzle Interaction Prompts
    rotate_ring_prompt: "قم بتدوير الحلقات لمحاذاة قنوات الطاقة المتصلة.",
    select_missing_prompt: "حدد القيمة أو الرمز المفقود في المتتالية المنطقية.",
    toggle_switches_prompt: "اضبط مفاتيح الشبكة لتضيء جميع مسارات الطاقة المتصلة.",
    matrix_pattern_prompt: "اكتشف التدرج الهندسي وأكمل مصفوفة الرموز.",
    logic_deduction_prompt: "حلل قيود ومؤشرات المحطة لفك شفرة النواة.",
    grand_puzzle_prompt: "وافق الدوران ثلاثي الأبعاد ووازن النواة الكمومية النهائية.",

    // General Feedback
    action_correct: "تمت مزامنة مسار الطاقة بنجاح!",
    action_incorrect: "عدم تطابق في التردد! جرب مساراً آخر.",
    chamber_unlocked: "البوابات الهيدروليكية تفتح...",
    touch_tip: "اسحب لتدوير المشهد • قرّب للتكبير • انقر للتفاعل مع العناصر ثلاثية الأبعاد",

    // How to Play
    manual_title: "دليل التدريب الذهني",
    manual_p1: "1. التحكم: المس واسحب على الشاشة لتدوير كاميرا الغرفة ثلاثية الأبعاد. استخدم إصبعين للتكبير والتصغير.",
    manual_p2: "2. الألغاز: تحتوي كل غرفة على آليات ومحطات تفاعلية. انقر على القطع ثلاثية الأبعاد أو استخدم لوحة التحكم المرافقة.",
    manual_p3: "3. المنطق: كل لغز يعتمد 100% على المنطق الحسابي والرياضي والاستنتاج المكاني بدون تخمين عشوائي.",
    manual_p4: "4. التلميحات: يمكنك استشارة نظام التلميحات الثلاثي في أي لحظة عند الحاجة.",
    close_btn: "فهمت، جاهز"
  }
};

export function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem('mindsphere_lang');
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {}
  return 'ar';
}

export function saveLanguage(lang: SupportedLanguage) {
  try {
    localStorage.setItem('mindsphere_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  } catch {}
}

export function translate(key: string, lang: SupportedLanguage): string {
  const dict = I18N[lang] || I18N.en;
  return dict[key] || I18N.en[key] || key;
}
