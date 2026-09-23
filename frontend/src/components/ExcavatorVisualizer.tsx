import React from 'react';

interface VisualizerProps {
  boomAngle: number;    // e.g. 20° to 60°
  armAngle: number;     // e.g. 35° to 90°
  bucketAngle: number;  // e.g. 25° to 105°
  phase: string;        // DIG, LIFT, SWING, DUMP, REPOSITION
  machineSpeed: number; // km/h
  soilCondition?: string;
  bucketLoad?: number;
}

export const ExcavatorVisualizer: React.FC<VisualizerProps> = ({
  boomAngle,
  armAngle,
  bucketAngle,
  phase,
  machineSpeed,
  soilCondition = 'soft',
  bucketLoad = 0
}) => {
  // Pivot calculations for 2D kinematic arm
  const boomPivot = { x: 130, y: 170 };
  const boomLength = 95;
  const stickLength = 75;
  const bucketLength = 32;

  // Convert angles to radians (SVG coordinates: y is down)
  const boomRad = ((-boomAngle + 10) * Math.PI) / 180;
  const stickPivot = {
    x: boomPivot.x + boomLength * Math.cos(boomRad),
    y: boomPivot.y + boomLength * Math.sin(boomRad)
  };

  const stickRad = boomRad + ((armAngle - 20) * Math.PI) / 180;
  const bucketPivot = {
    x: stickPivot.x + stickLength * Math.cos(stickRad),
    y: stickPivot.y + stickLength * Math.sin(stickRad)
  };

  const bucketRad = stickRad + ((bucketAngle - 30) * Math.PI) / 180;
  const bucketTip = {
    x: bucketPivot.x + bucketLength * Math.cos(bucketRad),
    y: bucketPivot.y + bucketLength * Math.sin(bucketRad)
  };

  const isMoving = phase === 'REPOSITION' || machineSpeed > 0;

  return (
    <div style={{
      width: '100%',
      background: 'radial-gradient(ellipse at 50% 80%, rgba(255, 205, 17, 0.05), transparent 70%), var(--cat-surface)',
      borderRadius: '12px',
      border: '1px solid var(--cat-border)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Overlay Badge */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="live-indicator" />
          <strong style={{ color: 'var(--cat-yellow)' }}>2D Kinematic Model</strong>
        </div>

        <div style={{
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: isMoving ? 'rgba(255, 205, 17, 0.2)' : 'rgba(255, 255, 255, 0.05)',
          color: isMoving ? 'var(--cat-yellow)' : 'var(--cat-text-muted)',
          fontWeight: 700
        }}>
          {isMoving ? `TRACKS IN MOTION (${machineSpeed} km/h)` : 'CHASSIS ANCHORED'}
        </div>
      </div>

      <svg width="100%" height="240" viewBox="0 0 420 240" style={{ overflow: 'visible' }}>
        <defs>
          {/* Track pattern for motion */}
          <pattern id="trackPattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="12" stroke="var(--cat-border)" strokeWidth="2" />
          </pattern>

          {/* Excavator Yellow Gradient */}
          <linearGradient id="catYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE047" />
            <stop offset="100%" stopColor="#FFCD11" />
          </linearGradient>

          {/* Steel Dark Gradient */}
          <linearGradient id="catSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E4959" />
            <stop offset="100%" stopColor="#1E232B" />
          </linearGradient>
        </defs>

        {/* Geological Terrain / Soil Bed */}
        <rect x="0" y="210" width="420" height="30" fill="rgba(30, 36, 46, 0.9)" />
        <line x1="0" y1="210" x2="420" y2="210" stroke="var(--cat-border)" strokeWidth="2" strokeDasharray="4 4" />

        {/* Trench Depth Excavation Indicator */}
        <path d="M 280,210 L 310,238 L 380,238 L 400,210 Z" fill="rgba(10, 12, 16, 0.9)" stroke="rgba(255, 205, 17, 0.4)" strokeWidth="1" />

        {/* Soil Label */}
        <text x="340" y="228" fill="var(--cat-text-dim)" fontSize="9" textAnchor="middle" fontFamily="var(--font-body)">
          {soilCondition.toUpperCase()} TRENCH
        </text>

        {/* Track Chassis Base */}
        <g transform="translate(45, 182)">
          {/* Lower Track Assembly */}
          <rect x="0" y="0" width="120" height="26" rx="8" fill="url(#catSteelGrad)" stroke="#111" strokeWidth="2" />
          
          {/* Animated Track Rollers */}
          <circle cx="14" cy="13" r="8" fill="#111" stroke="#444" />
          <circle cx="38" cy="13" r="6" fill="#111" />
          <circle cx="60" cy="13" r="6" fill="#111" />
          <circle cx="82" cy="13" r="6" fill="#111" />
          <circle cx="106" cy="13" r="8" fill="#111" stroke="#444" />

          {/* Motion Indicator Waves */}
          {isMoving && (
            <g>
              <line x1="-10" y1="20" x2="-2" y2="20" stroke="var(--cat-yellow)" strokeWidth="2" strokeLinecap="round" />
              <line x1="-18" y1="24" x2="-8" y2="24" stroke="var(--cat-yellow)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
          )}
        </g>

        {/* Counterweight & Revolving Superstructure */}
        <path
          d="M 50,182 L 50,152 Q 54,142 66,142 L 138,142 L 146,182 Z"
          fill="url(#catYellowGrad)"
          stroke="#111"
          strokeWidth="2"
        />
        {/* CAT Decal on Superstructure */}
        <rect x="62" y="152" width="28" height="14" rx="2" fill="#111" />
        <text x="76" y="163" fill="var(--cat-yellow)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="var(--font-display)">
          CAT
        </text>

        {/* Operator Cab Glass Window */}
        <path
          d="M 104,142 L 110,120 L 136,120 L 138,142 Z"
          fill="rgba(96, 165, 250, 0.4)"
          stroke="var(--cat-text-main)"
          strokeWidth="1.5"
        />

        {/* BOOM LINK */}
        <line
          x1={boomPivot.x}
          y1={boomPivot.y}
          x2={stickPivot.x}
          y2={stickPivot.y}
          stroke="url(#catYellowGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          style={{ transition: 'all 0.15s ease-out' }}
        />
        <line
          x1={boomPivot.x}
          y1={boomPivot.y}
          x2={stickPivot.x}
          y2={stickPivot.y}
          stroke="#111"
          strokeWidth="1.5"
        />

        {/* Hydraulic Boom Cylinder Link */}
        <line
          x1={boomPivot.x + 12}
          y1={boomPivot.y - 4}
          x2={(boomPivot.x + stickPivot.x) / 2}
          y2={(boomPivot.y + stickPivot.y) / 2 + 8}
          stroke="#94A3B8"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* STICK LINK */}
        <line
          x1={stickPivot.x}
          y1={stickPivot.y}
          x2={bucketPivot.x}
          y2={bucketPivot.y}
          stroke="url(#catYellowGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          style={{ transition: 'all 0.15s ease-out' }}
        />
        <line
          x1={stickPivot.x}
          y1={stickPivot.y}
          x2={bucketPivot.x}
          y2={bucketPivot.y}
          stroke="#111"
          strokeWidth="1.5"
        />

        {/* BUCKET LINK & TOOTH */}
        <path
          d={`M ${bucketPivot.x},${bucketPivot.y} 
              L ${bucketTip.x},${bucketTip.y} 
              L ${bucketTip.x - 8},${bucketTip.y - 14} 
              Z`}
          fill={bucketLoad > 40 ? 'var(--cat-yellow)' : 'url(#catSteelGrad)'}
          stroke="#111"
          strokeWidth="2"
          style={{ transition: 'all 0.15s ease-out' }}
        />

        {/* Bucket Teeth Pins */}
        <line
          x1={bucketTip.x}
          y1={bucketTip.y}
          x2={bucketTip.x + 5}
          y2={bucketTip.y + 4}
          stroke="#FFF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Pivot Pins (Joint Circles) */}
        <circle cx={boomPivot.x} cy={boomPivot.y} r="5" fill="#111" stroke="var(--cat-yellow)" strokeWidth="2" />
        <circle cx={stickPivot.x} cy={stickPivot.y} r="4.5" fill="#111" stroke="var(--cat-yellow)" strokeWidth="2" />
        <circle cx={bucketPivot.x} cy={bucketPivot.y} r="4" fill="#111" stroke="var(--cat-yellow)" strokeWidth="1.5" />
      </svg>

      {/* Numerical Joint Angle HUD */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--cat-border)',
        paddingTop: '8px',
        fontSize: '0.78rem'
      }}>
        <div>
          <span style={{ color: 'var(--cat-text-muted)' }}>Boom Joint: </span>
          <strong style={{ color: 'var(--cat-yellow)' }}>{boomAngle.toFixed(1)}°</strong>
        </div>
        <div>
          <span style={{ color: 'var(--cat-text-muted)' }}>Stick Joint: </span>
          <strong style={{ color: 'var(--cat-yellow)' }}>{armAngle.toFixed(1)}°</strong>
        </div>
        <div>
          <span style={{ color: 'var(--cat-text-muted)' }}>Bucket Curl: </span>
          <strong style={{ color: 'var(--cat-yellow)' }}>{bucketAngle.toFixed(1)}°</strong>
        </div>
      </div>
    </div>
  );
};
