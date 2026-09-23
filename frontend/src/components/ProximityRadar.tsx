import React from 'react';
import { ShieldAlert, AlertTriangle, UserCheck } from 'lucide-react';
import { ProximityHazard } from '../services/api';

interface ProximityRadarProps {
  hazards: ProximityHazard[];
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({ hazards }) => {
  const size = 190;
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
      background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 210, 211, 0.05), transparent 70%), linear-gradient(180deg, #131822 0%, #0c1017 100%)',
      border: criticalHazard ? '1px solid var(--cat-danger)' : '1px solid var(--cat-border)',
      borderRadius: '8px',
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      position: 'relative',
      boxShadow: criticalHazard ? '0 0 25px rgba(255, 56, 56, 0.25)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-indicator" style={{ background: criticalHazard ? 'var(--cat-danger)' : 'var(--cat-radar)' }} />
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--cat-text-main)',
            letterSpacing: '0.06em'
          }}>
            360° Ultrasonic & LiDAR Sonar
          </span>
        </div>

        <span className={criticalHazard ? 'badge-tag badge-red animate-pulse-glow' : 'badge-tag badge-cyan'} style={{ fontSize: '0.65rem' }}>
          {criticalHazard ? '⚠ COLLISION THREAT' : 'RADAR ACTIVE'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Radar Circular Avionics Display */}
        <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--cat-radar)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>

            {/* Concentric Range Rings (3m, 6m, 10m) */}
            <circle cx={center} cy={center} r={radius} fill="rgba(0, 210, 211, 0.03)" stroke="rgba(0, 210, 211, 0.3)" strokeWidth="1" />
            <circle cx={center} cy={center} r={radius * 0.6} fill="rgba(245, 166, 35, 0.03)" stroke="rgba(245, 166, 35, 0.3)" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={center} cy={center} r={radius * 0.3} fill="rgba(255, 56, 56, 0.06)" stroke="rgba(255, 56, 56, 0.5)" strokeWidth="1.2" />

            {/* Tactical Crosshair Axes */}
            <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="rgba(0, 210, 211, 0.2)" strokeWidth="1" />
            <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="rgba(0, 210, 211, 0.2)" strokeWidth="1" />

            {/* Compass Heading Labels */}
            <text x={center} y={center - radius + 8} fill="var(--cat-text-dim)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">N</text>
            <text x={center + radius - 6} y={center + 3} fill="var(--cat-text-dim)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">E</text>
            <text x={center} y={center + radius - 2} fill="var(--cat-text-dim)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">S</text>
            <text x={center - radius + 6} y={center + 3} fill="var(--cat-text-dim)" fontSize="7" textAnchor="middle" fontFamily="var(--font-mono)">W</text>

            {/* Distance Markers */}
            <text x={center + 4} y={center - radius * 0.3 + 9} fill="var(--cat-danger)" fontSize="7" fontFamily="var(--font-mono)" fontWeight="bold">3m</text>
            <text x={center + 4} y={center - radius * 0.6 + 9} fill="var(--cat-warning)" fontSize="7" fontFamily="var(--font-mono)">6m</text>
            <text x={center + 4} y={center - radius + 18} fill="var(--cat-radar)" fontSize="7" fontFamily="var(--font-mono)">10m</text>

            {/* Excavator Center Cockpit Symbol */}
            <rect x={center - 7} y={center - 11} width={14} height={22} rx="2" fill="var(--cat-gold)" stroke="#000" strokeWidth="1.5" />
            <line x1={center} y1={center - 11} x2={center} y2={center - 18} stroke="var(--cat-gold)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Rotating Radar Sweep Beam */}
            <g className="animate-radar-sweep">
              <line x1={center} y1={center} x2={center} y2={center - radius} stroke="var(--cat-radar)" strokeWidth="1.5" />
              <path
                d={`M ${center} ${center} L ${center - radius * 0.5} ${center - radius} A ${radius} ${radius} 0 0 1 ${center} ${center - radius} Z`}
                fill="url(#radarSweepGrad)"
                opacity="0.5"
              />
            </g>

            {/* Detected Hazard Blips */}
            {hazards.map(h => {
              const pos = toCartesian(h.distance_m, h.azimuth_deg);
              const color = h.zone === 'RED' ? 'var(--cat-danger)' : h.zone === 'YELLOW' ? 'var(--cat-warning)' : 'var(--cat-success)';
              return (
                <g key={h.hazard_id} transform={`translate(${pos.x}, ${pos.y})`}>
                  <circle r="4.5" fill={color} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
                  <circle r="9" fill="none" stroke={color} strokeWidth="1" opacity="0.7" />
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
                background: h.zone === 'RED' ? 'rgba(255, 56, 56, 0.12)' : 'rgba(21, 27, 38, 0.85)',
                border: h.zone === 'RED' ? '1px solid var(--cat-danger)' : '1px solid var(--cat-border)',
                borderRadius: '6px',
                padding: '7px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: h.zone === 'RED' ? 'var(--cat-danger)' : h.zone === 'YELLOW' ? 'var(--cat-warning)' : 'var(--cat-success)' }}>
                    {h.target_type.replace('_', ' ')}
                  </strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--cat-text-dim)', fontFamily: 'var(--font-mono)' }}>
                    ({h.azimuth_deg}° Azimuth)
                  </span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--cat-text-muted)', marginTop: '2px' }}>
                  {h.action_required}
                </div>
              </div>

              <div style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 900,
                fontSize: '0.9rem',
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
