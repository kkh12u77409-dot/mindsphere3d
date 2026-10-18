import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface PauseModalProps {
  language: SupportedLanguage;
  onResume: () => void;
  onOpenAnalytics: () => void;
  onRestartLevel: () => void;
  onExitToMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  language,
  onResume,
  onOpenAnalytics,
  onRestartLevel,
  onExitToMenu
}) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="modal-pause" className="screen-overlay modal active">
      <div className="modal-card" style={{ maxWidth: '320px' }}>
        <h2 className="modal-title">{t('pause_btn')}</h2>

        <div className="menu-actions">
          <button className="btn-primary" onClick={onResume}>
            {t('resume_btn')}
          </button>
          <button className="btn-secondary" onClick={onOpenAnalytics}>
            <span>📊</span> <span>{t('intelligence_chart_btn')}</span>
          </button>
          <button className="btn-secondary" onClick={onRestartLevel}>
            {t('restart_level_btn')}
          </button>
          <button className="btn-secondary" onClick={onExitToMenu}>
            {t('exit_menu_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};
