import React from 'react';
import { LevelDefinition } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface HintsModalProps {
  level: LevelDefinition;
  unlockedHints: number;
  language: SupportedLanguage;
  onUnlockHint: (tier: number) => void;
  onClose: () => void;
}

export const HintsModal: React.FC<HintsModalProps> = ({
  level,
  unlockedHints,
  language,
  onUnlockHint,
  onClose
}) => {
  const t = (k: string) => translate(k, language);

  const tiers = [
    { id: 1, name: t('hint_tier_1'), text: level.hints.tier1[language] || level.hints.tier1.en },
    { id: 2, name: t('hint_tier_2'), text: level.hints.tier2[language] || level.hints.tier2.en },
    { id: 3, name: t('hint_tier_3'), text: level.hints.tier3[language] || level.hints.tier3.en }
  ];

  return (
    <div id="modal-hints" className="screen-overlay modal active">
      <div className="modal-card">
        <h2 className="modal-title">{t('hints_title')}</h2>
        <p className="modal-desc">{t('hint_penalty_notice')}</p>

        <div className="hints-list">
          {tiers.map(tier => {
            const isUnlocked = unlockedHints >= tier.id;
            return (
              <div key={tier.id} className={`hint-tier ${isUnlocked ? 'unlocked' : ''}`}>
                <div className="hint-tier-header">
                  <span>{tier.name}</span>
                  {isUnlocked ? (
                    <span>✓</span>
                  ) : (
                    <button
                      className="hud-btn gold"
                      onClick={() => onUnlockHint(tier.id)}
                      style={{ padding: '4px 8px', fontSize: '11px', minHeight: 'unset', minWidth: 'unset' }}
                    >
                      {t('unlock_hint_btn')}
                    </button>
                  )}
                </div>
                <div className="hint-tier-content">
                  {isUnlocked ? (
                    tier.text
                  ) : (
                    <span style={{ opacity: 0.4 }}>•••••••••••••••••••••••••••••</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-secondary" onClick={onClose}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
