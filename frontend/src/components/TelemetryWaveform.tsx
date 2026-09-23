import React from 'react';

interface TelemetryPoint {
  time: number;
  pressure: number; // bar
  boomAngle: number; // deg
}

interface WaveformProps {
  history: TelemetryPoint[];
  currentPressure: number;
  currentBoomAngle: number;
}

export const TelemetryWaveform: React.FC<WaveformProps> = ({
  history,
  currentPressure,
  currentBoomAngle
}) => {
  const width = 420;
  const height = 110;
  const padding = { top: 12, right: 12, bottom: 20, left: 35 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Pressure range: 120 - 340 bar
  const minP = 120;
  const maxP = 340;
  // Boom range: 15 - 65 deg
  const minB = 15;
  const maxB = 65;

  const points = history.length > 0 ? history : [
    { time: 0, pressure: currentPressure, boomAngle: currentBoomAngle }
  ];

  // SVG path for pressure
  const pressurePath = points.map((p, idx) => {
    const x = padding.left + (idx / Math.max(1, points.length - 1)) * plotW;
    const y = padding.top + plotH - ((Math.min(maxP, Math.max(minP, p.pressure)) - minP) / (maxP - minP)) * plotH;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // SVG path for boom angle
  const boomPath = points.map((p, idx) => {
    const x = padding.left + (idx / Math.max(1, points.length - 1)) * plotW;
    const y = padding.top + plotH - ((Math.min(maxB, Math.max(minB, p.boomAngle)) - minB) / (maxB - minB)) * plotH;
    return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const lastX = padding.left + plotW;
  const lastPressureY = padding.top + plotH - ((Math.min(maxP, Math.max(minP, currentPressure)) - minP) / (maxP - minP)) * plotH;
  const lastBoomY = padding.top + plotH - ((Math.min(maxB, Math.max(minB, currentBoomAngle)) - minB) / (maxB - minB)) * plotH;

  return (
    <div style={{
      width: '100%',
      background: 'rgba(11, 15, 22, 0.95)',
      border: '1px solid var(--cat-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      position: 'relative'
    }}>
      {/* Waveform Header & Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
        fontSize: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-indicator" />
          <strong style={{ color: 'var(--cat-text-main)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Multi-Channel Telemetry Oscilloscope
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-radar)' }} />
            <span style={{ color: 'var(--cat-radar)' }}>Press: {currentPressure.toFixed(0)} bar</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-gold)' }} />
            <span style={{ color: 'var(--cat-gold)' }}>Boom: {currentBoomAngle.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="pressureGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--cat-radar)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--cat-radar)" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient id="boomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--cat-gold)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--cat-gold)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Oscilloscope Gridlines */}
        <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="rgba(36, 46, 63, 0.5)" strokeDasharray="3 3" />
        <line x1={padding.left} y1={padding.top + plotH * 0.5} x2={width - padding.right} y2={padding.top + plotH * 0.5} stroke="rgba(36, 46, 63, 0.5)" strokeDasharray="3 3" />
        <line x1={padding.left} y1={padding.top + plotH} x2={width - padding.right} y2={padding.top + plotH} stroke="rgba(36, 46, 63, 0.8)" />

        {/* Y-Axis Labels */}
        <text x={padding.left - 6} y={padding.top + 4} fill="var(--cat-text-dim)" fontSize="8" textAnchor="end" fontFamily="var(--font-mono)">340b</text>
        <text x={padding.left - 6} y={padding.top + plotH * 0.5 + 3} fill="var(--cat-text-dim)" fontSize="8" textAnchor="end" fontFamily="var(--font-mono)">230b</text>
        <text x={padding.left - 6} y={padding.top + plotH} fill="var(--cat-text-dim)" fontSize="8" textAnchor="end" fontFamily="var(--font-mono)">120b</text>

        {/* Pressure Area & Line */}
        <path
          d={pressurePath}
          fill="none"
          stroke="var(--cat-radar)"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 4px var(--cat-radar-glow))' }}
        />

        {/* Boom Angle Area & Line */}
        <path
          d={boomPath}
          fill="none"
          stroke="var(--cat-gold)"
          strokeWidth="2"
          style={{ filter: 'drop-shadow(0 0 4px var(--cat-gold-glow))' }}
        />

        {/* Live Sweeping Leading Edge Dot */}
        <circle cx={lastX} cy={lastPressureY} r="3.5" fill="var(--cat-radar)" style={{ filter: 'drop-shadow(0 0 6px var(--cat-radar))' }} />
        <circle cx={lastX} cy={lastBoomY} r="3.5" fill="var(--cat-gold)" style={{ filter: 'drop-shadow(0 0 6px var(--cat-gold))' }} />
      </svg>
    </div>
  );
};
