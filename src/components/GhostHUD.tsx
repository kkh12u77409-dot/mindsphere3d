import React from 'react';
import { LevelDefinition, GhostRecording } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface GhostHUDProps {
  level: LevelDefinition;
  recording: GhostRecording;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  lastExecutedMove: string | null;
  language: SupportedLanguage;
  onTogglePlay: () => void;
  onSetSpeed: (speed: number) => void;
  onRestart: () => void;
  onExit: () => void;
}

export const GhostHUD: React.FC<GhostHUDProps> = ({
  level,
  recording,
  currentTime,
  isPlaying,
  playbackSpeed,
  lastExecutedMove,
  language,
  onTogglePlay,
  onSetSpeed,
  onRestart,
  onExit
}) => {
  const t = (k: string) => translate(k, language);

  const totalTime = Math.max(1, recording.totalTime);
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalTime) * 100));

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="ui-ghost-hud"
      className="interactive"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {/* Top Banner */}
      <div
        className="interactive"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(6, 9, 19, 0.95) 0%, rgba(14, 21, 38, 0.75) 60%, rgba(6, 9, 19, 0) 100%)',
          padding: 'calc(var(--safe-top) + 12px) 16px 12px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 12px',
                borderRadius: '16px',
                background: 'rgba(157, 78, 221, 0.25)',
                border: '1px solid var(--accent-violet)',
                color: 'var(--accent-violet)',
                fontWeight: 800,
                fontSize: '12px',
                letterSpacing: '0.8px',
                boxShadow: 'var(--glow-violet)'
              }}
            >
              {t('ghost_badge')}
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', textShadow: '0 0 10px var(--accent-cyan)' }}>
              {level.title[language] || level.title.en}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>
              {t('ghost_moves_label')}: {recording.movesCount} • {t('time_label')}: {recording.totalTime}s
            </div>
          </div>

          <button
            className="hud-btn"
            onClick={onExit}
            style={{
              borderColor: 'var(--accent-red)',
              color: 'var(--accent-red)',
              padding: '6px 12px',
              minHeight: '36px',
              minWidth: '36px'
            }}
          >
            ✕ {t('ghost_exit')}
          </button>
        </div>

        {/* Live executed move notification overlay */}
        {lastExecutedMove && (
          <div
            style={{
              marginTop: '8px',
              padding: '4px 16px',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: '20px',
              color: 'var(--accent-cyan)',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: 'var(--glow-cyan)',
              animation: 'modalPop 0.2s ease'
            }}
          >
            ⚡ {lastExecutedMove}
          </div>
        )}
      </div>

      {/* Bottom Timeline & Controls */}
      <div
        className="interactive"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px calc(var(--safe-bottom) + 16px) 16px',
          background: 'linear-gradient(0deg, rgba(6, 9, 19, 0.95) 0%, rgba(6, 9, 19, 0) 100%)'
        }}
      >
        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-glow)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6), var(--glow-violet)',
            borderRadius: '16px',
            padding: '12px 18px',
            maxWidth: '460px',
            width: '92%',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Progress Timeline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{formatSecs(currentTime)}</span>
              <span>{formatSecs(totalTime)}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-violet) 100%)',
                  boxShadow: '0 0 10px var(--accent-cyan)',
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn-primary"
                onClick={onTogglePlay}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  minHeight: '38px',
                  background: isPlaying
                    ? 'linear-gradient(135deg, #9d4edd 0%, #7928ca 100%)'
                    : 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)'
                }}
              >
                {isPlaying ? `⏸ ${t('ghost_pause')}` : `▶ ${t('ghost_play')}`}
              </button>

              <button
                className="btn-secondary"
                onClick={onRestart}
                style={{ padding: '8px 12px', fontSize: '13px', minHeight: '38px' }}
                title="Restart Replay"
              >
                ⟲
              </button>
            </div>

            {/* Speed Options */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => onSetSpeed(speed)}
                  className={`toggle-btn ${playbackSpeed === speed ? 'on' : ''}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    minWidth: '38px',
                    background: playbackSpeed === speed ? 'var(--accent-violet)' : undefined,
                    borderColor: playbackSpeed === speed ? 'var(--accent-violet)' : undefined,
                    color: playbackSpeed === speed ? '#fff' : undefined
                  }}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
