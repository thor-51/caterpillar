import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Gauge, Zap, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, Compass } from 'lucide-react';
import { api, CoachingMatch, LiveTelemetry } from '../services/api';

export const CabAssistant: React.FC = () => {
  const [streamMode, setStreamMode] = useState<'live' | 'coached'>('live');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2.0);
  const [currentTelemetry, setCurrentTelemetry] = useState<LiveTelemetry>({
    timestamp: new Date().toISOString(),
    cycle_id: 'CYC_0095',
    phase: 'DIG',
    engine_rpm: 1820,
    fuel_rate_l_hr: 21.4,
    hydraulic_pressure_bar: 270.0,
    bucket_load_pct: 78.0,
    boom_angle_deg: 26.5,
    arm_angle_deg: 54.0,
    bucket_angle_deg: 45.0,
    machine_speed_kmh: 0.0,
    seatbelt_status: 'FASTENED'
  });

  const [coachingMatch, setCoachingMatch] = useState<CoachingMatch | null>(null);
  const [cycleProgress, setCycleProgress] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Load contextual match on mount
  useEffect(() => {
    async function fetchMatch() {
      try {
        const match = await api.matchCoaching({
          operator_id: 'OP_NOV_001',
          task_type: 'trenching',
          soil_condition: 'soft',
          load_condition: 'medium'
        });
        setCoachingMatch(match);
      } catch (err) {
        console.error('Failed to match coaching technique:', err);
      }
    }
    fetchMatch();
  }, []);

  const startStream = (mode: 'live' | 'coached') => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStreamMode(mode);
    setIsPlaying(true);

    const streamUrl = api.getStreamUrl(mode, speedMultiplier);
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    let rowCount = 0;

    es.addEventListener('telemetry', (event) => {
      try {
        const data = JSON.parse(event.data);
        setCurrentTelemetry(data);
        rowCount++;
        // Rough estimate of cycle progress (cycle has ~35-40 rows)
        setCycleProgress(Math.min(100, Math.round((rowCount / 36) * 100)));
      } catch (e) {
        console.error('Error parsing telemetry stream event:', e);
      }
    });

    es.addEventListener('cycle_complete', () => {
      setCycleProgress(100);
      setIsPlaying(false);
      es.close();
    });

    es.onerror = () => {
      setIsPlaying(false);
      es.close();
    };
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const phases = ['DIG', 'LIFT', 'SWING', 'DUMP', 'REPOSITION'];
  const currentPhaseIndex = phases.indexOf(currentTelemetry.phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner: In-Cab Status & Context */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-tag badge-yellow">
                In-Cab Operator Display
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
                Machine: <strong>EXC001 (CAT 320 GC)</strong>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
                Operator: <strong style={{ color: 'var(--cat-text-main)' }}>Aryan (Novice, Year 1)</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', marginTop: '6px' }}>
              Live Telemetry & Real-Time Contextual Guidance
            </h2>
          </div>

          {/* Stream Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => startStream('live')}
              className={streamMode === 'live' && isPlaying ? 'btn-cat-primary animate-pulse-glow' : 'btn-cat-secondary'}
              style={{ fontSize: '0.85rem' }}
            >
              <Play size={14} />
              Simulate Pre-Coaching Cycle
            </button>

            <button
              onClick={() => startStream('coached')}
              className={streamMode === 'coached' && isPlaying ? 'btn-cat-primary animate-pulse-glow' : 'btn-cat-secondary'}
              style={{ fontSize: '0.85rem' }}
            >
              <Zap size={14} />
              Simulate Coached Cycle
            </button>

            {isPlaying && (
              <button onClick={stopStream} className="btn-cat-secondary" style={{ padding: '9px 12px' }}>
                <Pause size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Operational Context Strip */}
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          background: 'var(--cat-surface)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Task Type: </span>
            <strong style={{ color: 'var(--cat-yellow)', textTransform: 'capitalize' }}>Trenching</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Geological Soil: </span>
            <strong style={{ color: '#60A5FA', textTransform: 'capitalize' }}>Soft Silt / Mud</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Bucket Payload: </span>
            <strong style={{ color: 'var(--cat-text-main)', textTransform: 'capitalize' }}>Medium (1.95T)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Telemetry Mode: </span>
            <span className={streamMode === 'coached' ? 'badge-tag badge-green' : 'badge-tag badge-yellow'} style={{ fontSize: '0.7rem' }}>
              {streamMode === 'coached' ? 'Post-Coaching Technique Applied' : 'Baseline Unassisted Operation'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Gauges + Phase Indicator + Proactive Coaching */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Live Kinematics & Hydraulic Gauges */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Gauge size={18} color="var(--cat-yellow)" />
              1 Hz Sensor Kinematics
            </h3>
            <span className="badge-tag badge-green" style={{ fontSize: '0.7rem' }}>
              {currentTelemetry.seatbelt_status === 'FASTENED' ? 'Restraint Secured' : 'Seatbelt Alert!'}
            </span>
          </div>

          {/* Gauges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* RPM */}
            <div style={{
              background: 'var(--cat-surface)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                Engine Throttle
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '4px' }}>
                {currentTelemetry.engine_rpm} <span style={{ fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>RPM</span>
              </div>
              <div style={{ height: '4px', background: 'var(--cat-border)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(currentTelemetry.engine_rpm / 2200) * 100}%`,
                  height: '100%',
                  background: 'var(--cat-yellow)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Hydraulic Pressure */}
            <div style={{
              background: 'var(--cat-surface)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                Hydraulic Pressure
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: currentTelemetry.hydraulic_pressure_bar > 280 ? '#EF4444' : 'var(--cat-yellow)', marginTop: '4px' }}>
                {currentTelemetry.hydraulic_pressure_bar} <span style={{ fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>bar</span>
              </div>
              <div style={{ height: '4px', background: 'var(--cat-border)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(currentTelemetry.hydraulic_pressure_bar / 350) * 100}%`,
                  height: '100%',
                  background: currentTelemetry.hydraulic_pressure_bar > 280 ? '#EF4444' : 'var(--cat-yellow)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Fuel Flow Rate */}
            <div style={{
              background: 'var(--cat-surface)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                Fuel Flow Rate
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '4px' }}>
                {currentTelemetry.fuel_rate_l_hr} <span style={{ fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>L/h</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-success)' }}>
                {streamMode === 'coached' ? '▼ 8.5% Optimized' : 'Standard Rate'}
              </span>
            </div>

            {/* Machine Track Speed */}
            <div style={{
              background: 'var(--cat-surface)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                Track Ground Speed
              </span>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '4px' }}>
                {currentTelemetry.machine_speed_kmh} <span style={{ fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>km/h</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: currentTelemetry.machine_speed_kmh > 0 ? 'var(--cat-yellow)' : 'var(--cat-text-dim)' }}>
                {currentTelemetry.machine_speed_kmh > 0 ? 'Repositioning Active' : 'Stationary Platform'}
              </span>
            </div>
          </div>

          {/* Excavator Boom/Arm/Bucket Angles */}
          <div style={{ marginTop: '20px', padding: '16px', background: 'var(--cat-surface)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
              Implement Kinematic Articulation
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Boom Angle</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cat-text-main)' }}>
                  {currentTelemetry.boom_angle_deg}°
                </div>
              </div>
              <div style={{ width: '1px', background: 'var(--cat-border)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Arm Angle</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cat-text-main)' }}>
                  {currentTelemetry.arm_angle_deg}°
                </div>
              </div>
              <div style={{ width: '1px', background: 'var(--cat-border)' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Bucket Angle</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cat-text-main)' }}>
                  {currentTelemetry.bucket_angle_deg}°
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Phase Progression & Gentle Coaching Prompt */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Phase Sequence Indicator */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Active Cycle Phase Tracker</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)' }}>
                Cycle: <strong>{currentTelemetry.cycle_id}</strong>
              </span>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              {phases.map((p, idx) => {
                const isActive = p === currentTelemetry.phase;
                const isPast = idx < currentPhaseIndex;
                return (
                  <div
                    key={p}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '12px 6px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--cat-yellow)' : isPast ? 'rgba(16, 185, 129, 0.15)' : 'var(--cat-surface)',
                      border: isActive ? '2px solid #FFF' : isPast ? '1px solid var(--cat-success)' : '1px solid var(--cat-border)',
                      color: isActive ? 'var(--cat-black)' : isPast ? 'var(--cat-success)' : 'var(--cat-text-muted)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 20px rgba(255, 205, 17, 0.4)' : 'none'
                    }}
                  >
                    {p}
                  </div>
                );
              })}
            </div>

            {/* Current Phase Highlight Box */}
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: 'var(--cat-surface)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--cat-yellow)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Current Operation:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cat-text-main)' }}>
                  Phase: {currentTelemetry.phase}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>Bucket Fill:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--cat-yellow)' }}>
                  {currentTelemetry.bucket_load_pct}%
                </div>
              </div>
            </div>
          </div>

          {/* Proactive Gentle Coaching Card */}
          {coachingMatch && coachingMatch.technique && (
            <div className="glass-panel" style={{
              padding: '24px',
              background: 'linear-gradient(145deg, rgba(27, 33, 43, 0.95), rgba(35, 43, 56, 0.8))',
              border: '1px solid var(--cat-border-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="badge-tag badge-yellow">
                  Contextual Technique Identified
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)' }}>
                  Technique #17 Mined from Fernandes (14 Yrs)
                </span>
              </div>

              <h4 style={{ fontSize: '1.15rem', color: 'var(--cat-yellow)', marginBottom: '8px' }}>
                {coachingMatch.technique.title}
              </h4>

              {/* Gentle non-surveillance prompt */}
              <div style={{
                background: 'rgba(255, 205, 17, 0.08)',
                border: '1px solid rgba(255, 205, 17, 0.25)',
                padding: '14px 18px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--cat-text-main)',
                lineHeight: 1.5,
                marginBottom: '14px'
              }}>
                "{coachingMatch.gentle_coaching_message}"
              </div>

              {/* Tacit Knowledge Preservation Note */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.8rem',
                color: 'var(--cat-text-muted)',
                lineHeight: 1.4
              }}>
                <BookOpen size={16} color="var(--cat-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Tacit Wisdom Preserved:</strong> Fernandes retired 6 months ago. His 94 soft-soil trenching cycles proved that minimizing boom lift during repositioning eliminates track sinkage and saves ~3.2 seconds every single cycle.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
