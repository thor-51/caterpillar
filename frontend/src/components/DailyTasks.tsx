import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, Sparkles, TrendingDown, Fuel, ArrowRight, Gauge } from 'lucide-react';
import { api, DailyTask, TaskEstimateResponse } from '../services/api';

export const DailyTasks: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estimator Form State
  const [taskType, setTaskType] = useState<string>('trenching');
  const [soilCondition, setSoilCondition] = useState<string>('soft');
  const [loadCondition, setLoadCondition] = useState<string>('medium');
  const [targetUnits, setTargetUnits] = useState<number>(120);
  const [weatherCondition, setWeatherCondition] = useState<string>('dry');
  const [operatorProfile, setOperatorProfile] = useState<string>('coached_technique_17');

  const [estimate, setEstimate] = useState<TaskEstimateResponse | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const data = await api.getDailyTasks();
        setTasks(data);
      } catch (err) {
        console.error('Failed to load daily tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const calculateEstimate = async () => {
    try {
      setEstimating(true);
      const res = await api.estimateTaskTime({
        task_type: taskType,
        soil_condition: soilCondition,
        load_condition: loadCondition,
        target_units: targetUnits,
        weather_condition: weatherCondition,
        operator_profile: operatorProfile
      });
      setEstimate(res);
    } catch (err) {
      console.error('Failed to estimate task time:', err);
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    calculateEstimate();
  }, [taskType, soilCondition, loadCondition, targetUnits, weatherCondition, operatorProfile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }} className="tab-enter">
      {/* Title & Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-tag badge-gold">
            Operator Daily Shift Dispatch
          </span>
          <span style={{ fontSize: '0.82rem', color: 'var(--cat-text-muted)' }}>
            Operator: <strong style={{ color: 'var(--cat-text-main)' }}>Aryan (EXC001, CAT 320 GC)</strong>
          </span>
        </div>
        <h2 style={{ fontSize: '1.8rem', marginTop: '6px' }}>
          Daily Task Schedule & Predictive Time Estimator
        </h2>
        <p style={{ color: 'var(--cat-text-muted)', fontSize: '0.9rem', maxWidth: '780px' }}>
          Real-time task dispatching coupled with Bayesian empirical time estimation derived from historical cycles, soil mechanics, and veteran operator techniques.
        </p>
      </div>

      {/* Task Schedule Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        {tasks.map(task => (
          <div
            key={task.task_id}
            className="glass-panel"
            style={{
              padding: '24px',
              borderLeft: task.status === 'IN_PROGRESS' ? '4px solid var(--cat-gold)' : '1px solid var(--cat-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge-tag badge-gold" style={{ fontSize: '0.68rem' }}>
                  {task.task_id}
                </span>

                <span className={task.status === 'IN_PROGRESS' ? 'badge-tag badge-cyan animate-pulse-glow' : 'badge-tag badge-yellow'} style={{ fontSize: '0.68rem' }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--cat-text-main)', marginBottom: '8px' }}>
                {task.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: 'var(--cat-text-muted)' }}>
                <div>Sector: <strong style={{ color: 'var(--cat-text-main)' }}>{task.sector}</strong></div>
                <div>Condition: <strong style={{ color: '#70A1FF', textTransform: 'capitalize' }}>{task.soil_condition} soil</strong> ({task.load_condition} payload)</div>
                {task.target_distance_m && (
                  <div>Target Length: <strong style={{ color: 'var(--cat-gold)' }}>{task.target_distance_m} meters</strong></div>
                )}
                {task.target_volume_m3 && (
                  <div>Target Volume: <strong style={{ color: 'var(--cat-gold)' }}>{task.target_volume_m3} m³</strong></div>
                )}
              </div>
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
              <div>
                <span style={{ color: 'var(--cat-text-dim)' }}>Start: </span>
                <strong style={{ color: 'var(--cat-text-main)' }}>{task.scheduled_start}</strong>
                <span style={{ margin: '0 6px', color: 'var(--cat-border)' }}>|</span>
                <span style={{ color: 'var(--cat-text-dim)' }}>Est: </span>
                <strong style={{ color: 'var(--cat-gold)' }}>{task.estimated_duration_hours}h</strong>
              </div>

              {task.technique_recommended && (
                <span className="badge-tag badge-green" style={{ fontSize: '0.65rem' }}>
                  ✓ {task.technique_recommended.split(' ')[0]}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Predictive Task Time Estimation Engine */}
      <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--cat-border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge-tag badge-cyan">
                Machine Learning Predictor
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--cat-text-muted)' }}>
                Empirical Calibration: 384 Cycles Min-Max Distribution
              </span>
            </div>
            <h3 style={{ fontSize: '1.45rem', marginTop: '6px' }}>
              Environmental & Contextual Task Time Estimator
            </h3>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)' }}>
            Predictive Model: <strong style={{ color: 'var(--cat-gold)' }}>CAT-Legacy Bayesian Gamma Model (p &lt; 0.001)</strong>
          </div>
        </div>

        {/* Input Parameters Form */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Task Type
            </label>
            <select
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--cat-surface)',
                border: '1px solid var(--cat-border)',
                color: 'var(--cat-text-main)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="trenching">Trenching (Meters)</option>
              <option value="excavation">Bulk Excavation (m³)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Target Units ({taskType === 'trenching' ? 'Meters' : 'm³'})
            </label>
            <input
              type="number"
              value={targetUnits}
              onChange={e => setTargetUnits(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'var(--cat-surface)',
                border: '1px solid var(--cat-border)',
                color: 'var(--cat-gold)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Geological Soil Condition
            </label>
            <select
              value={soilCondition}
              onChange={e => setSoilCondition(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--cat-surface)',
                border: '1px solid var(--cat-border)',
                color: 'var(--cat-text-main)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="soft">Soft Silt / Mud (High Track Sinkage)</option>
              <option value="medium">Medium Clay / Loam</option>
              <option value="hard">Hard Rocky Caliche (High Tooth Wear)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--cat-text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
              Weather & Ground Moisture
            </label>
            <select
              value={weatherCondition}
              onChange={e => setWeatherCondition(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--cat-surface)',
                border: '1px solid var(--cat-border)',
                color: 'var(--cat-text-main)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '0.85rem'
              }}
            >
              <option value="dry">Dry / Compact</option>
              <option value="damp">Damp / High Moisture</option>
              <option value="waterlogged">Waterlogged / Saturated Silt</option>
            </select>
          </div>
        </div>

        {/* Prediction Results Comparison Callout */}
        {estimate && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(27, 36, 50, 0.9), rgba(16, 20, 28, 0.95))',
            border: '1px solid var(--cat-gold)',
            borderRadius: '10px',
            padding: '28px',
            position: 'relative'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              textAlign: 'center'
            }}>
              {/* Baseline Duration */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                  Baseline Novice Unassisted
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--cat-danger)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {estimate.baseline_hours} <span style={{ fontSize: '1.1rem' }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', marginTop: '4px' }}>
                  Fuel Est: <strong style={{ color: 'var(--cat-danger)' }}>{estimate.baseline_fuel_liters} L</strong>
                </div>
              </div>

              {/* Coached Duration */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-text-muted)', textTransform: 'uppercase' }}>
                  Coached with Technique #17
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--cat-success)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  {estimate.coached_hours} <span style={{ fontSize: '1.1rem' }}>hrs</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--cat-text-muted)', marginTop: '4px' }}>
                  Fuel Est: <strong style={{ color: 'var(--cat-success)' }}>{estimate.coached_fuel_liters} L</strong>
                </div>
              </div>

              {/* Net Savings */}
              <div style={{ background: 'rgba(245, 166, 35, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(245, 166, 35, 0.3)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-gold)', textTransform: 'uppercase', fontWeight: 800 }}>
                  Productivity Net Gain
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--cat-gold)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                  ↓ {estimate.time_saved_pct}%
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--cat-text-main)', marginTop: '4px' }}>
                  Saves <strong style={{ color: 'var(--cat-gold)' }}>{estimate.time_saved_hours} hrs</strong> & <strong style={{ color: 'var(--cat-radar)' }}>{estimate.fuel_saved_liters} L Fuel</strong>
                </div>
              </div>
            </div>

            {/* Visual Shift Productivity Timeline Comparison */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'var(--cat-surface)',
              borderRadius: '8px',
              border: '1px solid var(--cat-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--cat-text-muted)' }}>Estimated Shift Hours Comparison</span>
                  <span style={{ color: 'var(--cat-gold)', fontWeight: 700 }}>
                    {estimate.coached_hours}h coached vs {estimate.baseline_hours}h baseline (-{estimate.time_saved_pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255, 56, 56, 0.25)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${Math.round((estimate.coached_hours / estimate.baseline_hours) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--cat-gold) 0%, var(--cat-success) 100%)',
                    borderRadius: '5px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--cat-text-muted)' }}>Predicted Fuel Burn</span>
                  <span style={{ color: 'var(--cat-radar)', fontWeight: 700 }}>
                    {estimate.coached_fuel_liters}L vs {estimate.baseline_fuel_liters}L (Saves {estimate.fuel_saved_liters}L)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(56, 103, 214, 0.25)', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    width: `${Math.round((estimate.coached_fuel_liters / estimate.baseline_fuel_liters) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #70A1FF 0%, var(--cat-radar) 100%)',
                    borderRadius: '5px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} />
                </div>
              </div>
            </div>

            {/* Scientific Rationale Note */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--cat-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.82rem'
            }}>
              <div style={{ color: 'var(--cat-text-muted)', maxWidth: '750px' }}>
                <strong style={{ color: 'var(--cat-gold)' }}>Model Rationale: </strong>
                {estimate.rationale}
              </div>

              <span className="badge-tag badge-cyan">
                {estimate.confidence_interval_95}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
