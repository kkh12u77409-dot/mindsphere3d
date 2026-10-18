import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { HistoryRecord } from '../types/game';
import { SupportedLanguage, translate } from '../services/i18n';

interface AnalyticsModalProps {
  data: HistoryRecord[];
  language: SupportedLanguage;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ data, language, onClose }) => {
  const t = (k: string) => translate(k, language);
  const isRtl = language === 'ar';

  const scores = data.map(d => d.score);
  const peak = scores.length > 0 ? Math.max(...scores) : 0;
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const formattedData = data.map((d, index) => ({
    name: isRtl ? `غرفة ${d.level}` : `Lvl ${d.level}`,
    score: d.score,
    time: `${d.time || 0}s`,
    moves: d.moves || 0,
    index: index + 1
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { score: number; time: string; moves: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(14, 21, 38, 0.95)',
            border: '1px solid #00f2fe',
            borderRadius: '10px',
            padding: '8px 12px',
            boxShadow: '0 0 16px rgba(0, 242, 254, 0.4)',
            color: '#fff',
            fontSize: '12px',
            textAlign: isRtl ? 'right' : 'left',
            direction: isRtl ? 'rtl' : 'ltr'
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#00f2fe', marginBottom: '4px' }}>{label}</div>
          <div>
            {isRtl ? 'نقاط الذكاء' : 'Intelligence Points'}:{' '}
            <strong style={{ color: '#ffb703' }}>{item.score}</strong>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
            {isRtl ? 'الزمن' : 'Time'}: {item.time} • {isRtl ? 'الحركات' : 'Actions'}: {item.moves}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="modal-intelligence-chart" className="screen-overlay modal active">
      <div className="modal-card" style={{ maxWidth: '480px' }}>
        <h2 className="modal-title">{t('intelligence_chart_title')}</h2>
        <p className="modal-desc">{t('intelligence_chart_sub')}</p>

        {/* KPI summary statistics */}
        <div className="stats-summary" style={{ gridTemplateColumns: '1fr 1fr 1fr', margin: '6px 0 12px 0' }}>
          <div className="summary-card">
            <div className="val" style={{ color: 'var(--accent-gold)' }}>
              {peak}
            </div>
            <div className="lbl">{t('peak_score_label')}</div>
          </div>
          <div className="summary-card">
            <div className="val" style={{ color: 'var(--accent-cyan)' }}>
              {avg}
            </div>
            <div className="lbl">{t('avg_score_label')}</div>
          </div>
          <div className="summary-card">
            <div className="val" style={{ color: 'var(--accent-violet)' }}>
              {data.length}/10
            </div>
            <div className="lbl">{t('chambers_analyzed_label')}</div>
          </div>
        </div>

        {/* Recharts Data Visualization mount container */}
        <div
          style={{
            width: '100%',
            height: '240px',
            background: 'rgba(6, 9, 19, 0.6)',
            borderRadius: '14px',
            border: '1px solid var(--border-glow)',
            boxShadow: 'var(--glow-cyan)',
            padding: '8px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="intelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#9d4edd" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.15)' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00f2fe"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#intelGrad)"
                activeDot={{ r: 6, fill: '#ffb703', stroke: '#fff', strokeWidth: 2 }}
                dot={{ r: 3.5, fill: '#00f2fe', stroke: '#060913', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <button className="btn-secondary" onClick={onClose} style={{ marginTop: '12px' }}>
          {t('close_btn')}
        </button>
      </div>
    </div>
  );
};
