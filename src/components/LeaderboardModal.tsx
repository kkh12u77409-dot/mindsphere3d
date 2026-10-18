import React, { useState } from 'react';
import { LeaderboardEntry } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  language: SupportedLanguage;
  onClose: () => void;
  onUpdatePlayerName?: (name: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  language,
  onClose,
  onUpdatePlayerName
}) => {
  const [tab, setTab] = useState<'timeAttack' | 'all'>('timeAttack');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>('');

  const t = (k: string) => translate(k, language);
  const player = entries.find(e => e.isPlayer);

  // Time attack sorted by fastest time and highest bonus score
  const displayEntries = [...entries].sort((a, b) => {
    if (tab === 'timeAttack') {
      return b.score - a.score;
    }
    return b.score - a.score;
  });

  const handleSaveName = () => {
    if (tempName.trim() && onUpdatePlayerName) {
      onUpdatePlayerName(tempName.trim());
    }
    setEditingName(false);
  };

  return (
    <div id="modal-leaderboard" className="screen-overlay modal active">
      <div className="modal-card" style={{ maxWidth: '440px' }}>
        <h2 className="modal-title">{t('leaderboard_title')}</h2>
        <p className="modal-desc">{t('leaderboard_sub')}</p>

        {/* Tab switch */}
        <div className="env-tabs" style={{ justifyContent: 'center' }}>
          <button
            className={`env-tab ${tab === 'timeAttack' ? 'active' : ''}`}
            onClick={() => setTab('timeAttack')}
          >
            {t('leaderboard_filter_time_attack')}
          </button>
          <button
            className={`env-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            {t('leaderboard_filter_all')}
          </button>
        </div>

        {/* Player's Quick Standing Banner */}
        <div
          style={{
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid var(--accent-cyan)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ textAlign: 'start' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{t('rank_label')}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {player ? `#${player.rank}` : '#--'}
            </div>
            {editingName ? (
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <input
                  type="text"
                  value={tempName}
                  onChange={e => setTempName(e.target.value)}
                  placeholder={player?.name || t('player_you')}
                  style={{
                    background: 'rgba(6, 9, 19, 0.8)',
                    border: '1px solid var(--accent-cyan)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    width: '100px'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  style={{
                    background: 'var(--accent-cyan)',
                    color: '#060913',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ✓
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempName(player?.name || '');
                  setEditingName(true);
                }}
                style={{ fontSize: '11px', color: 'var(--accent-gold)', cursor: 'pointer', marginTop: '2px' }}
                title="Click to customize callsign"
              >
                ✏️ {player?.name || t('player_you')}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'end' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{t('victory_score')}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {player ? player.score : 0}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--accent-blue)', marginTop: '2px' }}>
              ⏱ {player?.time || '--:--'}
            </div>
          </div>
        </div>

        {/* Leaderboard entries list */}
        <div className="leaderboard-list">
          {displayEntries.map(item => (
            <div
              key={item.rank}
              className={`leaderboard-row ${item.isPlayer ? 'player-row' : ''} ${item.rank <= 3 ? `top-${item.rank}` : ''}`}
            >
              <div className="rank-badge">{item.rank}</div>
              <div className="leader-meta">
                <span style={{ fontSize: '16px' }}>{item.flag}</span>
                <span className="leader-name">
                  {item.isPlayer ? `${item.name} (${t('player_you')})` : item.name}
                </span>
              </div>
              <div style={{ textAlign: 'end' }}>
                <div className="leader-score">{item.score}</div>
                <div className="leader-time">⚡ {item.time}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={onClose} style={{ marginTop: '10px' }}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
