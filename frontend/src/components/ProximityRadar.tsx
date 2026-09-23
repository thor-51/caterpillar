import React from 'react';
import { ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';
import { ProximityHazard } from '../services/api';

interface ProximityRadarProps {
  hazards: ProximityHazard[];
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({ hazards }) => {
  const size = 180;
  const center = size / 2;
  const radius = size * 0.42;

  // Converts polar coordinates (distance, azimuth) to SVG (x, y)
  // Max distance 10 meters maps to outer radius
  const toCartesian = (distance: number, azimuthDeg: number) => {
    const rad = ((azimuthDeg - 90) * Math.PI) / 180.0;
    const r = Math.min(1.0, distance / 10.0) * radius;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad)
    };
  };

  const criticalHazard = hazards.find(h => h.zone === 'RED');

  return (
    <div style={{
      background: 'rgba(11, 15, 22, 0.95)',
      border: criticalHazard ? '1px solid var(--cat-danger)' : '1px solid var(--cat-border)',
      borderRadius: '8px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-indicator" style={{ background: criticalHazard ? 'var(--cat-danger)' : 'var(--cat-radar)' }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--cat-text-main)',
            letterSpacing: '0.04em'
          }}>
            360° LiDAR Blindspot Radar
          </span>
        </div>

        <span className={criticalHazard ? 'badge-tag badge-red' : 'badge-tag badge-cyan'} style={{ fontSize: '0.65rem' }}>
          {criticalHazard ? 'CRITICAL PROXIMITY' : 'SCANNING ACTIVE'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Radar Circular Display */}
        <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Range Concentric Rings (3m, 6m, 10m) */}
            <circle cx={center} cy={center} r={radius} fill="rgba(0, 210, 211, 0.03)" stroke="rgba(0, 210, 211, 0.25)" strokeWidth="1" />
            <circle cx={center} cy={center} r={radius * 0.6} fill="rgba(255, 159, 26, 0.03)" stroke="rgba(255, 159, 26, 0.25)" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx={center} cy={center} r={radius * 0.3} fill="rgba(255, 56, 56, 0.05)" stroke="rgba(255, 56, 56, 0.4)" strokeWidth="1" />

            {/* Radar Crosshairs */}
            <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(0, 210, 211, 0.15)" strokeWidth="1" />
            <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(0, 210, 211, 0.15)" strokeWidth="1" />

            {/* Distance Ring Markers */}
            <text x={center + 3} y={center - radius * 0.3 + 8} fill="var(--cat-danger)" fontSize="7" fontFamily="var(--font-mono)">3m</text>
            <text x={center + 3} y={center - radius * 0.6 + 8} fill="var(--cat-warning)" fontSize="7" fontFamily="var(--font-mono)">6m</text>
            <text x={center + 3} y={center - radius + 8} fill="var(--cat-radar)" fontSize="7" fontFamily="var(--font-mono)">10m</text>

            {/* Excavator Center Icon */}
            <rect x={center - 7} y={center - 11} width={14} height={22} rx="2" fill="var(--cat-gold)" stroke="#000" strokeWidth="1.5" />
            <line x1={center} y1={center - 11} x2={center} y2={center - 18} stroke="var(--cat-gold)" strokeWidth="2" strokeLinecap="round" />

            {/* Rotating Radar Sweep Beam */}
            <g className="animate-radar-sweep">
              <line x1={center} y1={center} x2={center} y2={center - radius} stroke="var(--cat-radar)" strokeWidth="1.5" />
              <path
                d={`M ${center} ${center} L ${center - radius * 0.4} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center - radius} Z`}
                fill="url(#radarGradient)"
                opacity="0.4"
              />
            </g>

            <defs>
              <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="var(--cat-radar)" />
              </linearGradient>
            </defs>

            {/* Detected Hazard Blips */}
            {hazards.map(h => {
              const pos = toCartesian(h.distance_m, h.azimuth_deg);
              const color = h.zone === 'RED' ? 'var(--cat-danger)' : h.zone === 'YELLOW' ? 'var(--cat-warning)' : 'var(--cat-success)';
              return (
                <g key={h.hazard_id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle r="5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                  <circle r="9" fill="none" stroke={color} strokeWidth="1" opacity="0.6" className="animate-ping" />
                  <text x="7" y="3" fill="#FFF" fontSize="7" fontWeight="bold" fontFamily="var(--font-mono)">
                    {h.distance_m}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hazard List Readout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem', flex: 1 }}>
          {hazards.map(h => (
            <div
              key={h.hazard_id}
              style={{
                background: h.zone === 'RED' ? 'rgba(255, 56, 56, 0.12)' : 'rgba(21, 27, 38, 0.8)',
                border: h.zone === 'RED' ? '1px solid var(--cat-danger)' : '1px solid var(--cat-border)',
                borderRadius: '6px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: h.zone === 'RED' ? 'var(--cat-danger)' : h.zone === 'YELLOW' ? 'var(--cat-warning)' : 'var(--cat-success)' }}>
                    {h.target_type.replace('_', ' ')}
                  </strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--cat-text-dim)' }}>
                    ({h.azimuth_deg}° Azimuth)
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--cat-text-muted)', marginTop: '2px' }}>
                  {h.action_required}
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                fontSize: '0.85rem',
                color: h.zone === 'RED' ? 'var(--cat-danger)' : 'var(--cat-text-main)'
              }}>
                {h.distance_m}m
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
