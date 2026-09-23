import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, TrendingUp, Compass, Award, BarChart3, Clock } from 'lucide-react';
import { api, Technique, TechniqueDetail } from '../services/api';

interface ModalProps {
  technique: Technique;
  onClose: () => void;
}

export const TechniqueDetailModal: React.FC<ModalProps> = ({ technique, onClose }) => {
  const [detail, setDetail] = useState<TechniqueDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        const data = await api.getTechniqueDetail(technique.technique_id);
        setDetail(data);
      } catch (err) {
        console.error('Failed to load technique detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [technique.technique_id]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        border: '1px solid var(--cat-yellow)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--cat-surface)',
            border: '1px solid var(--cat-border)',
            borderRadius: '6px',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--cat-text-muted)'
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-tag badge-yellow">
              {technique.technique_id}
            </span>
            <span className="badge-tag badge-blue">
              {technique.task_type.toUpperCase()} • {technique.soil_condition.toUpperCase()} SOIL
            </span>
          </div>

          <h2 style={{ fontSize: '1.75rem', color: 'var(--cat-text-main)' }}>
            {technique.title}
          </h2>

          <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
            Mastered by <strong>{technique.author_name}</strong> • Discovered through statistical pattern mining
          </p>
        </div>

        {/* Statistical Metrics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'var(--cat-surface)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Phase Efficiency
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cat-success)', marginTop: '2px' }}>
              +{technique.advantage_pct}%
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>vs Cohort Baseline</span>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Benchmark Duration
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cat-yellow)', marginTop: '2px' }}>
              {technique.technique_duration}s
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>
              Target: {technique.primary_phase}
            </span>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Cohort Baseline
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cat-text-muted)', marginTop: '2px' }}>
              {technique.baseline_cohort_duration}s
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Fleet Average</span>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
              Mined Sample Evidence
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cat-text-main)', marginTop: '2px' }}>
              {technique.cycle_sample_count}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-dim)' }}>Verified Cycles</span>
          </div>
        </div>

        {/* Narrative Summary */}
        <div style={{
          background: 'var(--cat-surface)',
          padding: '20px',
          borderRadius: '8px',
          borderLeft: '4px solid var(--cat-yellow)',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--cat-yellow)', marginBottom: '6px' }}>
            Technique Mechanism & Engineering Summary
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--cat-text-main)', lineHeight: 1.6 }}>
            {technique.summary}
          </p>
        </div>

        {/* In-Cab Guidance Display */}
        <div style={{
          background: 'rgba(255, 205, 17, 0.08)',
          border: '1px solid rgba(255, 205, 17, 0.3)',
          padding: '18px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--cat-yellow)', textTransform: 'uppercase', marginBottom: '6px' }}>
            Active Cab Coaching Audio / HUD Prompt
          </h4>
          <p style={{ fontSize: '0.92rem', color: 'var(--cat-text-main)', fontStyle: 'italic' }}>
            "{technique.cab_coaching_prompt}"
          </p>
        </div>

        {/* Empirical Evidence Table */}
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--cat-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} color="var(--cat-yellow)" />
            Empirical Cycle Evidence from {technique.author_name} (Sample of {detail?.evidence.sample_evidence.length || 0} Cycles)
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--cat-text-muted)' }}>
              Loading telemetry evidence...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--cat-surface)', color: 'var(--cat-text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Cycle ID</th>
                    <th style={{ padding: '10px 12px' }}>Total Time</th>
                    <th style={{ padding: '10px 12px' }}>{technique.primary_phase} (Target)</th>
                    <th style={{ padding: '10px 12px' }}>Fuel Used</th>
                    <th style={{ padding: '10px 12px' }}>Verification Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail?.evidence.sample_evidence.map((row) => (
                    <tr key={row.cycle_id} style={{ borderBottom: '1px solid var(--cat-border)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--cat-yellow)' }}>{row.cycle_id}</td>
                      <td style={{ padding: '10px 12px' }}>{row.cycle_time_seconds}s</td>
                      <td style={{ padding: '10px 12px', color: 'var(--cat-success)', fontWeight: 700 }}>
                        {row.target_phase_duration}s
                      </td>
                      <td style={{ padding: '10px 12px' }}>{row.fuel_used_l} L</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge-tag badge-green" style={{ fontSize: '0.65rem' }}>
                          Mined Pattern
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
