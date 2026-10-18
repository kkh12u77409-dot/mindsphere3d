import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface VictoryModalProps {
  stars: number;
  timeSeconds: number;
  moves: number;
  score: number;
  bonusPoints?: number;
  baseScore?: number;
  leaderboardRank?: number | null;
  isTimeAttack?: boolean;
  language: SupportedLanguage;
  onNextLevel: () => void;
  onReplay: () => void;
  onPlayGhost?: () => void;
  onOpenAnalytics: () => void;
  onOpenLeaderboard: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stars,
  timeSeconds,
  moves,
  score,
  bonusPoints = 0,
  baseScore = 0,
  leaderboardRank = null,
  isTimeAttack = false,
  language,
  onNextLevel,
  onReplay,
  onPlayGhost,
  onOpenAnalytics,
  onOpenLeaderboard
}) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="modal-victory" className="screen-overlay modal active">
      <div className="modal-card">
        <h2 className="modal-title">{t('victory_title')}</h2>
        <div className="modal-desc">{t('victory_sub')}</div>

        {/* Stars */}
        <div className="victory-stars">
          {[1, 2, 3].map(i => (
            <span key={i} className={`star-icon ${i <= stars ? 'filled' : ''}`}>
              ★
            </span>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="summary-card">
            <div className="val">{timeSeconds}s</div>
            <div className="lbl">{t('victory_time')}</div>
          </div>
          <div className="summary-card">
            <div className="val">{moves}</div>
            <div className="lbl">{t('victory_moves')}</div>
          </div>
        </div>

        {/* Time Attack Bonus Banner */}
        {isTimeAttack && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(255, 183, 3, 0.2) 0%, rgba(251, 133, 0, 0.1) 100%)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '14px',
              padding: '10px 14px',
              marginBottom: '10px',
              textAlign: 'center',
              boxShadow: 'var(--glow-gold)'
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.5px' }}>
              {t('time_attack_bonus_notice')}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '8px 0 4px 0', fontSize: '12px' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-dim)' }}>{t('base_score')}: </span>
                <strong style={{ color: '#fff' }}>{baseScore || Math.round(score / 1.5 - bonusPoints)}</strong>
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--text-dim)' }}>{t('speed_bonus')}: </span>
                <strong style={{ color: 'var(--accent-gold)' }}>+{bonusPoints}</strong>
              </div>
            </div>

            {leaderboardRank && (
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '6px' }}>
                🏆 {t('new_rank_congrats')} #{leaderboardRank}
              </div>
            )}
          </div>
        )}

        <div className="summary-card" style={{ marginBottom: '8px' }}>
          <div className="val" style={{ color: 'var(--accent-gold)', fontSize: '24px' }}>
            {score}
          </div>
          <div className="lbl">{t('victory_score')}</div>
        </div>

        <div className="menu-actions">
          <button className="btn-primary" onClick={onNextLevel}>
            {t('next_level_btn')} ➔
          </button>
          <button className="btn-secondary" onClick={onOpenAnalytics}>
            <span>📊</span> <span>{t('intelligence_chart_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onOpenLeaderboard}>
            <span>🏆</span> <span>{t('leaderboard_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onReplay}>
            {t('replay_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
