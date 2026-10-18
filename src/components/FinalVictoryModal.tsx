import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface FinalVictoryModalProps {
  totalScore: number;
  language: SupportedLanguage;
  onReturnToMenu: () => void;
}

export const FinalVictoryModal: React.FC<FinalVictoryModalProps> = ({
  totalScore,
  language,
  onReturnToMenu
}) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="modal-final-victory" className="screen-overlay modal active">
      <div className="modal-card">
        <div style={{ fontSize: '54px', marginBottom: '8px' }}>👑</div>
        <h2 className="modal-title">{t('final_victory_title')}</h2>
        <p className="modal-desc">{t('final_victory_sub')}</p>

        <div className="summary-card" style={{ margin: '12px 0' }}>
          <div className="val" style={{ color: 'var(--accent-gold)', fontSize: '28px' }}>
            {totalScore}
          </div>
          <div className="lbl">{t('final_score')}</div>
        </div>

        <button className="btn-primary" onClick={onReturnToMenu}>
          {t('exit_menu_btn')}
        </button>
      </div>
    </div>
  );
};
