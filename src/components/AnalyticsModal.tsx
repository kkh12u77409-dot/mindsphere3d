import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  Target,
  Star,
  Sparkles,
  Flame,
  Compass,
  Brain,
  Trophy,
  Lock,
  Award,
  TrendingUp,
  X
} from 'lucide-react';
import { HistoryRecord, SaveData } from '../types/game';
import { ACHIEVEMENTS } from '../data/achievements';
import { SupportedLanguage, translate } from '../services/i18n';

interface AnalyticsModalProps {
  data: HistoryRecord[];
  saveData: SaveData;
  language: SupportedLanguage;
  onClose: () => void;
}

type TabType = 'trend' | 'achievements';
type FilterType = 'all' | 'unlocked' | 'locked';

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  data,
  saveData,
  language,
  onClose
}) => {
  const t = (k: string) => translate(k, language);
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<TabType>('achievements');
  const [filter, setFilter] = useState<FilterType>('all');

  // Chart data calculations
  const scores = data.map(d => d.score);
  const peak = scores.length > 0 ? Math.max(...scores) : 0;
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const formattedChartData = data.map((d, index) => ({
    name: isRtl ? `غرفة ${d.level}` : `Lvl ${d.level}`,
    score: d.score,
    time: `${d.time || 0}s`,
    moves: d.moves || 0,
    index: index + 1
  }));

  // Achievements evaluation
  const evaluatedAchievements = useMemo(() => {
    return ACHIEVEMENTS.map(ach => {
      const progress = ach.calculateProgress(saveData);
      const unlockMeta = saveData.unlockedAchievements?.[ach.id];
      return {
        ...ach,
        progress,
        isUnlocked: progress.isUnlocked,
        unlockedAt: unlockMeta?.unlockedAt
      };
    });
  }, [saveData]);

  const unlockedCount = evaluatedAchievements.filter(a => a.isUnlocked).length;
  const totalAchievements = evaluatedAchievements.length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') {
      return evaluatedAchievements.filter(a => a.isUnlocked);
    }
    if (filter === 'locked') {
      return evaluatedAchievements.filter(a => !a.isUnlocked);
    }
    return evaluatedAchievements;
  }, [evaluatedAchievements, filter]);

  // Fastest recorded chamber time
  const fastestTime = useMemo(() => {
    let best = 999999;
    if (saveData.completedLevels) {
      Object.values(saveData.completedLevels).forEach(lvl => {
        if (lvl.bestTime && lvl.bestTime > 0) best = Math.min(best, lvl.bestTime);
      });
    }
    if (saveData.history) {
      saveData.history.forEach(h => {
        if (h.time && h.time > 0) best = Math.min(best, h.time);
      });
    }
    return best < 999999 ? `${best}s` : '--';
  }, [saveData]);

  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const iconProps = {
      size: 20,
      className: isUnlocked ? 'text-[#00f2fe]' : 'text-slate-500'
    };
    switch (iconName) {
      case 'Clock':
        return <Clock {...iconProps} />;
      case 'Activity':
        return <Activity {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'CheckCircle2':
        return <CheckCircle2 {...iconProps} />;
      case 'Target':
        return <Target {...iconProps} />;
      case 'Star':
        return <Star {...iconProps} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} />;
      case 'Flame':
        return <Flame {...iconProps} />;
      case 'Compass':
        return <Compass {...iconProps} />;
      case 'Brain':
        return <Brain {...iconProps} />;
      case 'Trophy':
        return <Trophy {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ payload: { score: number; time: string; moves: number } }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(14, 21, 38, 0.95)',
            border: '1px solid #00f2fe',
            borderRadius: '10px',
            padding: '8px 12px',
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)',
            color: '#fff',
            fontSize: '12px',
            textAlign: isRtl ? 'right' : 'left',
            direction: isRtl ? 'rtl' : 'ltr'
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#00f2fe', marginBottom: '4px' }}>{label}</div>
          <div>
            {isRtl ? 'نقاط الذكاء' : 'Intelligence Points'}:{' '}
            <strong style={{ color: '#ffb703' }}>{item.score}</strong>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
            {isRtl ? 'الزمن' : 'Time'}: {item.time} • {isRtl ? 'الحركات' : 'Actions'}: {item.moves}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="modal-intelligence-chart" className="screen-overlay modal active">
      <div
        className="modal-card"
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 18px',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h2 className="modal-title" style={{ margin: 0, textAlign: isRtl ? 'right' : 'left' }}>
              {activeTab === 'achievements' ? t('achievements_section_title') : t('intelligence_chart_title')}
            </h2>
            <p className="modal-desc" style={{ margin: '4px 0 0 0', textAlign: isRtl ? 'right' : 'left' }}>
              {activeTab === 'achievements' ? t('achievements_section_desc') : t('intelligence_chart_sub')}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('close_btn')}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Navigation Tabs (Segmented control) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(6, 9, 19, 0.7)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '14px',
            gap: '4px'
          }}
        >
          <button
            onClick={() => setActiveTab('achievements')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: activeTab === 'achievements' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              background: activeTab === 'achievements' ? 'rgba(0, 242, 254, 0.16)' : 'transparent',
              color: activeTab === 'achievements' ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.18s ease'
            }}
          >
            <Trophy size={15} />
            <span>{t('achievements_tab')}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '8px',
                background: activeTab === 'achievements' ? 'rgba(0, 242, 254, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: activeTab === 'achievements' ? '#fff' : 'var(--text-dim)',
                fontFamily: 'monospace'
              }}
            >
              {unlockedCount}/{totalAchievements}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: activeTab === 'trend' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              background: activeTab === 'trend' ? 'rgba(0, 242, 254, 0.16)' : 'transparent',
              color: activeTab === 'trend' ? 'var(--accent-cyan)' : 'var(--text-dim)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.18s ease'
            }}
          >
            <TrendingUp size={15} />
            <span>{t('trends_tab')}</span>
          </button>
        </div>

        {/* Tab 1: Accomplishments & Milestones */}
        {activeTab === 'achievements' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* KPI Summary Strip */}
            <div
              className="stats-summary"
              style={{
                gridTemplateColumns: '1fr 1fr 1fr',
                margin: '0 0 10px 0',
                gap: '8px'
              }}
            >
              <div className="summary-card" style={{ padding: '8px 4px' }}>
                <div className="val" style={{ color: 'var(--accent-gold)', fontSize: '18px' }}>
                  {unlockedCount}/{totalAchievements}
                </div>
                <div className="lbl" style={{ fontSize: '11px' }}>{t('milestones_progress_label')}</div>
              </div>
              <div className="summary-card" style={{ padding: '8px 4px' }}>
                <div className="val" style={{ color: 'var(--accent-cyan)', fontSize: '18px' }}>
                  {saveData.totalMoves || 0}
                </div>
                <div className="lbl" style={{ fontSize: '11px' }}>{t('total_moves_label')}</div>
              </div>
              <div className="summary-card" style={{ padding: '8px 4px' }}>
                <div className="val" style={{ color: 'var(--accent-violet)', fontSize: '18px' }}>
                  {fastestTime}
                </div>
                <div className="lbl" style={{ fontSize: '11px' }}>{t('speed_record_label')}</div>
              </div>
            </div>

            {/* Overall Progress Bar Card */}
            <div
              style={{
                background: 'rgba(14, 21, 38, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '8px 12px',
                marginBottom: '10px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  marginBottom: '6px'
                }}
              >
                <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>
                  {isRtl ? 'التقدم الإجمالي في المعالم' : 'Milestone Mastery'}
                </span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontFamily: 'monospace' }}>
                  {completionPercentage}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${completionPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-gold) 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '8px',
                overflowX: 'auto',
                paddingBottom: '2px'
              }}
            >
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filter === 'all' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: filter === 'all' ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: filter === 'all' ? 'var(--accent-cyan)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('filter_all')} ({totalAchievements})
              </button>
              <button
                onClick={() => setFilter('unlocked')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filter === 'unlocked' ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  background: filter === 'unlocked' ? 'rgba(255, 183, 3, 0.15)' : 'rgba(255, 255, 254, 0.04)',
                  color: filter === 'unlocked' ? 'var(--accent-gold)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('filter_unlocked')} ({unlockedCount})
              </button>
              <button
                onClick={() => setFilter('locked')}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: filter === 'locked' ? '1px solid var(--accent-violet)' : '1px solid var(--border-subtle)',
                  background: filter === 'locked' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                  color: filter === 'locked' ? 'var(--accent-violet)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('filter_locked')} ({totalAchievements - unlockedCount})
              </button>
            </div>

            {/* Scrollable Achievements Cards List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '2px',
                minHeight: '160px'
              }}
            >
              {filteredAchievements.map(ach => {
                const titleStr = ach.title[language] || ach.title.en;
                const descStr = ach.description[language] || ach.description.en;
                const categoryBadge =
                  ach.category === 'speed'
                    ? t('milestone_badge_speed')
                    : ach.category === 'moves'
                    ? t('milestone_badge_moves')
                    : ach.category === 'stars'
                    ? t('milestone_badge_stars')
                    : t('milestone_badge_mastery');

                return (
                  <div
                    key={ach.id}
                    style={{
                      background: ach.isUnlocked
                        ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(14, 21, 38, 0.8) 100%)'
                        : 'rgba(14, 21, 38, 0.55)',
                      border: ach.isUnlocked
                        ? '1px solid rgba(0, 242, 254, 0.4)'
                        : '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      position: 'relative',
                      boxShadow: ach.isUnlocked ? '0 0 12px rgba(0, 242, 254, 0.15)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Icon Container */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: ach.isUnlocked
                          ? 'rgba(0, 242, 254, 0.18)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: ach.isUnlocked
                          ? '1px solid var(--accent-cyan)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {ach.isUnlocked ? (
                        renderIcon(ach.icon, true)
                      ) : (
                        <div style={{ position: 'relative' }}>
                          {renderIcon(ach.icon, false)}
                          <Lock
                            size={10}
                            style={{
                              position: 'absolute',
                              bottom: -2,
                              right: -4,
                              color: '#94a3b8'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Achievement Details */}
                    <div style={{ flex: 1, minWidth: 0, textAlign: isRtl ? 'right' : 'left' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px'
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: 700,
                            color: ach.isUnlocked ? '#fff' : '#cbd5e1',
                            letterSpacing: '0.2px'
                          }}
                        >
                          {titleStr}
                        </h4>

                        {/* Unlocked / In-Progress Indicator */}
                        {ach.isUnlocked ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: 'var(--accent-cyan)'
                            }}
                          >
                            <CheckCircle2 size={12} />
                            <span>{t('unlocked_status')}</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--text-dim)',
                              fontFamily: 'monospace'
                            }}
                          >
                            {ach.progress.formattedProgress}
                          </span>
                        )}
                      </div>

                      {/* Metadata row without pill box per design guidelines */}
                      <div
                        style={{
                          fontSize: '10px',
                          color: 'var(--text-dim)',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{categoryBadge}</span>
                        {ach.unlockedAt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>
                              {new Date(ach.unlockedAt).toLocaleDateString(
                                isRtl ? 'ar-EG' : 'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          fontSize: '12px',
                          color: ach.isUnlocked ? 'var(--text-main)' : '#94a3b8',
                          lineHeight: '1.3'
                        }}
                      >
                        {descStr}
                      </p>

                      {/* Progress Bar for In-Progress Items */}
                      {!ach.isUnlocked && (
                        <div style={{ marginTop: '6px' }}>
                          <div
                            style={{
                              width: '100%',
                              height: '4px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '2px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${ach.progress.percentage}%`,
                                height: '100%',
                                background: 'var(--accent-violet)',
                                borderRadius: '2px'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Intelligence Trend Recharts View */}
        {activeTab === 'trend' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* KPI summary statistics */}
            <div className="stats-summary" style={{ gridTemplateColumns: '1fr 1fr 1fr', margin: '4px 0 12px 0' }}>
              <div className="summary-card">
                <div className="val" style={{ color: 'var(--accent-gold)' }}>
                  {peak}
                </div>
                <div className="lbl">{t('peak_score_label')}</div>
              </div>
              <div className="summary-card">
                <div className="val" style={{ color: 'var(--accent-cyan)' }}>
                  {avg}
                </div>
                <div className="lbl">{t('avg_score_label')}</div>
              </div>
              <div className="summary-card">
                <div className="val" style={{ color: 'var(--accent-violet)' }}>
                  {data.length}/10
                </div>
                <div className="lbl">{t('chambers_analyzed_label')}</div>
              </div>
            </div>

            {/* Recharts Data Visualization mount container */}
            <div
              style={{
                width: '100%',
                height: '240px',
                background: 'rgba(6, 9, 19, 0.6)',
                borderRadius: '14px',
                border: '1px solid var(--border-glow)',
                boxShadow: 'var(--glow-cyan)',
                padding: '8px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="intelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#9d4edd" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#00f2fe"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#intelGrad)"
                    activeDot={{ r: 6, fill: '#ffb703', stroke: '#fff', strokeWidth: 2 }}
                    dot={{ r: 3.5, fill: '#00f2fe', stroke: '#060913', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <button className="btn-secondary" onClick={onClose} style={{ marginTop: '12px', flexShrink: 0 }}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
