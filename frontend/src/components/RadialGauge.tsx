import React from 'react';

interface RadialGaugeProps {
  value: number;
  min: number;
  max: number;
  label: string;
  unit: string;
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  min,
  max,
  label,
  unit,
  color = 'var(--cat-yellow)',
  warningThreshold,
  dangerThreshold
}) => {
  const size = 150;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Arc angles: 240 degrees total, starting at 150 deg (bottom left) to 390 deg (bottom right)
  const startAngle = 150;
  const totalAngle = 240;

  const clampedVal = Math.min(Math.max(value, min), max);
  const percentage = (clampedVal - min) / (max - min);
  const currentAngle = startAngle + percentage * totalAngle;

  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const backgroundArc = describeArc(center, center, radius, startAngle, startAngle + totalAngle);
  const progressArc = describeArc(center, center, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));

  // Determine dynamic color
  let activeColor = color;
  if (dangerThreshold !== undefined && value >= dangerThreshold) {
    activeColor = '#EF4444';
  } else if (warningThreshold !== undefined && value >= warningThreshold) {
    activeColor = '#F59E0B';
  }

  // Needle tip
  const needleTip = polarToCartesian(center, center, radius - 16, currentAngle);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Track */}
        <path
          d={backgroundArc}
          fill="none"
          stroke="var(--cat-border)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active Progress Arc */}
        <path
          d={progressArc}
          fill="none"
          stroke={activeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${activeColor})`,
            transition: 'stroke 0.3s ease, stroke-dashoffset 0.2s ease'
          }}
        />

        {/* Center Needle Pin */}
        <circle cx={center} cy={center} r={6} fill="var(--cat-text-main)" />

        {/* Glowing Needle Line */}
        <line
          x1={center}
          y1={center}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke={activeColor}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: 'all 0.2s ease-out' }}
        />
      </svg>

      {/* Numerical Value Readout */}
      <div style={{
        marginTop: '-24px',
        textAlign: 'center',
        zIndex: 2
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.45rem',
          fontWeight: 800,
          color: activeColor,
          lineHeight: 1
        }}>
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
          <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginLeft: '3px' }}>
            {unit}
          </span>
        </div>
        <div style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--cat-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginTop: '2px'
        }}>
          {label}
        </div>
      </div>
    </div>
  );
};
