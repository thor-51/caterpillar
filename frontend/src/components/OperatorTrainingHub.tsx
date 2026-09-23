import React, { useState, useEffect } from 'react';
import { GraduationCap, Video, Play, Award, CheckCircle2, UserCheck, Calendar, Clock, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, TrainingModule, BookingResponse, SimScoreResponse } from '../services/api';
import { sound } from '../services/sound';

export const OperatorTrainingHub: React.FC = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Simulation Practice Drill State
  const [simBoomAngle, setSimBoomAngle] = useState<number>(24.0);
  const [simLatency, setSimLatency] = useState<number>(8.4);
  const [simResult, setSimResult] = useState<SimScoreResponse | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  // Booking Modal State
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [bookingDate, setBookingDate] = useState<string>('2026-09-24');
  const [bookingSlot, setBookingSlot] = useState<string>('10:00 AM');
  const [bookingSuccess, setBookingSuccess] = useState<BookingResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const mods = await api.getTrainingModules();
        setModules(mods);
      } catch (err) {
        console.error('Failed to load training modules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const runSimDrill = async () => {
    try {
      setSimulating(true);
      const res = await api.evaluateSimulation({
        operator_id: 'OP_NOV_001',
        boom_angle_used: simBoomAngle,
        reposition_latency_s: simLatency,
        track_speed_kmh: 2.1
      });
      setSimResult(res);
      if (res.passed) {
        sound.playFanfare();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F5A623', '#05C46B', '#00D2D3']
        });
      } else {
        sound.playClick();
      }
    } catch (err) {
      console.error('Failed to run simulation drill:', err);
    } finally {
      setSimulating(false);
    }
  };

  const submitBooking = async () => {
    if (!selectedInstructor) return;
    try {
      const res = await api.bookInstructor({
        operator_id: 'OP_NOV_001',
        instructor_id: selectedInstructor,
        date: bookingDate,
        time_slot: bookingSlot,
        focus_technique: 'Technique #17 Soft Soil Repositioning'
      });
      setBookingSuccess(res);
      sound.playChime();
    } catch (err) {
      console.error('Failed to book session:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="tab-enter">
      {/* Title & Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-tag badge-gold">
            Operator Skill Enhancement Hub
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--cat-text-muted)' }}>
            Empirical Curriculum • Simulation, Video & Veteran Mentorship
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginTop: '6px' }}>
          Operator Training Hub & Simulation Simulator
        </h2>
        <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.9rem', maxWidth: '800px' }}>
          Accelerating novice competency via hands-on interactive physics drills, split-screen telemetry breakdowns, and direct mentorship booking with veteran operators.
        </p>
      </div>

      {/* Featured Interactive Simulation Drill: Technique #17 Practice Module */}
      <div className="glass-panel" style={{
        padding: '30px',
        border: '2px solid var(--cat-gold)',
        background: 'linear-gradient(135deg, rgba(27, 34, 48, 0.95), rgba(16, 21, 30, 0.95))',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag badge-gold">
                Interactive Drill
              </span>
              <span className="badge-tag badge-cyan">
                Technique #17: Soft-Soil Repositioning
              </span>
              <span className="badge-tag badge-green">
                Certified Simulator
              </span>
            </div>

            <h3 style={{ fontSize: '1.55rem', color: 'var(--cat-text-main)', marginTop: '8px' }}>
              Virtual Reposition Kinematics Drill
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--cat-text-muted)', marginTop: '6px', maxWidth: '720px' }}>
              Practice Fernandes's low-boom technique in soft soil. Adjust your virtual boom elevation angle and test whether your repositioning preserves track stability without sinking into mud.
            </p>
          </div>

          <button
            onClick={runSimDrill}
            disabled={simulating}
            className="btn-cat-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Sparkles size={15} />
            {simulating ? 'Evaluating Telemetry...' : 'Test Virtual Drill Run'}
          </button>
        </div>

        {/* Drill Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginTop: '24px',
          background: 'var(--cat-surface)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--cat-border)'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--cat-text-muted)' }}>Boom Elevation Joint Angle:</span>
              <strong style={{ color: simBoomAngle <= 26.5 ? 'var(--cat-success)' : 'var(--cat-danger)', fontFamily: 'var(--font-mono)' }}>
                {simBoomAngle.toFixed(1)}° {simBoomAngle <= 26.5 ? '(Optimal Low)' : '(Excessive Lift)'}
              </strong>
            </div>
            <input
              type="range"
              min="18"
              max="58"
              step="0.5"
              value={simBoomAngle}
              onChange={e => setSimBoomAngle(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-gold)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--cat-text-dim)', marginTop: '4px' }}>
              <span>18° (Fernandes Optimal)</span>
              <span>26.5° (Threshold)</span>
              <span>58° (Novice High Drag)</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--cat-text-muted)' }}>Track Repositioning Latency Target:</span>
              <strong style={{ color: simLatency <= 9.0 ? 'var(--cat-gold)' : 'var(--cat-danger)', fontFamily: 'var(--font-mono)' }}>
                {simLatency.toFixed(1)}s
              </strong>
            </div>
            <input
              type="range"
              min="7.5"
              max="14.0"
              step="0.1"
              value={simLatency}
              onChange={e => setSimLatency(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--cat-gold)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--cat-text-dim)', marginTop: '4px' }}>
              <span>7.5s (Expert)</span>
              <span>8.4s (Technique #17)</span>
              <span>14.0s (Hesitation)</span>
            </div>
          </div>
        </div>

        {/* Drill Result Card */}
        {simResult && (
          <div style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '8px',
            background: simResult.passed ? 'rgba(5, 196, 107, 0.1)' : 'rgba(255, 56, 56, 0.1)',
            border: simResult.passed ? '1px solid var(--cat-success)' : '1px solid var(--cat-danger)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={simResult.passed ? 'badge-tag badge-green' : 'badge-tag badge-red'}>
                  Grade: {simResult.grade}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
                  Empirical Score: <strong style={{ color: 'var(--cat-text-main)' }}>{simResult.score}/100</strong>
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--cat-gold)' }}>
                  ({simResult.delta_vs_fernandes})
                </span>
              </div>

              <div style={{ marginTop: '6px', fontSize: '0.88rem', color: 'var(--cat-text-main)' }}>
                {simResult.feedback}
              </div>
            </div>

            {simResult.passed && (
              <span className="badge-tag badge-gold" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                <Award size={14} /> Certified Technique #17 Competency
              </span>
            )}
          </div>
        )}
      </div>

      {/* Curriculum Grid: E-Learning & Instructor Booking */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {modules.map(m => (
          <div
            key={m.module_id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge-tag badge-gold" style={{ fontSize: '0.7rem' }}>
                  {m.format.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--cat-gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={13} fill="var(--cat-gold)" /> {m.rating} ({m.enrolled_count} completions)
                </span>
              </div>

              <h4 style={{ fontSize: '1.2rem', color: 'var(--cat-text-main)', marginBottom: '8px' }}>
                {m.title}
              </h4>

              <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                {m.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--cat-text-dim)' }}>
                {m.objectives.map((obj, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="var(--cat-success)" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid var(--cat-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)' }}>
                Mentor: <strong style={{ color: 'var(--cat-text-main)' }}>{m.instructor_name}</strong>
              </div>

              <button
                onClick={() => {
                  setSelectedInstructor(m.instructor_name);
                  setBookingSuccess(null);
                }}
                className="btn-cat-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              >
                Book 1-on-1 Review
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Instructor Booking Modal */}
      {selectedInstructor && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 8, 10, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '520px',
            width: '100%',
            padding: '30px',
            border: '2px solid var(--cat-gold)',
            background: 'var(--cat-surface)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--cat-text-main)' }}>
                Schedule Dual-Cab Review
              </h3>
              <button
                onClick={() => setSelectedInstructor(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--cat-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {!bookingSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--cat-text-muted)' }}>
                  Book a live field telemetry debrief session with <strong style={{ color: 'var(--cat-gold)' }}>{selectedInstructor}</strong>. Review Aryan's soft soil duty cycles side-by-side with veteran benchmarks.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '4px' }}>
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--cat-card)',
                      border: '1px solid var(--cat-border)',
                      color: 'var(--cat-text-main)',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '4px' }}>
                    Time Slot
                  </label>
                  <select
                    value={bookingSlot}
                    onChange={e => setBookingSlot(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--cat-card)',
                      border: '1px solid var(--cat-border)',
                      color: 'var(--cat-text-main)',
                      padding: '8px 12px',
                      borderRadius: '6px'
                    }}
                  >
                    <option value="08:30 AM">08:30 AM (Morning Shift Pre-Brief)</option>
                    <option value="10:00 AM">10:00 AM (Mid-Morning Session)</option>
                    <option value="02:30 PM">02:30 PM (Afternoon Telemetry Audit)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => setSelectedInstructor(null)} className="btn-cat-secondary">
                    Cancel
                  </button>
                  <button onClick={submitBooking} className="btn-cat-primary">
                    Confirm Mentorship Booking
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={42} color="var(--cat-success)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '1.2rem', color: 'var(--cat-success)' }}>
                  Mentorship Session Confirmed!
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--cat-text-muted)', marginTop: '8px' }}>
                  {bookingSuccess.confirmation_message}
                </p>
                <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--cat-gold)', fontWeight: 600 }}>
                  Scheduled: {bookingSuccess.scheduled_time}
                </div>
                <button
                  onClick={() => setSelectedInstructor(null)}
                  className="btn-cat-primary"
                  style={{ marginTop: '20px' }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
