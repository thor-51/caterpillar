import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, BookOpen, Volume2, ShieldCheck, AlertTriangle, Radio, Activity } from 'lucide-react';
import { api, CoachingMatch, LiveTelemetry, ProximityHazard } from '../services/api';
import { RadialGauge } from './RadialGauge';
import { ExcavatorVisualizer } from './ExcavatorVisualizer';
import { TelemetryWaveform } from './TelemetryWaveform';
import { ProximityRadar } from './ProximityRadar';
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
  const [isAutonomousLoop, setIsAutonomousLoop] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2.0);

  const [currentTelemetry, setCurrentTelemetry] = useState<LiveTelemetry>({
    timestamp: new Date().toISOString(),
    cycle_id: 'CYC_0095',
    phase: 'DIG',
    engine_rpm: 1820,
    fuel_rate_l_hr: 21.4,
    hydraulic_pressure_bar: 275.0,
    bucket_load_pct: 78.0,
    boom_angle_deg: 26.5,
    arm_angle_deg: 54.0,
    bucket_angle_deg: 45.0,
    machine_speed_kmh: 0.0,
    seatbelt_status: 'FASTENED'
  });

  const [waveformHistory, setWaveformHistory] = useState<Array<{ time: number; pressure: number; boomAngle: number }>>([]);
  const [coachingMatch, setCoachingMatch] = useState<CoachingMatch | null>(null);
  const [hazards, setHazards] = useState<ProximityHazard[]>([]);
  const [cycleProgress, setCycleProgress] = useState<number>(0);
  const [currentIdlingMinutes, setCurrentIdlingMinutes] = useState<number>(12);

  const eventSourceRef = useRef<EventSource | null>(null);
  const prevPhaseRef = useRef<string>('DIG');
  const autoLoopTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load contextual match and safety hazards on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [match, safetyData] = await Promise.all([
          api.matchCoaching({
            operator_id: 'OP_NOV_001',
            task_type: 'trenching',
            soil_condition: 'soft',
            load_condition: 'medium'
          }),
          api.getSafetyOverview()
        ]);
        setCoachingMatch(match);
        if (safetyData.proximity_hazards) {
          setHazards(safetyData.proximity_hazards);
        }
      } catch (err) {
        console.error('Failed to load cab telemetry context:', err);
      }
    }
    fetchData();
  }, []);

  // Continuous Autonomous Simulation Engine (runs when user is not manually streaming comparison)
  useEffect(() => {
    if (isPlaying || !isAutonomousLoop) {
      if (autoLoopTimerRef.current) clearInterval(autoLoopTimerRef.current);
      return;
    }

    const phases = ['DIG', 'LIFT', 'SWING', 'DUMP', 'REPOSITION'];
    let phaseIdx = 0;
    let tickCount = 0;

    autoLoopTimerRef.current = setInterval(() => {
      tickCount++;
      // Progress through mechanical duty cycle phases
      if (tickCount % 5 === 0) {
        phaseIdx = (phaseIdx + 1) % phases.length;
      }
      const activePhase = phases[phaseIdx];

      // Physics parameters based on active phase
      let pressure = 180 + Math.sin(tickCount * 0.4) * 25;
      let boom = 24.5;
      let speed = 0.0;
      let load = 65.0;

      if (activePhase === 'DIG') {
        pressure = 285 + Math.random() * 20;
        boom = 22.0 + Math.random() * 4;
        load = 85.0;
      } else if (activePhase === 'LIFT') {
        pressure = 240 + Math.random() * 15;
        boom = 48.0 + Math.sin(tickCount) * 5;
        load = 88.0;
      } else if (activePhase === 'SWING') {
        pressure = 210 + Math.random() * 15;
        boom = 45.0;
        load = 85.0;
      } else if (activePhase === 'DUMP') {
        pressure = 195 + Math.random() * 15;
        boom = 42.0;
        load = 15.0;
      } else if (activePhase === 'REPOSITION') {
        // Coached low boom posture!
        pressure = 165 + Math.random() * 10;
        boom = 24.0;
        speed = 2.2;
        load = 5.0;
      }

      const telem: LiveTelemetry = {
        timestamp: new Date().toISOString(),
        cycle_id: 'AUTONOMOUS_LIVE',
        phase: activePhase,
        engine_rpm: 1780 + Math.floor(Math.random() * 80),
        fuel_rate_l_hr: activePhase === 'REPOSITION' ? 18.2 : 20.8,
        hydraulic_pressure_bar: Number(pressure.toFixed(1)),
        bucket_load_pct: Number(load.toFixed(1)),
        boom_angle_deg: Number(boom.toFixed(1)),
        arm_angle_deg: 52.0 + Math.sin(tickCount * 0.3) * 10,
        bucket_angle_deg: activePhase === 'DUMP' ? 85.0 : 42.0,
        machine_speed_kmh: speed,
        seatbelt_status: 'FASTENED'
      };

      setCurrentTelemetry(telem);
      setWaveformHistory(prev => {
        const next = [...prev, { time: Date.now(), pressure: telem.hydraulic_pressure_bar, boomAngle: telem.boom_angle_deg }];
        return next.slice(-25);
      });
    }, 1000);

    return () => {
      if (autoLoopTimerRef.current) clearInterval(autoLoopTimerRef.current);
    };
  }, [isPlaying, isAutonomousLoop]);

  const startStream = (mode: 'live' | 'coached') => {
    if (autoLoopTimerRef.current) clearInterval(autoLoopTimerRef.current);
    if (eventSourceRef.current) eventSourceRef.current.close();

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
        setWaveformHistory(prev => {
          const next = [...prev, { time: Date.now(), pressure: data.hydraulic_pressure_bar, boomAngle: data.boom_angle_deg }];
          return next.slice(-25);
        });
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

  // Expose triggers to AutoPilot
  useEffect(() => {
    if (onPreCoachingTriggerRef) onPreCoachingTriggerRef.current = () => startStream('live');
    if (onCoachedTriggerRef) onCoachedTriggerRef.current = () => startStream('coached');
  }, [onPreCoachingTriggerRef, onCoachedTriggerRef]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (autoLoopTimerRef.current) clearInterval(autoLoopTimerRef.current);
    };
  }, []);

  const phases = ['DIG', 'LIFT', 'SWING', 'DUMP', 'REPOSITION'];
  const currentPhaseIndex = phases.indexOf(currentTelemetry.phase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="tab-enter">
      {/* Top Banner: In-Cab Status, Machinery ID & Context */}
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
              <span className="badge-tag badge-gold">
                In-Cab Operator Cockpit
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--cat-text-muted)' }}>
                Machinery: <strong>EXC001 (CAT 320 GC)</strong>
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--cat-text-muted)' }}>
                Operator: <strong style={{ color: 'var(--cat-text-main)' }}>Aryan (Novice, Year 1)</strong>
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--cat-radar)' }}>
                Autonomous Copilot: <strong>ACTIVE</strong>
              </span>
            </div>

            <h2 style={{ fontSize: '1.65rem', marginTop: '6px' }}>
              Tactile In-Cab Telemetry, Kinematics & Blindspot Radar
            </h2>
          </div>

          {/* Stream Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => startStream('live')}
              className={streamMode === 'live' && isPlaying ? 'btn-cat-primary animate-pulse-glow' : 'btn-cat-secondary'}
              style={{ fontSize: '0.82rem' }}
            >
              <Play size={13} />
              Simulate Novice Baseline
            </button>

            <button
              onClick={() => startStream('coached')}
              className={streamMode === 'coached' && isPlaying ? 'btn-cat-primary animate-pulse-glow' : 'btn-cat-secondary'}
              style={{ fontSize: '0.82rem' }}
            >
              <Zap size={13} />
              Simulate Coached (+27% Speed)
            </button>

            {isPlaying && (
              <button onClick={stopStream} className="btn-cat-secondary" style={{ padding: '8px 12px' }}>
                <Pause size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Operational Context Strip */}
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          background: 'var(--cat-surface)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Task: </span>
            <strong style={{ color: 'var(--cat-gold)', textTransform: 'capitalize' }}>Trenching (Substation Feed)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Soil Profile: </span>
            <strong style={{ color: '#70A1FF', textTransform: 'capitalize' }}>Soft Silt / Mud</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Payload: </span>
            <strong style={{ color: 'var(--cat-text-main)' }}>Medium (1.95 Tons)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Live Mode: </span>
            <span className={isPlaying ? 'badge-tag badge-gold' : 'badge-tag badge-green'} style={{ fontSize: '0.68rem' }}>
              {isPlaying ? `Benchmark Replay (${streamMode.toUpperCase()})` : 'Autonomous Real-Time Simulation'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--cat-text-muted)' }}>Shift Idling: </span>
            <strong style={{ color: currentIdlingMinutes >= 30 ? 'var(--cat-hazard)' : 'var(--cat-success)', fontFamily: 'var(--font-mono)' }}>
              {currentIdlingMinutes} min {currentIdlingMinutes >= 30 ? '(Excessive Idle!)' : '(Nominal)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Cockpit Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Left Column: Kinematic Model + Dual-Trace Telemetry Oscilloscope */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>Real-Time Equipment Articulation</h3>
            <span className={currentTelemetry.seatbelt_status === 'FASTENED' ? 'badge-tag badge-green' : 'badge-tag badge-red'}>
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

          {/* Dual-Trace Waveform Oscilloscope */}
          <TelemetryWaveform
            history={waveformHistory}
            currentPressure={currentTelemetry.hydraulic_pressure_bar}
            currentBoomAngle={currentTelemetry.boom_angle_deg}
          />

          {/* Fast Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div style={{ background: 'var(--cat-surface)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Fuel Burn</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {currentTelemetry.fuel_rate_l_hr} <span style={{ fontSize: '0.72rem', color: 'var(--cat-text-muted)' }}>L/h</span>
              </div>
            </div>

            <div style={{ background: 'var(--cat-surface)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Bucket Fill</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cat-gold)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {currentTelemetry.bucket_load_pct}%
              </div>
            </div>

            <div style={{ background: 'var(--cat-surface)', padding: '10px', borderRadius: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>Track Velocity</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: currentTelemetry.machine_speed_kmh > 0 ? 'var(--cat-gold)' : 'var(--cat-text-main)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {currentTelemetry.machine_speed_kmh.toFixed(1)} <span style={{ fontSize: '0.72rem', color: 'var(--cat-text-muted)' }}>km/h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 360° Proximity Sonar + Radial Gauges + Phase Stepper + Proactive Coaching */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 360° Proximity Sonar/LiDAR Radar */}
          <ProximityRadar hazards={hazards} />

          {/* Radial Dials Panel */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Hydraulic & Throttle Telemetry</h3>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <RadialGauge
                value={currentTelemetry.engine_rpm}
                min={1400}
                max={2200}
                label="Engine Throttle"
                unit="RPM"
                color="var(--cat-gold)"
                warningThreshold={2050}
              />

              <RadialGauge
                value={currentTelemetry.hydraulic_pressure_bar}
                min={120}
                max={340}
                label="System Pressure"
                unit="bar"
                color="var(--cat-radar)"
                warningThreshold={285}
                dangerThreshold={320}
              />
            </div>
          </div>

          {/* Physical Phase Pipeline Stepper */}
          <div className="glass-panel" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--cat-text-main)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Mechanical Duty Phase
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--cat-text-muted)' }}>
                Cycle: <strong style={{ color: 'var(--cat-gold)' }}>{currentTelemetry.cycle_id}</strong>
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
                      padding: '8px 4px',
                      borderRadius: '4px',
                      background: isActive ? 'var(--cat-gold)' : isPast ? 'rgba(5, 196, 107, 0.15)' : 'var(--cat-surface)',
                      border: isActive ? '2px solid #FFF' : isPast ? '1px solid var(--cat-success)' : '1px solid var(--cat-border)',
                      color: isActive ? 'var(--cat-black)' : isPast ? 'var(--cat-success)' : 'var(--cat-text-muted)',
                      fontWeight: isActive ? 900 : 700,
                      fontSize: '0.72rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 0 14px rgba(245, 166, 35, 0.6)' : 'none'
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
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(27, 35, 48, 0.95), rgba(18, 23, 32, 0.85))',
              border: '1px solid var(--cat-border-glow)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-tag badge-gold">
                  Context Match: Technique #17
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>
                  Author: Fernandes (14 Yrs Veteran Master)
                </span>
              </div>

              <div style={{
                background: 'rgba(245, 166, 35, 0.08)',
                border: '1px solid rgba(245, 166, 35, 0.25)',
                padding: '12px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--cat-text-main)',
                lineHeight: 1.5,
                marginBottom: '8px'
              }}>
                "{coachingMatch.gentle_coaching_message}"
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--cat-text-muted)'
              }}>
                <BookOpen size={13} color="var(--cat-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Tacit Wisdom:</strong> Fernandes retired 6 months ago. His 94 soft-soil trenching cycles proved that minimizing boom lift eliminates counterweight sway and saves 3.2s per reposition.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
