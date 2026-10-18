import React from 'react';
import { LevelDefinition, PuzzlePlayState } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface HUDProps {
  level: LevelDefinition;
  puzzleState: PuzzlePlayState;
  isTimeAttack: boolean;
  timeAttackLimit: number;
  totalStars: number;
  language: SupportedLanguage;
  onPause: () => void;
  onResetCamera: () => void;
  onOpenAnalytics: () => void;
  onOpenLeaderboard: () => void;
  onToggleLanguage: () => void;
  onOpenHints: () => void;
  onRotateRing: (ringId: string) => void;
  onToggleNode: (index: number) => void;
  onSelectOption: (option: string) => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  puzzleState,
  isTimeAttack,
  timeAttackLimit,
  totalStars,
  language,
  onPause,
  onResetCamera,
  onOpenAnalytics,
  onOpenLeaderboard,
  onToggleLanguage,
  onOpenHints,
  onRotateRing,
  onToggleNode,
  onSelectOption
}) => {
  const t = (k: string) => translate(k, language);

  // Time formatted string
  const remainingTime = Math.max(0, timeAttackLimit - puzzleState.elapsedSeconds);
  const secondsToShow = isTimeAttack ? remainingTime : puzzleState.elapsedSeconds;
  const mins = Math.floor(secondsToShow / 60);
  const secs = secondsToShow % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = isTimeAttack && remainingTime <= 10;

  return (
    <div
      id="ui-hud"
      className="interactive"
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Top Section */}
      <div
        className="hud-top-section interactive"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(6, 9, 19, 0.95) 0%, rgba(6, 9, 19, 0.75) 60%, rgba(6, 9, 19, 0) 100%)',
          paddingBottom: '8px'
        }}
      >
        <div className="hud-header" style={{ width: '100%', background: 'transparent', paddingBottom: '4px' }}>
          <div className="hud-left">
            <button className="hud-btn" onClick={onPause} aria-label={t('pause_btn')}>
              ⏸
            </button>
            <button className="hud-btn" onClick={onResetCamera} aria-label={t('reset_cam_btn')}>
              🎯
            </button>
            <button className="hud-btn violet" onClick={onOpenAnalytics} aria-label={t('intelligence_chart_btn')}>
              📊
            </button>
          </div>

          <div className="hud-center">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span className="level-badge">{t('env_' + level.environment)}</span>
              {isTimeAttack && (
                <span className="hud-time-attack-badge">{t('time_attack_badge')}</span>
              )}
            </div>
            <div className="level-title-display">{level.title[language] || level.title.en}</div>
          </div>

          <div className="hud-right">
            <button className="hud-btn gold" onClick={onOpenLeaderboard} aria-label={t('leaderboard_btn')}>
              🏆
            </button>
            <button className="hud-btn" onClick={onToggleLanguage} aria-label="Language">
              🌐
            </button>
            <button className="hud-btn gold" onClick={onOpenHints} aria-label={t('hint_btn')}>
              💡
            </button>
          </div>
        </div>

        {/* Stats Pill */}
        <div className="hud-stats" style={{ marginTop: '4px' }}>
          <div className={`stat-item ${isUrgent ? 'hud-timer urgent' : ''}`}>
            <span>{isTimeAttack ? t('time_remaining') : t('time_label')}</span>: <strong>{timeFormatted}</strong>
          </div>
          <div className="stat-item">
            <span>{t('moves_label')}</span>: <strong>{puzzleState.moves}</strong>
          </div>
          <div className="stat-item">
            <span>{t('stars_label')}</span>: <strong style={{ color: 'var(--accent-gold)' }}>{totalStars}/45</strong>
          </div>
        </div>
      </div>

      {/* Footer & Interactive Controls */}
      <div className="hud-footer interactive">
        <div className="camera-hint">
          <span>👆</span> <span>{t('touch_tip')}</span>
        </div>

        <div className="objective-banner">
          <div className="objective-label">{t('objective_label')}</div>
          <div className="objective-text">{level.objective[language] || level.objective.en}</div>
        </div>

        {/* Puzzle interactive controls container (Dials / Choices / Switches) */}
        <div className="puzzle-control-panel">
          {/* Ring Dials */}
          {(level.type === 'rotation' || level.type === 'grand_puzzle') && level.rings && (
            <div className="puzzle-dial-group">
              {level.rings.map(ring => {
                const angle = puzzleState.angles[ring.id] ?? 0;
                return (
                  <button
                    key={ring.id}
                    className="hud-btn"
                    onClick={() => onRotateRing(ring.id)}
                  >
                    <span>⟳</span>{' '}
                    <strong>
                      {ring.label[language] || ring.label.en}: {angle}°
                    </strong>
                  </button>
                );
              })}
            </div>
          )}

          {/* Switch Network */}
          {level.type === 'switch_network' && (
            <div className="puzzle-options-row">
              {Array.from({ length: level.nodeCount || 3 }).map((_, idx) => {
                const isActive = puzzleState.nodes[idx];
                return (
                  <button
                    key={idx}
                    className={`puzzle-option-btn ${isActive ? 'selected' : ''}`}
                    onClick={() => onToggleNode(idx)}
                  >
                    Node {idx + 1} {isActive ? '⚡' : '○'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sequence, Pattern, Logic Deduction Questions & Options */}
          {(level.type === 'sequence' ||
            level.type === 'pattern' ||
            level.type === 'logic_deduction' ||
            level.type === 'grand_puzzle') && (
            <>
              {level.question && (
                <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px', textAlign: 'center' }}>
                  {level.question}
                </div>
              )}
              {level.gridDescription && (
                <pre
                  style={{
                    fontSize: '12px',
                    color: 'var(--accent-cyan)',
                    whiteSpace: 'pre-line',
                    fontFamily: 'inherit',
                    marginBottom: '4px',
                    textAlign: 'center'
                  }}
                >
                  {level.gridDescription}
                </pre>
              )}
              {level.clues && (
                <div style={{ fontSize: '12px', textAlign: 'start', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  {level.clues.map((clue, i) => (
                    <div key={i}>• {clue[language] || clue.en}</div>
                  ))}
                </div>
              )}

              {level.options && (
                <div className="puzzle-options-row">
                  {level.options.map(opt => {
                    const isSelected = puzzleState.selectedOption === opt;
                    return (
                      <button
                        key={opt}
                        className={`puzzle-option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelectOption(opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
