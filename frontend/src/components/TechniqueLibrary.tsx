import React, { useState, useEffect } from 'react';
import { Layers, ChevronRight, ArrowUpRight } from 'lucide-react';
import { api, Technique } from '../services/api';
import { TechniqueDetailModal } from './TechniqueDetailModal';

interface TechniqueLibraryProps {
  onOpenModalRef?: React.MutableRefObject<((techId?: string) => void) | null>;
  onCloseModalRef?: React.MutableRefObject<(() => void) | null>;
}

export const TechniqueLibrary: React.FC<TechniqueLibraryProps> = ({
  onOpenModalRef,
  onCloseModalRef
}) => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterTask, setFilterTask] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);

  useEffect(() => {
    async function fetchTechniques() {
      try {
        setLoading(true);
        const data = await api.getTechniques();
        setTechniques(data);
      } catch (err) {
        console.error('Failed to load techniques:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTechniques();
  }, []);

  // Expose modal handlers to AutoPilot
  useEffect(() => {
    if (onOpenModalRef) {
      onOpenModalRef.current = (techId = 'TECH_017') => {
        const found = techniques.find(t => t.technique_id === techId) || techniques[0];
        if (found) setSelectedTechnique(found);
      };
    }
    if (onCloseModalRef) {
      onCloseModalRef.current = () => {
        setSelectedTechnique(null);
      };
    }
  }, [techniques, onOpenModalRef, onCloseModalRef]);

  const filtered = filterTask === 'all'
    ? techniques
    : techniques.filter(t => t.task_type.toLowerCase() === filterTask.toLowerCase());

  const tech17 = techniques.find(t => t.technique_id === 'TECH_017');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title & Filter Header */}
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
              Unsupervised Knowledge Extraction
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--cat-text-muted)' }}>
              Total Mined: <strong style={{ color: 'var(--cat-yellow)' }}>{techniques.length} Techniques</strong>
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', marginTop: '6px' }}>
            Institutional Technique Library
          </h2>
          <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.9rem', maxWidth: '720px' }}>
            Derived from statistical pattern mining across veteran operator telemetry. No techniques are hardcoded; every practice is derived from statistical phase advantages and confirmed across dozens of cycles.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['all', 'trenching', 'excavation'].map((task) => (
            <button
              key={task}
              onClick={() => setFilterTask(task)}
              className={filterTask === task ? 'btn-cat-primary' : 'btn-cat-secondary'}
              style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}
            >
              {task}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Star Card: Technique #17 (Fernandes) */}
      {tech17 && (
        <div
          onClick={() => setSelectedTechnique(tech17)}
          className="glass-panel"
          style={{
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(35, 42, 54, 0.95), rgba(20, 24, 32, 0.95))',
            border: '2px solid var(--cat-yellow)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Radiant Gold Corner Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(255, 205, 17, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge-tag badge-yellow" style={{ fontSize: '0.8rem' }}>
                  ★ Core Demo Signature: Technique #17
                </span>
                <span className="badge-tag badge-blue">
                  {tech17.task_type.toUpperCase()} • {tech17.soil_condition.toUpperCase()} SOIL
                </span>
                <span className="badge-tag badge-green">
                  {tech17.cycle_sample_count} Benchmark Cycles
                </span>
              </div>

              <h3 style={{ fontSize: '1.65rem', color: 'var(--cat-text-main)', marginTop: '4px' }}>
                {tech17.title}
              </h3>

              <p style={{ fontSize: '0.95rem', color: 'var(--cat-text-muted)', marginTop: '8px', maxWidth: '800px', lineHeight: 1.5 }}>
                {tech17.summary}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--cat-success)', lineHeight: 1 }}>
                +{tech17.advantage_pct}%
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', marginTop: '4px' }}>
                Repositioning Speed Gain
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--cat-yellow)', fontWeight: 600, marginTop: '2px' }}>
                {tech17.technique_duration}s vs {tech17.baseline_cohort_duration}s baseline
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--cat-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span>Author: <strong style={{ color: 'var(--cat-text-main)' }}>{tech17.author_name} (14 Yrs Veteran)</strong></span>
              <span>Repeatability: <strong style={{ color: 'var(--cat-yellow)' }}>94% Consistency</strong></span>
              <span>Phase Focus: <strong style={{ color: '#60A5FA' }}>REPOSITION</strong></span>
            </div>

            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cat-yellow)', fontWeight: 600 }}>
              View Empirical Telemetry Evidence <ChevronRight size={16} />
            </span>
          </div>
        </div>
      )}

      {/* Grid of All Other Discovered Techniques */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {filtered.map((tech) => (
          <div
            key={tech.technique_id}
            onClick={() => setSelectedTechnique(tech)}
            className="glass-panel"
            style={{
              padding: '22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: tech.technique_id === 'TECH_017' ? '1px solid var(--cat-yellow)' : '1px solid var(--cat-border)'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge-tag badge-yellow" style={{ fontSize: '0.7rem' }}>
                    {tech.technique_id}
                  </span>
                  <span className="badge-tag badge-blue" style={{ fontSize: '0.7rem' }}>
                    {tech.task_type}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--cat-success)' }}>
                    +{tech.advantage_pct}%
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--cat-text-muted)' }}>
                    Phase: {tech.primary_phase}
                  </span>
                </div>
              </div>

              <h4 style={{ fontSize: '1.15rem', color: 'var(--cat-text-main)', marginBottom: '8px' }}>
                {tech.title}
              </h4>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--cat-text-muted)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {tech.summary}
              </p>
            </div>

            <div style={{
              marginTop: '18px',
              paddingTop: '12px',
              borderTop: '1px solid var(--cat-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem'
            }}>
              <span style={{ color: 'var(--cat-text-muted)' }}>
                Author: <strong style={{ color: 'var(--cat-text-main)' }}>{tech.author_name}</strong> ({tech.cycle_sample_count} cycles)
              </span>

              <span style={{ color: 'var(--cat-yellow)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                Details <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedTechnique && (
        <TechniqueDetailModal
          technique={selectedTechnique}
          onClose={() => setSelectedTechnique(null)}
        />
      )}
    </div>
  );
};
