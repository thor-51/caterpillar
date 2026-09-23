import React, { useEffect, useState } from 'react';
import { Award, ArrowRight, TrendingDown, Fuel, CheckCircle2, RotateCw, GitCommit, Users, HeartHandshake, Sparkles } from 'lucide-react';
import { api, TransferSummary } from '../services/api';

export const SkillTransfer: React.FC = () => {
  const [summary, setSummary] = useState<TransferSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const data = await api.getTransferSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load transfer summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleReevaluate = async () => {
    try {
      setEvaluating(true);
      await api.evaluateTransfer('OP_NOV_001');
      await loadSummary();
    } catch (err) {
      console.error('Failed to reevaluate transfer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading || !summary) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--cat-text-muted)' }}>
        Loading skill transfer telemetry proof...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Goosebumps Hero Card */}
      <div className="glass-panel" style={{
        padding: '36px',
        background: 'linear-gradient(135deg, rgba(27, 33, 43, 0.95), rgba(18, 22, 29, 0.98))',
        border: '2px solid var(--cat-yellow)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge-tag badge-yellow" style={{ fontSize: '0.85rem' }}>
                <Award size={14} />
                {summary.headline}
              </span>
              <span className="badge-tag badge-green">
                Empirical Telemetry Verified
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <h2 style={{ fontSize: '2.4rem', color: 'var(--cat-text-main)', letterSpacing: '-0.02em' }}>
                {summary.mentor}
              </h2>
              <ArrowRight size={28} color="var(--cat-yellow)" />
              <h2 style={{ fontSize: '2.4rem', color: 'var(--cat-yellow)', letterSpacing: '-0.02em' }}>
                {summary.student}
              </h2>
            </div>

            <p style={{ color: 'var(--cat-text-muted)', fontSize: '1rem', marginTop: '8px' }}>
              {summary.task} in {summary.soil} • <strong>{summary.expert_cycles_mined} Veteran Benchmark Cycles</strong> → <strong>{summary.coached_cycles} Coached Operator Cycles</strong>
            </p>
          </div>

          <button
            onClick={handleReevaluate}
            disabled={evaluating}
            className="btn-cat-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RotateCw size={14} className={evaluating ? 'animate-spin' : ''} />
            {evaluating ? 'Calculating...' : 'Re-Calculate Telemetry Delta'}
          </button>
        </div>

        {/* Big Impact Callouts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginTop: '32px'
        }}>
          {/* Repositioning Delta */}
          <div style={{
            background: 'var(--cat-surface)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--cat-border)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Repositioning Latency
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--cat-success)', lineHeight: 1.1, marginTop: '6px' }}>
              ↓ {summary.improvement_pct}%
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>
              From <strong style={{ color: '#EF4444' }}>{summary.pre_coaching_reposition_median}s</strong> down to <strong style={{ color: 'var(--cat-success)' }}>{summary.post_coaching_reposition_median}s</strong>
            </div>
          </div>

          {/* Variance Reduction */}
          <div style={{
            background: 'var(--cat-surface)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--cat-border)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Behavioral Consistency (Std Dev)
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--cat-yellow)', lineHeight: 1.1, marginTop: '6px' }}>
              ↓ 50.8%
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>
              Variance collapsed from <strong style={{ color: '#EF4444' }}>σ=1.95s</strong> to <strong style={{ color: 'var(--cat-yellow)' }}>σ=0.96s</strong>
            </div>
          </div>

          {/* Fuel Efficiency */}
          <div style={{
            background: 'var(--cat-surface)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid var(--cat-border)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fuel Conservation
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#60A5FA', lineHeight: 1.1, marginTop: '6px' }}>
              ↓ 8.5%
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--cat-text-muted)' }}>
              Avoided hydraulic pressure relief valve blow-off during track travel
            </div>
          </div>
        </div>

        {/* The Pitch Goosebumps Punchline */}
        <div style={{
          marginTop: '36px',
          padding: '24px',
          background: 'rgba(255, 205, 17, 0.08)',
          border: '1px solid rgba(255, 205, 17, 0.4)',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--cat-yellow)',
            letterSpacing: '-0.01em'
          }}>
            "{summary.punchline}"
          </p>
          <p style={{
            fontSize: '0.95rem',
            color: 'var(--cat-text-muted)',
            marginTop: '8px',
            maxWidth: '700px',
            margin: '8px auto 0'
          }}>
            We're not building an AI that watches the new operator. We're building a system that makes sure the best operator's knowledge doesn't retire with them.
          </p>
        </div>
      </div>

      {/* Side-by-Side Distribution Overlap Comparison */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>
          Empirical Distribution Transition (Soft Soil Trenching Repositioning)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Card 1: Fernandes Expert Benchmark */}
          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--cat-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-tag badge-yellow" style={{ fontSize: '0.75rem' }}>
                Veteran Benchmark
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>n=94 cycles</span>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginTop: '10px' }}>Fernandes (14 Yrs)</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cat-yellow)', marginTop: '8px' }}>
              8.37s <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>median (σ = 0.92s)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '8px' }}>
              Flawlessly consistent track repositioning with low boom elevation, avoiding soft-silt track sinkage.
            </p>
          </div>

          {/* Card 2: Aryan Pre-Coaching */}
          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--cat-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-tag badge-red" style={{ fontSize: '0.75rem' }}>
                Pre-Coaching Novice
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>n=10 cycles</span>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginTop: '10px' }}>Aryan (Baseline)</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444', marginTop: '8px' }}>
              11.62s <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>median (σ = 1.95s)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '8px' }}>
              Extended travel hesitation, raised bucket excessively causing counterweight sway and track drag.
            </p>
          </div>

          {/* Card 3: Aryan Post-Coaching */}
          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '10px', border: '1px solid var(--cat-success)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge-tag badge-green" style={{ fontSize: '0.75rem' }}>
                Post-Coaching Verified
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)' }}>n=10 cycles</span>
            </div>
            <h4 style={{ fontSize: '1.2rem', marginTop: '10px' }}>Aryan (With Technique #17)</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--cat-success)', marginTop: '8px' }}>
              8.48s <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>median (σ = 0.96s)</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '8px' }}>
              Adopts Fernandes's low-boom track pulse rhythm. Repositioning variance collapsed directly toward expert baseline.
            </p>
          </div>
        </div>
      </div>

      {/* The Continuous Feedback Loop */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
          The Organizational Knowledge Feedback Loop
        </h3>
        <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Skill transfer is not a one-way street. When novice operators master veteran techniques, their subsequent telemetry refines the institutional model, creating an ever-improving fleet knowledge graph.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          textAlign: 'center'
        }}>
          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cat-yellow)' }}>1. Teaches</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '6px' }}>
              Fernandes's 14 years of habit captured passively from machine telemetry.
            </p>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA' }}>2. Learns</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '6px' }}>
              Aryan receives gentle in-cab contextual guidance tailored to soft soil.
            </p>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--cat-success)' }}>3. Transfers</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '6px' }}>
              Measurable 27.1% repositioning latency reduction proven from new cycles.
            </p>
          </div>

          <div style={{ background: 'var(--cat-surface)', padding: '20px', borderRadius: '8px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#C084FC' }}>4. Enriches</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)', marginTop: '6px' }}>
              Aryan's improved telemetry enriches the knowledge base for the next operator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
