import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, BookOpen, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api, CoachingMatch, LiveTelemetry } from '../services/api';
import { RadialGauge } from './RadialGauge';
import { ExcavatorVisualizer } from './ExcavatorVisualizer';
import { sound } from '../services/sound';

interface CabAssistantProps {
  onPreCoachingTriggerRef?: React.MutableRefObject<(() => void) | null>;
  onCoachedTriggerRef?: React.MutableRefObject<(() => void) | null>;
}

export const CabAssistant: React.FC<CabAssistantProps> = ({
  onPreCoachingTriggerRef,
  onCoachedTriggerRef
}) => {
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
  const prevPhaseRef = useRef<string>('DIG');

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
        const data: LiveTelemetry = JSON.parse(event.data);
        if (data.phase !== prevPhaseRef.current) {
          sound.playClick();
          prevPhaseRef.current = data.phase;
        }
        setCurrentTelemetry(data);
        rowCount++;
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

  // Expose trigger handlers to AutoPilot
  useEffect(() => {
    if (onPreCoachingTriggerRef) {
      onPreCoachingTriggerRef.current = () => startStream('live');
    }
    if (onCoachedTriggerRef) {
      onCoachedTriggerRef.current = () => startStream('coached');
    }
  }, [onPreCoachingTriggerRef, onCoachedTriggerRef]);

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
                In-Cab Operator HUD
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
                Excavator: <strong>EXC001 (CAT 320 GC)</strong>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
                Operator: <strong style={{ color: 'var(--cat-text-main)' }}>Aryan (Novice, Year 1)</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.65rem', marginTop: '6px' }}>
              Live Telemetry & Tactile In-Cab Guidance
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
              Simulate Pre-Coaching
            </button>

            <button
              onClick={() => startStream('coached')}
              className={streamMode === 'coached' && isPlaying ? 'btn-cat-primary animate-pulse-glow' : 'btn-cat-secondary'}
              style={{ fontSize: '0.85rem' }}
            >
              <Zap size={14} />
              Simulate Coached (+27% Faster)
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
            <span style={{ color: 'var(--cat-text-muted)' }}>Task: </span>
            <strong style={{ color: 'var(--cat-yellow)', textTransform: 'capitalize' }}>Trenching</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Terrain: </span>
            <strong style={{ color: '#60A5FA', textTransform: 'capitalize' }}>Soft Silt / Mud</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Payload: </span>
            <strong style={{ color: 'var(--cat-text-main)' }}>Medium (1.95 Tons)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Execution Mode: </span>
            <span className={streamMode === 'coached' ? 'badge-tag badge-green' : 'badge-tag badge-yellow'} style={{ fontSize: '0.7rem' }}>
              {streamMode === 'coached' ? '✓ Post-Coaching Technique #17 Applied' : 'Baseline Unassisted Novice'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Display Grid: Visual Kinematic Model + Radial Gauges */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: 2D Kinematic Model & Implement Visualizer */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Real-Time Equipment Articulation</h3>
            <span className={currentTelemetry.seatbelt_status === 'FASTENED' ? 'badge-tag badge-green' : 'badge-tag badge-red'} style={{ fontSize: '0.7rem' }}>
              {currentTelemetry.seatbelt_status === 'FASTENED' ? 'Restraint Latched' : 'Seatbelt Unbuckled!'}
            </span>
          </div>

          <ExcavatorVisualizer
            boomAngle={currentTelemetry.boom_angle_deg}
            armAngle={currentTelemetry.arm_angle_deg}
            bucketAngle={currentTelemetry.bucket_angle_deg}
            phase={currentTelemetry.phase}
            machineSpeed={currentTelemetry.machine_speed_kmh}
            soilCondition="soft"
            bucketLoad={currentTelemetry.bucket_load_pct}
          />

          {/* Quick Metrics Bar below visualizer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div style={{ background: 'var(--cat-surface)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Fuel Rate</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '2px' }}>
                {currentTelemetry.fuel_rate_l_hr} <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>L/h</span>
              </div>
            </div>

            <div style={{ background: 'var(--cat-surface)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Bucket Fill</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cat-yellow)', marginTop: '2px' }}>
                {currentTelemetry.bucket_load_pct}%
              </div>
            </div>

            <div style={{ background: 'var(--cat-surface)', padding: '12px', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Ground Speed</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: currentTelemetry.machine_speed_kmh > 0 ? 'var(--cat-yellow)' : 'var(--cat-text-main)', marginTop: '2px' }}>
                {currentTelemetry.machine_speed_kmh} <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Radial Dials + Phase Stepper + Proactive Coaching Banner */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Radial Dials Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Hydraulic & Throttle Telemetry</h3>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <RadialGauge
                value={currentTelemetry.engine_rpm}
                min={1400}
                max={2200}
                label="Throttle"
                unit="RPM"
                color="var(--cat-yellow)"
                warningThreshold={2050}
              />

              <RadialGauge
                value={currentTelemetry.hydraulic_pressure_bar}
                min={120}
                max={340}
                label="Pressure"
                unit="bar"
                color="#60A5FA"
                warningThreshold={280}
                dangerThreshold={315}
              />
            </div>
          </div>

          {/* Phase Sequence Stepper */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cat-text-main)' }}>
                Physical Phase Pipeline
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
                Cycle ID: <strong style={{ color: 'var(--cat-yellow)' }}>{currentTelemetry.cycle_id}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {phases.map((p, idx) => {
                const isActive = p === currentTelemetry.phase;
                const isPast = idx < currentPhaseIndex;
                return (
                  <div
                    key={p}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 4px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--cat-yellow)' : isPast ? 'rgba(16, 185, 129, 0.15)' : 'var(--cat-surface)',
                      border: isActive ? '2px solid #FFF' : isPast ? '1px solid var(--cat-success)' : '1px solid var(--cat-border)',
                      color: isActive ? 'var(--cat-black)' : isPast ? 'var(--cat-success)' : 'var(--cat-text-muted)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.75rem',
                      transition: 'all 0.25s ease',
                      boxShadow: isActive ? '0 0 16px rgba(255, 205, 17, 0.5)' : 'none'
                    }}
                  >
                    {p}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proactive Gentle Coaching Card */}
          {coachingMatch && coachingMatch.technique && (
            <div className="glass-panel" style={{
              padding: '22px',
              background: 'linear-gradient(135deg, rgba(27, 33, 43, 0.95), rgba(35, 43, 56, 0.8))',
              border: '1px solid var(--cat-border-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-tag badge-yellow">
                  Context Match: Technique #17
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--cat-text-muted)' }}>
                  Author: Fernandes (14 Yrs Veteran)
                </span>
              </div>

              <div style={{
                background: 'rgba(255, 205, 17, 0.08)',
                border: '1px solid rgba(255, 205, 17, 0.25)',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                color: 'var(--cat-text-main)',
                lineHeight: 1.5,
                marginBottom: '10px'
              }}>
                "{coachingMatch.gentle_coaching_message}"
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.78rem',
                color: 'var(--cat-text-muted)'
              }}>
                <BookOpen size={14} color="var(--cat-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Organizational Wisdom:</strong> Fernandes retired 6 months ago. His 94 soft-soil trenching cycles proved that minimizing boom lift eliminates counterweight sway and saves 3.2s per reposition.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
