import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface SettingsModalProps {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  language: SupportedLanguage;
  onToggleSFX: () => void;
  onToggleMusic: () => void;
  onToggleLanguage: () => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sfxEnabled,
  musicEnabled,
  language,
  onToggleSFX,
  onToggleMusic,
  onToggleLanguage,
  onResetProgress,
  onClose
}) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="modal-settings" className="screen-overlay modal active">
      <div className="modal-card">
        <h2 className="modal-title">{t('settings_title')}</h2>

        <div className="settings-list">
          <div className="setting-row">
            <span className="setting-label">{t('sound_fx')}</span>
            <button className={`toggle-btn ${sfxEnabled ? 'on' : ''}`} onClick={onToggleSFX}>
              {sfxEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-row">
            <span className="setting-label">{t('music_vol')}</span>
            <button className={`toggle-btn ${musicEnabled ? 'on' : ''}`} onClick={onToggleMusic}>
              {musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="setting-row">
            <span className="setting-label">{t('language_select')}</span>
            <button className="toggle-btn" onClick={onToggleLanguage}>
              {language === 'ar' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>

        <button className="btn-danger" onClick={onResetProgress}>
          {t('reset_btn')}
        </button>
        <button className="btn-secondary" onClick={onClose}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
