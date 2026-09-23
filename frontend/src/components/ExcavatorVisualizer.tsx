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
  const isDigging = phase === 'DIG';
  const isDumping = phase === 'DUMP';

  // Hydraulic boom cylinder rod kinematics
  const cylBase = { x: boomPivot.x + 12, y: boomPivot.y - 4 };
  const cylAttachment = {
    x: boomPivot.x + boomLength * 0.45 * Math.cos(boomRad),
    y: boomPivot.y + boomLength * 0.45 * Math.sin(boomRad) + 6
  };

  // Dynamic Penetration Force in DIG phase
  const penetrationForce = isDigging ? Math.round(135 + Math.random() * 25) : 0;

  return (
    <div style={{
      width: '100%',
      background: 'radial-gradient(ellipse at 50% 90%, rgba(245, 166, 35, 0.09), transparent 70%), linear-gradient(180deg, #131822 0%, #0c1017 100%)',
      borderRadius: '8px',
      border: '1px solid var(--cat-border)',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 10px 30px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Top HUD Status Bar */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="live-indicator" />
          <strong style={{ color: 'var(--cat-gold)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.78rem' }}>
            CAT Grade Kinematic Telemetry Engine
          </strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDigging && (
            <span className="badge-tag badge-cyan" style={{ fontSize: '0.68rem', animation: 'pulse-glow 1s infinite' }}>
              HYDRAULIC PENETRATION: {penetrationForce} kN
            </span>
          )}

          <div style={{
            fontSize: '0.72rem',
            padding: '2px 8px',
            borderRadius: '4px',
            background: isMoving ? 'rgba(245, 166, 35, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: isMoving ? 'var(--cat-gold)' : 'var(--cat-text-muted)',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)'
          }}>
            {isMoving ? `TRACKS DRIVING (${machineSpeed.toFixed(1)} km/h)` : 'CHASSIS HYDRAULICALLY ANCHORED'}
          </div>
        </div>
      </div>

      <svg width="100%" height="240" viewBox="0 0 420 240" style={{ overflow: 'visible' }}>
        <defs>
          {/* Caterpillar Heavy Gold Gradient */}
          <linearGradient id="catGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFBA42" />
            <stop offset="100%" stopColor="#F5A623" />
          </linearGradient>

          {/* Hardened Cast Iron Dark Gradient */}
          <linearGradient id="catSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#354154" />
            <stop offset="100%" stopColor="#151B24" />
          </linearGradient>

          {/* Cab Work-Light Illumination Cone */}
          <linearGradient id="cabLightGrad" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="rgba(255, 243, 205, 0.4)" />
            <stop offset="100%" stopColor="rgba(255, 243, 205, 0.0)" />
          </linearGradient>

          {/* Blueprint CAD Grid Pattern */}
          <pattern id="cadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(36, 46, 63, 0.2)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* CAD Coordinate Blueprint Grid Overlay */}
        <rect x="0" y="0" width="420" height="210" fill="url(#cadGrid)" />

        {/* Geological Strata Layers (Ground Cross-Section) */}
        {/* Layer 1: Compact Substrata */}
        <rect x="0" y="210" width="420" height="30" fill="rgba(14, 18, 26, 0.98)" />
        {/* Layer 2: Soft Silt Bed Trench Horizon */}
        <path d="M 270,210 L 305,238 L 385,238 L 405,210 Z" fill="rgba(6, 8, 12, 0.98)" stroke="rgba(245, 166, 35, 0.45)" strokeWidth="1.5" />
        
        {/* Depth Grid Contour Lines */}
        <line x1="0" y1="210" x2="420" y2="210" stroke="var(--cat-border)" strokeWidth="2" strokeDasharray="4 4" />
        <line x1="260" y1="230" x2="410" y2="230" stroke="rgba(0, 210, 211, 0.3)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Trench Depth Grade Target Marker */}
        <text x="345" y="234" fill="var(--cat-radar)" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)" letterSpacing="0.05em">
          GRADE TARGET: -2.40m
        </text>

        {/* Soil Type Tag */}
        <text x="345" y="222" fill="var(--cat-gold)" fontSize="8" textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="bold">
          {soilCondition.toUpperCase()} SILT / MUD
        </text>

        {/* Dynamic Cab Floodlight Illumination Beam */}
        <polygon
          points="138,128 360,195 385,235 138,140"
          fill="url(#cabLightGrad)"
          style={{ pointerEvents: 'none' }}
        />

        {/* Real-time Force Vector Arrow at Bucket Teeth during DIG */}
        {isDigging && (
          <g>
            <line
              x1={bucketTip.x}
              y1={bucketTip.y}
              x2={bucketTip.x + 22}
              y2={bucketTip.y + 18}
              stroke="var(--cat-radar)"
              strokeWidth="2.5"
              strokeDasharray="3 2"
            />
            <polygon
              points={`${bucketTip.x + 24},${bucketTip.y + 20} ${bucketTip.x + 18},${bucketTip.y + 14} ${bucketTip.x + 16},${bucketTip.y + 20}`}
              fill="var(--cat-radar)"
            />
            <text
              x={bucketTip.x + 28}
              y={bucketTip.y + 24}
              fill="var(--cat-radar)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              fontWeight="bold"
            >
              F={penetrationForce}kN
            </text>
          </g>
        )}

        {/* Soil Particles Spray when Digging */}
        {isDigging && (
          <g>
            <circle cx={bucketTip.x - 4} cy={bucketTip.y - 6} r="2.5" fill="#8B7355" opacity="0.8" />
            <circle cx={bucketTip.x + 3} cy={bucketTip.y - 8} r="3" fill="#A08260" opacity="0.9" />
            <circle cx={bucketTip.x - 8} cy={bucketTip.y - 3} r="2" fill="#5C4033" opacity="0.7" />
          </g>
        )}

        {/* Soil Discharge Flow when Dumping */}
        {isDumping && (
          <g>
            <circle cx={bucketTip.x} cy={bucketTip.y + 10} r="3" fill="#8B7355" opacity="0.8" />
            <circle cx={bucketTip.x + 4} cy={bucketTip.y + 18} r="3.5" fill="#A08260" opacity="0.8" />
            <circle cx={bucketTip.x - 2} cy={bucketTip.y + 26} r="4" fill="#5C4033" opacity="0.85" />
          </g>
        )}

        {/* Track Chassis Base Assembly */}
        <g transform="translate(45, 182)">
          {/* Lower Track Assembly */}
          <rect x="0" y="0" width="120" height="26" rx="8" fill="url(#catSteelGrad)" stroke="#090B0E" strokeWidth="2" />
          
          {/* Track Tread Outer Loop with Animated Scroll */}
          <rect
            x="2"
            y="2"
            width="116"
            height="22"
            rx="6"
            fill="none"
            stroke="var(--cat-border)"
            strokeWidth="3"
            strokeDasharray="6 4"
            style={{
              animation: isMoving ? 'trackScroll 0.8s linear infinite' : 'none'
            }}
          />

          {/* Steel Track Rollers */}
          <circle cx="14" cy="13" r="8" fill="#0E1218" stroke="#444" />
          <circle cx="38" cy="13" r="6" fill="#0E1218" />
          <circle cx="60" cy="13" r="6" fill="#0E1218" />
          <circle cx="82" cy="13" r="6" fill="#0E1218" />
          <circle cx="106" cy="13" r="8" fill="#0E1218" stroke="#444" />

          {/* Motion Dust Waves */}
          {isMoving && (
            <g>
              <line x1="-12" y1="20" x2="-2" y2="20" stroke="var(--cat-gold)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-20" y1="24" x2="-8" y2="24" stroke="var(--cat-gold)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
          )}
        </g>

        {/* Counterweight & Revolving Superstructure */}
        <path
          d="M 50,182 L 50,152 Q 54,142 66,142 L 138,142 L 146,182 Z"
          fill="url(#catGoldGrad)"
          stroke="#090B0E"
          strokeWidth="2"
        />

        {/* CAT Authentic High-Vis Decal */}
        <rect x="62" y="152" width="28" height="14" rx="2" fill="#090B0E" />
        <text x="76" y="163" fill="var(--cat-gold)" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="var(--font-display)">
          CAT
        </text>

        {/* Operator Cab Glass Window */}
        <path
          d="M 104,142 L 110,120 L 136,120 L 138,142 Z"
          fill="rgba(0, 210, 211, 0.35)"
          stroke="#F8FAFC"
          strokeWidth="1.5"
        />

        {/* Cab Rooftop Antenna & Beacon */}
        <line x1="114" y1="120" x2="114" y2="108" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="114" cy="107" r="2.5" fill="var(--cat-hazard)" style={{ filter: 'drop-shadow(0 0 6px var(--cat-hazard))' }} />

        {/* BOOM LINK */}
        <line
          x1={boomPivot.x}
          y1={boomPivot.y}
          x2={stickPivot.x}
          y2={stickPivot.y}
          stroke="url(#catGoldGrad)"
          strokeWidth="16"
          strokeLinecap="round"
          style={{ transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <line
          x1={boomPivot.x}
          y1={boomPivot.y}
          x2={stickPivot.x}
          y2={stickPivot.y}
          stroke="#090B0E"
          strokeWidth="1.5"
        />

        {/* Dynamic Hydraulic Boom Cylinder & Telescoping Piston */}
        <line
          x1={cylBase.x}
          y1={cylBase.y}
          x2={cylAttachment.x}
          y2={cylAttachment.y}
          stroke="#475569"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <line
          x1={cylAttachment.x}
          y1={cylAttachment.y}
          x2={(cylBase.x + cylAttachment.x) / 2}
          y2={(cylBase.y + cylAttachment.y) / 2}
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* STICK LINK */}
        <line
          x1={stickPivot.x}
          y1={stickPivot.y}
          x2={bucketPivot.x}
          y2={bucketPivot.y}
          stroke="url(#catGoldGrad)"
          strokeWidth="11"
          strokeLinecap="round"
          style={{ transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <line
          x1={stickPivot.x}
          y1={stickPivot.y}
          x2={bucketPivot.x}
          y2={bucketPivot.y}
          stroke="#090B0E"
          strokeWidth="1.5"
        />

        {/* BUCKET LINK & TOOTH */}
        <path
          d={`M ${bucketPivot.x},${bucketPivot.y} 
              L ${bucketTip.x},${bucketTip.y} 
              L ${bucketTip.x - 8},${bucketTip.y - 14} 
              Z`}
          fill={bucketLoad > 40 ? 'var(--cat-gold)' : 'url(#catSteelGrad)'}
          stroke="#090B0E"
          strokeWidth="2"
          style={{ transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />

        {/* Bucket Teeth */}
        <line
          x1={bucketTip.x}
          y1={bucketTip.y}
          x2={bucketTip.x + 5}
          y2={bucketTip.y + 4}
          stroke="#FFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Joint Coordinate Crosshairs & Pivot Circles */}
        <circle cx={boomPivot.x} cy={boomPivot.y} r="5.5" fill="#090B0E" stroke="var(--cat-gold)" strokeWidth="2" />
        <circle cx={stickPivot.x} cy={stickPivot.y} r="5" fill="#090B0E" stroke="var(--cat-gold)" strokeWidth="2" />
        <circle cx={bucketPivot.x} cy={bucketPivot.y} r="4.5" fill="#090B0E" stroke="var(--cat-gold)" strokeWidth="1.5" />
      </svg>

      {/* Numerical Joint Angle HUD */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        borderTop: '1px solid var(--cat-border)',
        paddingTop: '8px',
        fontSize: '0.78rem',
        fontFamily: 'var(--font-mono)'
      }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '4px 10px', borderRadius: '4px' }}>
          <span style={{ color: 'var(--cat-text-muted)' }}>Boom Joint: </span>
          <strong style={{ color: boomAngle <= 26.5 ? 'var(--cat-success)' : 'var(--cat-gold)' }}>
            {boomAngle.toFixed(1)}°
          </strong>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '4px 10px', borderRadius: '4px' }}>
          <span style={{ color: 'var(--cat-text-muted)' }}>Stick Joint: </span>
          <strong style={{ color: 'var(--cat-gold)' }}>{armAngle.toFixed(1)}°</strong>
        </div>
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '4px 10px', borderRadius: '4px' }}>
          <span style={{ color: 'var(--cat-text-muted)' }}>Bucket Curl: </span>
          <strong style={{ color: 'var(--cat-gold)' }}>{bucketAngle.toFixed(1)}°</strong>
        </div>
      </div>
    </div>
  );
};
