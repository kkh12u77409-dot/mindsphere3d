import React from 'react';
import { SupportedLanguage, translate } from '../services/i18n';

interface ManualModalProps {
  language: SupportedLanguage;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ language, onClose }) => {
  const t = (k: string) => translate(k, language);

  return (
    <div id="modal-manual" className="screen-overlay modal active">
      <div className="modal-card">
        <h2 className="modal-title">{t('manual_title')}</h2>
        <div className="modal-desc" style={{ textAlign: 'start', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p>{t('manual_p1')}</p>
          <p>{t('manual_p2')}</p>
          <p>{t('manual_p3')}</p>
          <p>{t('manual_p4')}</p>
        </div>
        <button className="btn-secondary" onClick={onClose}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
