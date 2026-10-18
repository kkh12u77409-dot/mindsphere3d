import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface MainMenuProps {
  hasProgress: boolean;
  timeAttackEnabled: boolean;
  language: SupportedLanguage;
  onPlay: () => void;
  onContinue: () => void;
  onLevelSelect: () => void;
  onOpenAnalytics: () => void;
  onOpenLeaderboard: () => void;
  onOpenManual: () => void;
  onOpenSettings: () => void;
  onToggleTimeAttack: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  hasProgress,
  timeAttackEnabled,
  language,
  onPlay,
  onContinue,
  onLevelSelect,
  onOpenAnalytics,
  onOpenLeaderboard,
  onOpenManual,
  onOpenSettings,
  onToggleTimeAttack
}) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="screen-main-menu" className="screen-overlay active">
      <div className="modal-card main-menu-card">
        <div className="game-logo">
          <div className="logo-sphere">🔮</div>
          <h1 className="logo-title">{t('app_title')}</h1>
          <div className="logo-subtitle">{t('app_subtitle')}</div>
        </div>

        {/* Optional Time Attack Mode Toggle Card */}
        <div
          className="mode-toggle-card"
          style={{
            margin: '4px 0 8px 0',
            borderColor: timeAttackEnabled ? 'var(--accent-gold)' : 'var(--border-subtle)',
            boxShadow: timeAttackEnabled ? 'var(--glow-gold)' : 'none'
          }}
        >
          <div className="mode-toggle-info">
            <div className="mode-toggle-title">
              <span>⚡</span> <span>{t('time_attack_toggle')}</span>
            </div>
            <div className="mode-toggle-desc">{t('time_attack_desc')}</div>
          </div>
          <button
            className={`toggle-btn ${timeAttackEnabled ? 'on' : ''}`}
            onClick={onToggleTimeAttack}
            style={
              timeAttackEnabled
                ? { background: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: '#060913' }
                : {}
            }
          >
            {timeAttackEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="menu-actions">
          {hasProgress && (
            <button className="btn-primary" onClick={onContinue}>
              <span>▶</span>{' '}
              <span>
                {t('continue_btn')} {timeAttackEnabled && '(⚡)'}
              </span>
            </button>
          )}
          <button
            className="btn-primary"
            onClick={onPlay}
            style={
              timeAttackEnabled
                ? {
                    background: 'linear-gradient(135deg, #ffb703 0%, #fb8500 100%)',
                    boxShadow: '0 4px 18px rgba(255, 183, 3, 0.45)'
                  }
                : {}
            }
          >
            <span>{timeAttackEnabled ? '⚡' : '🚀'}</span>{' '}
            <span>
              {timeAttackEnabled ? t('time_attack_launch') : t('play_btn')}
            </span>
          </button>
          <button className="btn-secondary" onClick={onLevelSelect}>
            <span>💠</span> <span>{t('level_select_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onOpenAnalytics}>
            <span>📊</span> <span>{t('intelligence_chart_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onOpenLeaderboard}>
            <span>🏆</span> <span>{t('leaderboard_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onOpenManual}>
            <span>📖</span> <span>{t('how_to_play_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onOpenSettings}>
            <span>⚙️</span> <span>{t('settings_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
