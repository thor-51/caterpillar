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
  const height = 115;
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

  // 300 bar hydraulic pressure relief valve threshold line
  const reliefY = padding.top + plotH - ((300 - minP) / (maxP - minP)) * plotH;

  return (
    <div style={{
      width: '100%',
      background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 210, 211, 0.04), transparent 70%), linear-gradient(180deg, #131822 0%, #0c1017 100%)',
      border: '1px solid var(--cat-border)',
      borderRadius: '8px',
      padding: '12px 16px',
      position: 'relative',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
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
          <strong style={{ color: 'var(--cat-text-main)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Dual-Channel Oscilloscope Reticle
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-radar)', boxShadow: '0 0 6px var(--cat-radar)' }} />
            <span style={{ color: 'var(--cat-radar)', fontWeight: 700 }}>Pressure: {currentPressure.toFixed(0)} bar</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cat-gold)', boxShadow: '0 0 6px var(--cat-gold)' }} />
            <span style={{ color: 'var(--cat-gold)', fontWeight: 700 }}>Boom: {currentBoomAngle.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          {/* CRT Scanline Grid Pattern */}
          <pattern id="scopeGrid" width="24" height="20" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 20" fill="none" stroke="rgba(36, 46, 63, 0.3)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Cathode Grid Matrix */}
        <rect x={padding.left} y={padding.top} width={plotW} height={plotH} fill="url(#scopeGrid)" />

        {/* 300 Bar Pressure Relief Valve Limit Warning Line */}
        <line
          x1={padding.left}
          y1={reliefY}
          x2={width - padding.right}
          y2={reliefY}
          stroke="var(--cat-hazard)"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        <text x={width - padding.right - 2} y={reliefY - 3} fill="var(--cat-hazard)" fontSize="7" textAnchor="end" fontFamily="var(--font-mono)">
          RELIEF THRESHOLD (300b)
        </text>

        {/* Oscilloscope Horizontal Gridlines */}
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
          strokeWidth="2.2"
          style={{ filter: 'drop-shadow(0 0 5px var(--cat-radar))' }}
        />

        {/* Boom Angle Area & Line */}
        <path
          d={boomPath}
          fill="none"
          stroke="var(--cat-gold)"
          strokeWidth="2.2"
          style={{ filter: 'drop-shadow(0 0 5px var(--cat-gold))' }}
        />

        {/* Live Sweeping Leading Edge Reticles */}
        <circle cx={lastX} cy={lastPressureY} r="4" fill="var(--cat-radar)" style={{ filter: 'drop-shadow(0 0 8px var(--cat-radar))' }} />
        <circle cx={lastX} cy={lastBoomY} r="4" fill="var(--cat-gold)" style={{ filter: 'drop-shadow(0 0 8px var(--cat-gold))' }} />
      </svg>
    </div>
  );
};
