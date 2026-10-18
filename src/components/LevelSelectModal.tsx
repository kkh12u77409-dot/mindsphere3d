import React, { useState } from 'react';
import { LevelDefinition, SaveData } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface LevelSelectModalProps {
  levels: LevelDefinition[];
  saveData: SaveData;
  currentLevelId: number;
  language: SupportedLanguage;
  onSelectLevel: (levelId: number) => void;
  onPlayGhost?: (levelId: number) => void;
  onToggleTimeAttack: () => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levels,
  saveData,
  currentLevelId,
  language,
  onSelectLevel,
  onPlayGhost,
  onToggleTimeAttack,
  onBack
}) => {
  const [filter, setFilter] = useState<string>('all');
  const t = (k: string) => translate(k, language);

  const filteredLevels = levels.filter(lvl => filter === 'all' || lvl.environment === filter);

  return (
    <div id="screen-level-select" className="screen-overlay active">
      <div className="modal-card level-select-container">
        <h2 className="modal-title">{t('level_select_btn')}</h2>

        {/* Time Attack Mode Toggle Card */}
        <div className="mode-toggle-card">
          <div className="mode-toggle-info">
            <div className="mode-toggle-title">
              <span>⚡</span> <span>{t('time_attack_toggle')}</span>
            </div>
            <div className="mode-toggle-desc">{t('time_attack_desc')}</div>
          </div>
          <button
            className={`toggle-btn ${saveData.timeAttackEnabled ? 'on' : ''}`}
            onClick={onToggleTimeAttack}
          >
            {saveData.timeAttackEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Environment Tabs */}
        <div className="env-tabs">
          <button
            className={`env-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('env_all')}
          </button>
          <button
            className={`env-tab ${filter === 'neon' ? 'active' : ''}`}
            onClick={() => setFilter('neon')}
          >
            {t('env_neon')}
          </button>
          <button
            className={`env-tab ${filter === 'crystal' ? 'active' : ''}`}
            onClick={() => setFilter('crystal')}
          >
            {t('env_crystal')}
          </button>
          <button
            className={`env-tab ${filter === 'quantum' ? 'active' : ''}`}
            onClick={() => setFilter('quantum')}
          >
            {t('env_quantum')}
          </button>
        </div>

        {/* 15 Levels Grid */}
        <div className="levels-grid">
          {filteredLevels.map(lvl => {
            const isUnlocked = lvl.id === 1 || saveData.highestUnlocked >= lvl.id;
            const isCurrent = currentLevelId === lvl.id;
            const completed = saveData.completedLevels[lvl.id];
            const stars = completed ? completed.stars : 0;

            const timeRecord = saveData.timeAttackRecords ? saveData.timeAttackRecords[lvl.id] : undefined;
            const maxTime = lvl.starCriteria?.maxTime || 45;

            return (
              <div
                key={lvl.id}
                className={`level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}
                style={
                  saveData.timeAttackEnabled && isUnlocked
                    ? { borderColor: isCurrent ? 'var(--accent-gold)' : 'rgba(255, 183, 3, 0.4)' }
                    : {}
                }
                onClick={() => {
                  if (isUnlocked) onSelectLevel(lvl.id);
                }}
              >
                <span className="level-card-num">{lvl.id}</span>
                <div className="level-card-stars">
                  {stars > 0 ? '★'.repeat(stars) : isUnlocked ? '○' : '🔒'}
                </div>
                {timeRecord && (
                  <div style={{ fontSize: '9px', color: 'var(--accent-gold)', fontWeight: 800 }}>
                    ⚡ {timeRecord.bestTime}s
                  </div>
                )}
                {saveData.timeAttackEnabled && !timeRecord && isUnlocked && (
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', opacity: 0.8 }}>
                    ⏱ {maxTime}s
                  </div>
                )}
                {completed && onPlayGhost && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onPlayGhost(lvl.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(157, 78, 221, 0.3)',
                      border: '1px solid var(--accent-violet)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      cursor: 'pointer',
                      color: '#fff',
                      padding: 0,
                      boxShadow: '0 0 6px var(--accent-violet)'
                    }}
                    title={t('ghost_replay_btn')}
                  >
                    👻
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button className="btn-secondary" onClick={onBack}>
          {t('exit_menu_btn')}
        </button>
      </div>
    </div>
  );
};
